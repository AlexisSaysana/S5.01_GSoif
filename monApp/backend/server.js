const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require("axios");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { calculateHydrationGoal } = require('./utils/hydrationAI');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🔒 Middleware d'authentification JWT
const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

// 🔒 A02:2025 - Security Misconfiguration : Clé API sécurisée
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

const app = express();

// 🔒 A02:2025 - Security Misconfiguration : Headers de sécurité
app.use(helmet());

// 🔒 A02:2025 - Security Misconfiguration : CORS restreint
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://localhost:19006', // Expo
    'http://localhost:19000'  // Expo
];
app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origin (mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json());

// 🔒 A07:2025 - Authentication Failures : Rate limiting global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes max
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(globalLimiter);

// 🔒 A07:2025 - Authentication Failures : Rate limiting authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    skipSuccessfulRequests: true,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
});

// --------------------------------------
// 🔥 Connexion MySQL via POOL (PROMISE)
// --------------------------------------
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins/mysql_native_password')
    }
}).promise();

// Test de connexion
(async () => {
    try {
        const conn = await db.getConnection();
        console.log("✅ Connexion MySQL réussie !");
        conn.release();
    } catch (err) {
        console.error("❌ Erreur de connexion MySQL :", err);
    }
})();

// --------------------------------------
// ROUTES
// --------------------------------------

// Route test
app.get('/', (req, res) => {
    return res.json("Backend opérationnel !");
});

// --------------------------------------
// 👤 Récupérer tous les utilisateurs
// --------------------------------------
app.get('/utilisateurs', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM utilisateur");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Erreur SQL", details: err });
    }
});

// --------------------------------------
// 👤 INSCRIPTION
// --------------------------------------
app.post('/utilisateurs', 
    authLimiter,
    // 🔒 A05:2025 - Injection : Validation des entrées
    [
        body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
        body('nom').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Nom invalide'),
        body('prenom').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Prénom invalide'),
        // 🔒 A07:2025 - Authentication Failures : Politique de mot de passe fort
        body('mot_de_passe')
            .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Le mot de passe doit contenir: majuscule, minuscule, chiffre et caractère spécial')
    ],
    async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Données invalides', 
            details: errors.array().map(e => e.msg) 
        });
    }

    const { email, nom, prenom, mot_de_passe } = req.body;

    try {
        const hash = await bcrypt.hash(mot_de_passe, 12); // Augmenté à 12 rounds

        const sql = "INSERT INTO utilisateur (email, nom, prenom, mot_de_passe) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(sql, [email, nom, prenom, hash]);

        return res.status(201).json({
            message: "Utilisateur ajouté avec succès",
            utilisateur: {
                id: result.insertId,
                email,
                nom,
                prenom
            }
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email déjà utilisé" });
        }
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🔐 LOGIN
// --------------------------------------
app.post('/login', 
    authLimiter,
    // 🔒 A05:2025 - Injection : Validation
    [
        body('email').isEmail().normalizeEmail(),
        body('mot_de_passe').notEmpty()
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Données invalides" });
    }

    const { email, mot_de_passe } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM utilisateur WHERE email = ?", [email]);

        if (rows.length === 0) {
            // 🔒 A10:2025 - Mishandling of Exceptional Conditions : Message générique
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const utilisateur = rows[0];
        const match = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

        if (!match) {
            // 🔒 A10:2025 - Mishandling of Exceptional Conditions : Message générique
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // 🔒 A01:2025 - Broken Access Control : Génération JWT
        const token = jwt.sign(
            { 
                id: utilisateur.id_utilisateur, 
                email: utilisateur.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 🔒 A09:2025 - Security Logging : Log sécurisé (sans mot de passe)
        console.log(`✅ Connexion réussie pour: ${email}`);

        return res.json({
            message: "Connexion réussie",
            token,
            utilisateur: {
                id: utilisateur.id_utilisateur,
                email: utilisateur.email,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom
            }
        });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 👤 Récupérer un utilisateur par email
// --------------------------------------
app.get('/utilisateurs/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const [rows] = await db.query("SELECT * FROM utilisateur WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// ✏️ Modifier un utilisateur
// --------------------------------------
app.put('/utilisateurs/:email', async (req, res) => {
    const email = req.params.email;
    const { nom, prenom, email: newEmail } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE email = ?",
            [nom, prenom, newEmail, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.json({ message: "Utilisateur mis à jour avec succès" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🔐 Changer le mot de passe
// --------------------------------------
app.put('/utilisateurs/:email/motdepasse', async (req, res) => {
    const email = req.params.email;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    try {
        const [rows] = await db.query(
            "SELECT mot_de_passe FROM utilisateur WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }

        const match = await bcrypt.compare(oldPassword, rows[0].mot_de_passe);
        if (!match) {
            return res.status(400).json({ error: "Ancien mot de passe incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await db.query(
            "UPDATE utilisateur SET mot_de_passe = ? WHERE email = ?",
            [newHash, email]
        );

        return res.json({ message: "Mot de passe mis à jour !" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});
// --------------------------------------
// 🔔 Notification aléatoire
// --------------------------------------
app.get('/notification/random/:id_utilisateur', async (req, res) => {
    const id = req.params.id_utilisateur;

    const sql = `
        SELECT message
        FROM notification
        WHERE id_utilisateur = ? OR id_utilisateur IS NULL
        ORDER BY RAND()
        LIMIT 1
    `;

    try {
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Aucun message trouvé" });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: "Erreur SQL" });
    }
});

// --------------------------------------
// ⭐ Enregistrer les horaires fixes (ancienne version)
// --------------------------------------
app.post('/preferences/horaires', async (req, res) => {
    const { id_utilisateur, horaires } = req.body;

    if (!id_utilisateur || !horaires) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const values = horaires.map(h => [
        id_utilisateur,
        null,
        h.heure,
        h.heure,
        1
    ]);

    const sql = `
        INSERT INTO preferences (id_utilisateur, intervalle_heures, heure_debut, heure_fin, actif)
        VALUES ?
    `;

    try {
        const [result] = await db.query(sql, [values]);
        return res.json({ message: "Horaires enregistrés", inserted: result.affectedRows });

    } catch (err) {
        return res.status(500).json({ error: "Erreur SQL" });
    }
});

// --------------------------------------
// ⭐ Récupérer les horaires fixes
// --------------------------------------
app.get('/preferences/horaires/:id_utilisateur', async (req, res) => {
    const id = req.params.id_utilisateur;

    const sql = `
        SELECT heure_debut
        FROM preferences
        WHERE id_utilisateur = ? AND actif = 1 AND heure_debut = heure_fin
        ORDER BY heure_debut ASC
    `;

    try {
        const [rows] = await db.query(sql, [id]);
        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: "Erreur SQL" });
    }
});

// --------------------------------------
// ⭐ Enregistrer les horaires fixes (nouvelle version)
// --------------------------------------
app.post('/notification/preferences/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { fixedTimes } = req.body;

    if (!fixedTimes || !Array.isArray(fixedTimes)) {
        return res.status(400).json({ error: "fixedTimes manquant ou invalide" });
    }

    const sql = `
        INSERT INTO horaires_notifications (id_utilisateur, fixed_times, actif)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE
            fixed_times = VALUES(fixed_times),
            actif = 1
    `;

    try {
        await db.query(sql, [userId, JSON.stringify(fixedTimes)]);
        return res.json({ message: "Horaires enregistrés avec succès", saved: true });

    } catch (err) {
        return res.status(500).json({ error: "Erreur SQL", details: err });
    }
});

// --------------------------------------
// ⭐ Récupérer les horaires fixes (nouvelle version)
// --------------------------------------
app.get('/notification/preferences/:userId', async (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT fixed_times
        FROM horaires_notifications
        WHERE id_utilisateur = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;

    try {
        const [rows] = await db.query(sql, [userId]);

        if (rows.length === 0) {
            return res.json({ fixed_times: [] });
        }

        return res.json({
            fixed_times: JSON.parse(rows[0].fixed_times || "[]")
        });

    } catch (err) {
        return res.status(500).json({ error: "Erreur SQL" });
    }
});

// --------------------------------------
// 🗑️ Supprimer un utilisateur
// --------------------------------------
app.delete('/utilisateurs/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const [result] = await db.query("DELETE FROM utilisateur WHERE email = ?", [email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.json({ message: "Compte supprimé avec succès" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🏞️ Récupérer historique fontaines
// --------------------------------------
app.get('/historique/:email', async (req, res) => {
    const sql = "SELECT * FROM historique WHERE email = ? ORDER BY date DESC";

    try {
        const [rows] = await db.query(sql, [req.params.email]);
        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🗑️ Supprimer un item d'historique
// --------------------------------------
app.delete('/historique/item/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM historique WHERE id = ?", [req.params.id]);
        return res.json({ message: "Supprimé" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🗑️ Supprimer tout l'historique d'un utilisateur
// --------------------------------------
app.delete('/historique/user/:email', async (req, res) => {
    try {
        await db.query("DELETE FROM historique WHERE email = ?", [req.params.email]);
        return res.json({ message: "Historique supprimé avec succès" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// ➕ Ajouter un item dans l'historique
// --------------------------------------
app.post('/historique', async (req, res) => {
    const { email, name, location, latitude, longitude, date } = req.body;

    const sql = `
        INSERT INTO historique (email, name, location, latitude, longitude, date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await db.query(sql, [email, name, location, latitude, longitude, date]);
        return res.json({ message: "Historique ajouté" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 📊 Récupérer les stats d’un utilisateur
// --------------------------------------
app.get('/stats/:email', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM user_stats WHERE email = ?", [req.params.email]);

        if (rows.length === 0) {
            return res.json({ clickCount: 0, hydrationCount: 0 });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// ➕ Incrémenter clickCount
// --------------------------------------
app.put('/stats/click/:email', async (req, res) => {
    const email = req.params.email;

    const sql = `
        INSERT INTO user_stats (email, clickCount)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE clickCount = clickCount + 1
    `;

    try {
        await db.query(sql, [email]);
        return res.json({ message: "ClickCount mis à jour" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🏅 Récupérer les badges d’un utilisateur
// --------------------------------------
app.get('/badges/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const [rows] = await db.query(
            "SELECT badge_id, unlocked_at FROM badges WHERE email = ?",
            [email]
        );

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// --------------------------------------
// 🏅 Enregistrer un badge
// --------------------------------------
app.post('/badges', async (req, res) => {
    const { email, badge_id } = req.body;

    if (!email || !badge_id) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    const sql = `
        INSERT INTO badges (email, badge_id, unlocked_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE unlocked_at = unlocked_at
    `;

    try {
        await db.query(sql, [email, badge_id]);
        return res.json({ message: "Badge enregistré" });

    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});
// --------------------------------------
// 🧠 GET profil IA d’un utilisateur
// --------------------------------------
app.get('/profile/:id_utilisateur', async (req, res) => {
    const { id_utilisateur } = req.params;

    const sql = `
        SELECT * FROM user_profile
        WHERE id_utilisateur = ?
    `;

    try {
        const [rows] = await db.query(sql, [id_utilisateur]);

        if (rows.length === 0) {
            return res.status(200).json(null); // pas encore de profil
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// --------------------------------------
// 🧠 POST mise à jour des infos perso
// --------------------------------------
app.post('/profile/update', async (req, res) => {
    const { id_utilisateur, age, sexe, taille, poids } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM user_profile WHERE id_utilisateur = ?",
            [id_utilisateur]
        );

        if (rows.length === 0) {
            // INSERT
            await db.query(
                `INSERT INTO user_profile (id_utilisateur, age, sexe, taille, poids)
                 VALUES (?, ?, ?, ?, ?)`,
                [id_utilisateur, age, sexe, taille, poids]
            );
            return res.json({ message: 'Profil créé' });
        }

        // UPDATE
        await db.query(
            `UPDATE user_profile
             SET age = ?, sexe = ?, taille = ?, poids = ?
             WHERE id_utilisateur = ?`,
            [age, sexe, taille, poids, id_utilisateur]
        );

        return res.json({ message: 'Profil mis à jour' });

    } catch (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// --------------------------------------
// 🧠 POST recalcul de l’objectif IA
// --------------------------------------
app.post('/profile/calculate', async (req, res) => {
    console.log("📥 /profile/calculate appelé avec :", req.body);

    const { id_utilisateur } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM user_profile WHERE id_utilisateur = ?",
            [id_utilisateur]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Profil inexistant' });
        }

        const profile = rows[0];

        // 🌦️ Récupération météo : température MAX du jour
        const lat = 42.575;
        const lon = 2.076;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;

        let temperature_max = 20;

        try {
            const meteo = await axios.get(url);
            temperature_max = meteo.data.daily[0].temp.max;
        } catch (e) {
            console.log("❌ Erreur API météo :", e);
        }

        // 🔥 Calcul IA
        const objectif = calculateHydrationGoal({
            age: profile.age,
            sexe: profile.sexe,
            poids: profile.poids,
            temperature: temperature_max
        });

        const objectif_ml = Math.round(objectif * 1000);

        // 💾 Enregistrer objectif IA
        await db.query(
            "UPDATE user_profile SET objectif_ia = ? WHERE id_utilisateur = ?",
            [objectif_ml, id_utilisateur]
        );

        // 🔔 Génération des horaires IA
        const nbNotif = Math.floor(Math.random() * 4) + 4;
        const horaires = [];
        const start = 9;
        const end = 21;
        const interval = Math.floor((end - start) * 60 / nbNotif);

        for (let i = 0; i < nbNotif; i++) {
            const minutes = start * 60 + i * interval;
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            horaires.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        }

        const mlParNotif = Math.round(objectif_ml / nbNotif);

        const phrasesIA = [
            `Bon… j’ai décidé que tu recevras ${nbNotif} notifications aujourd’hui. Bois ${mlParNotif} ml à chaque fois.`,
            `J’ai fait mes calculs. Résultat : ${nbNotif} rappels. ${mlParNotif} ml chacun.`,
            `Breaking news : ${nbNotif} notifications aujourd’hui. À chaque fois, tu bois ${mlParNotif} ml.`,
            `Ton IA préférée a choisi ${nbNotif} rappels. Bois ${mlParNotif} ml à chaque fois.`
        ];

        const recommandation = phrasesIA[Math.floor(Math.random() * phrasesIA.length)];

        // 💾 Enregistrer les horaires IA
        await db.query(
            `INSERT INTO horaires_notifications (id_utilisateur, fixed_times, actif, created_at)
             VALUES (?, ?, 1, NOW())
             ON DUPLICATE KEY UPDATE fixed_times = VALUES(fixed_times), actif = 1, created_at = NOW()`,
            [id_utilisateur, JSON.stringify(horaires)]
        );

        return res.json({
            objectif,
            objectif_ml,
            explication: `Objectif basé sur ${profile.poids} kg, ${profile.sexe}, ${profile.age} ans et ${temperature_max}°C.`,
            temperature_max,
            nbNotif,
            mlParNotif,
            horaires,
            recommandation
        });

    } catch (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// --------------------------------------
// 💧 Ajouter une quantité d’eau
// --------------------------------------
// 🔒 A01:2025 - Broken Access Control : Route protégée
app.post("/hydration/add", authenticateToken, checkUserOwnership, async (req, res) => {
    const { id_utilisateur, amount_ml } = req.body;

    if (id_utilisateur == null || amount_ml == null) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const today = new Date().toISOString().split("T")[0];

    try {
        const [rows] = await db.query(
            "SELECT * FROM hydration_logs WHERE id_utilisateur = ? AND date = ?",
            [id_utilisateur, today]
        );

        if (rows.length === 0) {
            await db.query(
                "INSERT INTO hydration_logs (id_utilisateur, date, amount_ml, goal_reached) VALUES (?, ?, ?, ?)",
                [id_utilisateur, today, amount_ml, false]
            );
        } else {
            await db.query(
                "UPDATE hydration_logs SET amount_ml = amount_ml + ? WHERE id_utilisateur = ? AND date = ?",
                [amount_ml, id_utilisateur, today]
            );
        }

        return res.json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// --------------------------------------
// 💧 Récupérer la progression du jour
// --------------------------------------
// 🔒 A01:2025 - Broken Access Control : Route protégée
app.get("/hydration/today/:id", authenticateToken, async (req, res) => {
    const id = req.params.id;
    
    // Vérifier que l'utilisateur accède à ses propres données
    if (parseInt(id) !== parseInt(req.user.id)) {
        return res.status(403).json({ error: "Accès refusé" });
    }
    const today = new Date().toISOString().split("T")[0];

    try {
        const [rows] = await db.query(
            "SELECT * FROM hydration_logs WHERE id_utilisateur = ? AND date = ?",
            [id, today]
        );

        if (rows.length === 0) {
            return res.json({ amount_ml: 0, goal_reached: false });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// --------------------------------------
// 💧 Récupérer l’historique complet
// --------------------------------------
app.get("/hydration/history/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.query(
            "SELECT * FROM hydration_logs WHERE id_utilisateur = ? ORDER BY date DESC",
            [id]
        );

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

// --------------------------------------
// 💧 Marquer objectif atteint
// --------------------------------------
app.put("/hydration/goal-reached", async (req, res) => {
    const { id_utilisateur } = req.body;

    if (!id_utilisateur) {
        return res.status(400).json({ error: "Missing id_utilisateur" });
    }

    const today = new Date().toISOString().split("T")[0];

    try {
        await db.query(
            "UPDATE hydration_logs SET goal_reached = TRUE WHERE id_utilisateur = ? AND date = ?",
            [id_utilisateur, today]
        );

        return res.json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});



// --------------------------------------
// 💬 NOUVELLES ROUTES : COMMENTAIRES / AVIS
// --------------------------------------

// 1. Récupérer les avis d'une fontaine (Public)
app.get('/commentaires/:fountain_id', async (req, res) => {
    const { fountain_id } = req.params;
    const sql = `
        SELECT u.prenom as user, a.note as rating, a.commentaire as comment, a.created_at
        FROM avis a
        JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur
        WHERE a.fountain_id = ?
        ORDER BY a.created_at DESC
    `;
    try {
        const [rows] = await db.query(sql, [fountain_id]);
        res.json(rows);
    } catch (err) {
        console.error("Erreur GET avis:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des avis" });
    }
});

// 2. Ajouter un avis (Nécessite d'être connecté)
app.post('/commentaires', async (req, res) => {
    const { fountain_id, email, rating, comment } = req.body;

    if (!fountain_id || !email || !rating) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    try {
        // Trouver l'ID utilisateur à partir de l'email
        const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
        if (userRows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const id_utilisateur = userRows[0].id_utilisateur;

        const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire) VALUES (?, ?, ?, ?)";
        await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);

        res.status(201).json({ message: "Avis ajouté avec succès" });
    } catch (err) {
        console.error("Erreur POST avis:", err);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'avis" });
    }
});


// --------------------------------------
// 🚀 LANCEMENT SERVEUR
// --------------------------------------
const PORT = process.env.PORT || 8080;
console.log("PORT utilisé :", PORT);

app.listen(PORT, () => {
    console.log("🚀 Serveur lancé sur le port " + PORT);
});