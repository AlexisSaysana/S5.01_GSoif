const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

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
                console.error("Erreur SQL :", err);

                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: "Email déjà utilisé" });
                }

                return res.status(500).json({ error: "Erreur serveur" });
            }

            return res.status(201).json({ message: "Utilisateur ajouté avec succès" });
        });

    } catch (error) {
        console.error("Erreur hachage :", error);
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

// --------------------------------------
// LANCEMENT SERVEUR
// --------------------------------------
const PORT = process.env.PORT || 8080;
console.log("PORT utilisé :", PORT);

app.listen(PORT, () => {
    console.log("🚀 Serveur lancé sur le port " + PORT);
});
