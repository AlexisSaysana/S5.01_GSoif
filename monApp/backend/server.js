const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require("axios");

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { calculateHydrationGoal } = require('./utils/hydrationAI');
require('dotenv').config();
const WEATHER_API_KEY = "703b002e3b8de955c0ff503db47e689a";

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------
// 🔥 Connexion MySQL via POOL
// --------------------------------------
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erreur de connexion MySQL :", err);
    } else {
        console.log("✅ Connexion MySQL réussie !");
        connection.release();
    }
});

// --------------------------------------
// ROUTES
// --------------------------------------

// Route test
app.get('/', (req, res) => {
    return res.json("Backend opérationnel !");
});

// Récupérer tous les utilisateurs
app.get('/utilisateurs', (req, res) => {
    const sql = "SELECT * FROM utilisateur";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Erreur SQL", details: err });
        return res.json(data);
    });
});

// INSCRIPTION
app.post('/utilisateurs', async (req, res) => {
    const { email, nom, prenom, mot_de_passe } = req.body;

    const champsManquants = [];
    if (!email?.trim()) champsManquants.push("email");
    if (!nom?.trim()) champsManquants.push("nom");
    if (!prenom?.trim()) champsManquants.push("prenom");
    if (!mot_de_passe?.trim()) champsManquants.push("mot_de_passe");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            error: "Champs manquants",
            details: champsManquants
        });
    }

    try {
        const hash = await bcrypt.hash(mot_de_passe, 10);

        const sql = "INSERT INTO utilisateur (email, nom, prenom, mot_de_passe) VALUES (?, ?, ?, ?)";
        db.query(sql, [email, nom, prenom, hash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: "Email déjà utilisé" });
                }
                return res.status(500).json({ error: "Erreur serveur" });
            }

            return res.status(201).json({
                message: "Utilisateur ajouté avec succès",
                utilisateur: {
                    id: result.insertId,
                    email,
                    nom,
                    prenom
                }
            });
        });

    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
    }
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, mot_de_passe } = req.body;

    const champsManquants = [];
    if (!email?.trim()) champsManquants.push("email");
    if (!mot_de_passe?.trim()) champsManquants.push("mot_de_passe");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            error: "Champs manquants",
            details: champsManquants
        });
    }

    const sql = "SELECT * FROM utilisateur WHERE email = ?";
    db.query(sql, [email], async (err, data) => {

        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const utilisateur = data[0];

        try {
            const match = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

            if (!match) {
                return res.status(401).json({ error: "Mot de passe incorrect" });
            }

            return res.json({
                message: "Connexion réussie",
                utilisateur: {
                    id: utilisateur.id_utilisateur,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom
                }
            });

        } catch (error) {
            console.error("Erreur bcrypt :", error);
            return res.status(500).json({ error: "Erreur serveur" });
        }
    });
});

// --------------------------------------
// ⭐ AJOUT DES ROUTES MANQUANTES
// --------------------------------------

// Récupérer un utilisateur par email
app.get('/utilisateurs/:email', (req, res) => {
    const email = req.params.email;

    const sql = "SELECT * FROM utilisateur WHERE email = ?";
    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.json(data[0]);
    });
});

// Modifier un utilisateur
app.put('/utilisateurs/:email', (req, res) => {
    const email = req.params.email;
    const { nom, prenom, email: newEmail } = req.body;

    const sql = "UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE email = ?";
    db.query(sql, [nom, prenom, newEmail, email], (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.json({ message: "Utilisateur mis à jour avec succès" });
    });
});
// 🔐 Route pour changer le mot de passe
app.put('/utilisateurs/:email/motdepasse', (req, res) => {
  const email = req.params.email;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  // ✔ TABLE = utilisateur
  // ✔ COLONNE = mot_de_passe
  const sqlCheck = "SELECT mot_de_passe FROM utilisateur WHERE email = ?";
  db.query(sqlCheck, [email], async (err, results) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const currentPasswordHash = results[0].mot_de_passe;

    // ✔ Vérification bcrypt
    const match = await bcrypt.compare(oldPassword, currentPasswordHash);
    if (!match) {
      return res.status(400).json({ error: "Ancien mot de passe incorrect" });
    }

    // ✔ Hash du nouveau mot de passe
    const newHash = await bcrypt.hash(newPassword, 10);

    const sqlUpdate = "UPDATE utilisateur SET mot_de_passe = ? WHERE email = ?";
    db.query(sqlUpdate, [newHash, email], (err) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur lors de la mise à jour" });
      }

      return res.json({ message: "Mot de passe mis à jour !" });
    });
  });
});
app.get('/notification/random/:id_utilisateur', (req, res) => {
  const id = req.params.id_utilisateur;

  const sql = `
    SELECT message 
    FROM notification 
    WHERE id_utilisateur = ? OR id_utilisateur IS NULL
    ORDER BY RAND()
    LIMIT 1
  `;

  db.query(sql, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "Erreur SQL" });
    if (data.length === 0) return res.status(404).json({ error: "Aucun message trouvé" });
    return res.json(data[0]);
  });
});
// --------------------------------------
// ⭐ ROUTE : Enregistrer les horaires fixes
// --------------------------------------
app.post('/preferences/horaires', (req, res) => {
  const { id_utilisateur, horaires } = req.body;

  if (!id_utilisateur || !Array.isArray(horaires)) {
    return res.status(400).json({ error: "Champs manquants ou format invalide" });
  }

  const values = horaires.map(h => [
    id_utilisateur,
    null,              // intervalle_heures
    h.heure,           // heure_debut
    h.heure,           // heure_fin
    1                  // actif
  ]);

  const sql = `
    INSERT INTO preferences (id_utilisateur, intervalle_heures, heure_debut, heure_fin, actif)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("❌ Erreur SQL insertion horaires :", err);
      return res.status(500).json({ error: "Erreur SQL" });
    }

    return res.json({ message: "Horaires enregistrés", inserted: result.affectedRows });
  });
});
// --------------------------------------
// ⭐ ROUTE : Récupérer les horaires fixes
// --------------------------------------
app.get('/preferences/horaires/:id_utilisateur', (req, res) => {
  const id = req.params.id_utilisateur;

  const sql = `
    SELECT heure_debut 
    FROM preferences 
    WHERE id_utilisateur = ? AND actif = 1 AND heure_debut = heure_fin
    ORDER BY heure_debut ASC
  `;

  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("❌ Erreur SQL récupération horaires :", err);
      return res.status(500).json({ error: "Erreur SQL" });
    }

    return res.json(data);
  });
});
// --------------------------------------
// ⭐ ROUTE : Enregistrer les horaires fixes (NOUVELLE VERSION)
// --------------------------------------
app.post('/notification/preferences/:userId', (req, res) => {
  const userId = req.params.userId;
  const { fixedTimes } = req.body;

  if (!fixedTimes || !Array.isArray(fixedTimes)) {
    return res.status(400).json({ error: "fixedTimes manquant ou invalide" });
  }

  console.log("📥 Données reçues :", { userId, fixedTimes });

  const sql = `
    INSERT INTO horaires_notifications (id_utilisateur, fixed_times, actif)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE
      fixed_times = VALUES(fixed_times),
      actif = 1
  `;

  db.query(
    sql,
    [userId, JSON.stringify(fixedTimes)],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur SQL", details: err });
      }

      return res.json({
        message: "Horaires enregistrés avec succès",
        saved: true
      });
    }
  );
});
// --------------------------------------
// ⭐ ROUTE : Récupérer les horaires fixes
// --------------------------------------
app.get('/notification/preferences/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT fixed_times
    FROM horaires_notifications
    WHERE id_utilisateur = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) {
      console.error("❌ Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur SQL" });
    }

    if (data.length === 0) {
      return res.json({ fixed_times: [] });
    }

    return res.json({
      fixed_times: JSON.parse(data[0].fixed_times || "[]")
    });
  });
});
// SUPPRESSION DE COMPTE
app.delete('/utilisateurs/:email', (req, res) => {
  const email = req.params.email;

  const sql = "DELETE FROM utilisateur WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    return res.json({ message: "Compte supprimé avec succès" });
  });
});
//Récuper historique fontaines
app.get('/historique/:email', (req, res) => {
  const sql = "SELECT * FROM historique WHERE email = ? ORDER BY date DESC";
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(result);
  });
});
// Supprimer un seul item d'historique
app.delete('/historique/item/:id', (req, res) => {
  const sql = "DELETE FROM historique WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ message: "Supprimé" });
  });
});
// Supprimer tout l'historique
app.delete('/historique/user/:email', (req, res) => {
  const email = req.params.email;

  const sql = "DELETE FROM historique WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    return res.json({ message: "Historique supprimé avec succès" });
  });
});
// Ajouter un item dans l'historique
app.post('/historique', (req, res) => {
  const { email, name, location, latitude, longitude, date } = req.body;

  const sql = "INSERT INTO historique (email, name, location, latitude, longitude, date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [email, name, location, latitude, longitude, date], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ message: "Historique ajouté" });
  });
});
//Récupérer les stats d’un utilisateur
app.get('/stats/:email', (req, res) => {
  const sql = "SELECT * FROM user_stats WHERE email = ?";
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });

    if (result.length === 0) {
      return res.json({ clickCount: 0, hydrationCount: 0 });
    }

    res.json(result[0]);
  });
});
//Incrémenter clickCount (pour les quêtes)
app.put('/stats/click/:email', (req, res) => {
  const email = req.params.email;

  const sql = `
    INSERT INTO user_stats (email, clickCount)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE clickCount = clickCount + 1
  `;

  db.query(sql, [email], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ message: "ClickCount mis à jour" });
  });
});
// Récupérer les badges débloqués d’un utilisateur
app.get('/badges/:email', (req, res) => {
  const email = req.params.email;

  const sql = "SELECT badge_id, unlocked_at FROM badges WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(result);
  });
});
// Enregistrer un badge débloqué
app.post('/badges', (req, res) => {
  const { email, badge_id } = req.body;

  if (!email || !badge_id) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const sql = `
    INSERT INTO badges (email, badge_id, unlocked_at)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE unlocked_at = unlocked_at
  `;

  db.query(sql, [email, badge_id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ message: "Badge enregistré" });
  });
});

// GET profil IA d’un utilisateur
app.get('/profile/:id_utilisateur', (req, res) => {
  const { id_utilisateur } = req.params;

  const sql = `
    SELECT * FROM user_profile
    WHERE id_utilisateur = ?
  `;

  db.query(sql, [id_utilisateur], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    if (results.length === 0) {
      return res.status(200).json(null); // pas encore de profil
    }

    res.json(results[0]);
  });
});

// POST mise à jour des infos perso (age, sexe, taille, poids)
app.post('/profile/update', (req, res) => {
  const { id_utilisateur, age, sexe, taille, poids } = req.body;

  const sqlCheck = `SELECT * FROM user_profile WHERE id_utilisateur = ?`;
  db.query(sqlCheck, [id_utilisateur], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    if (results.length === 0) {
      const sqlInsert = `
        INSERT INTO user_profile (id_utilisateur, age, sexe, taille, poids)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, [id_utilisateur, age, sexe, taille, poids], (err2) => {
        if (err2) return res.status(500).json({ error: 'Erreur insertion' });
        res.json({ message: 'Profil créé' });
      });
    } else {
      const sqlUpdate = `
        UPDATE user_profile
        SET age = ?, sexe = ?, taille = ?, poids = ?
        WHERE id_utilisateur = ?
      `;
      db.query(sqlUpdate, [age, sexe, taille, poids, id_utilisateur], (err2) => {
        if (err2) return res.status(500).json({ error: 'Erreur mise à jour' });
        res.json({ message: 'Profil mis à jour' });
      });
    }
  });
});

// POST recalcul de l’objectif IA
app.post('/profile/calculate', async (req, res) => {
  console.log("📥 /profile/calculate appelé avec :", req.body);

  const { id_utilisateur } = req.body;

  const sql = `SELECT * FROM user_profile WHERE id_utilisateur = ?`;
  db.query(sql, [id_utilisateur], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length === 0) return res.status(400).json({ error: 'Profil inexistant' });

    const profile = results[0];

    // 🌦️ Récupération météo : température MAX du jour
    const lat = 42.575;   // Les Angles
    const lon = 2.076;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;

    let temperature_max = 20;

    try {
      const meteo = await axios.get(url);
      temperature_max = meteo.data.daily[0].temp.max;
    } catch (e) {
      console.log("❌ Erreur API météo :", e);
    }

    // 🔥 Calcul IA basé sur la température MAX
    const objectif = calculateHydrationGoal({
      age: profile.age,
      sexe: profile.sexe,
      poids: profile.poids,
      temperature: temperature_max
    });

    const explication = `Objectif basé sur ${profile.poids} kg, ${profile.sexe}, ${profile.age} ans et ${temperature_max}°C (température maximale du jour).`;

    // 🔥 IA choisit le nombre de notifications (entre 4 et 7)
    const nbNotif = Math.floor(Math.random() * 4) + 4;

    // 🔥 IA génère les horaires automatiquement (entre 9h et 21h)
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

    // 🔥 Quantité à boire par notification
    const mlParNotif = Math.round((objectif * 1000) / nbNotif);

    // 🤖 Phrase drôle IA
    const phrasesIA = [
      `Bon… j’ai décidé que tu recevras ${nbNotif} notifications aujourd’hui. Bois ${mlParNotif} ml à chaque fois. Oui, je suis exigeante.`,
      `J’ai fait mes calculs. Résultat : ${nbNotif} rappels. ${mlParNotif} ml chacun. Courage champion.`,
      `Breaking news : ${nbNotif} notifications aujourd’hui. À chaque fois, tu bois ${mlParNotif} ml. Je surveille.`,
      `Ton IA préférée a choisi ${nbNotif} rappels. Bois ${mlParNotif} ml à chaque fois. Pas de négociation.`,
    ];
    const recommandation = phrasesIA[Math.floor(Math.random() * phrasesIA.length)];

    // 💾 Enregistrer les horaires générés par l’IA
    const sqlNotif = `
      INSERT INTO horaires_notifications (id_utilisateur, fixed_times, actif, created_at)
      VALUES (?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        fixed_times = VALUES(fixed_times),
        actif = 1,
        created_at = NOW()
    `;
    console.log("🕒 Horaires générés par l’IA :", horaires);
    console.log("🔔 Nombre de notifications :", nbNotif);
    console.log("💧 Quantité par notif :", mlParNotif);


    db.query(sqlNotif, [id_utilisateur, JSON.stringify(horaires)], (err) => {
      if (err) {
        console.log("❌ Erreur SQL lors de l’enregistrement :", err);
      } else {
        console.log("✅ Horaires enregistrés avec succès !");
      }

      res.json({
        objectif,
        explication,
        temperature_max,
        nbNotif,
        mlParNotif,
        horaires,
        recommandation
      });
    });

  });
});
app.post("/profile/updateGoal", (req, res) => {
  const { id_utilisateur, objectif_user } = req.body;

  const sql = `
    UPDATE user_profile
    SET objectif_ia = ?
    WHERE id_utilisateur = ?
  `;

  db.query(sql, [objectif_user, id_utilisateur], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ success: true });
  });
});



// --------------------------------------
// LANCEMENT SERVEUR
// --------------------------------------
const PORT = process.env.PORT || 8080;
console.log("PORT utilisé :", PORT);

app.listen(PORT, () => {
    console.log("🚀 Serveur lancé sur le port " + PORT);
});
