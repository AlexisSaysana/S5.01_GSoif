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

const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

const app = express();
app.use(helmet());

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:19000'
];
app.use(cors({
    origin: function (origin, callback) {
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

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

(async () => {
    try {
        const conn = await db.getConnection();
        console.log("✅ Connexion MySQL réussie !");
        conn.release();
    } catch (err) {
        console.error("❌ Erreur de connexion MySQL :", err);
    }
})();

// --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
// ... [Gardez tout votre code précédent ici] ...
// [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

// --------------------------------------
// 💬 Récupérer les avis d'une fontaine (NOUVEAU)
// --------------------------------------
app.get('/commentaires/:fountain_id', async (req, res) => {
    const { fountain_id } = req.params;
    const sql = `
        SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
        FROM avis
        JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
        WHERE avis.fountain_id = ?
        ORDER BY avis.created_at DESC
    `;
    try {
        const [rows] = await db.query(sql, [fountain_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Erreur SQL", details: err });
    }
});

// --------------------------------------
// 💬 Ajouter un avis (NOUVEAU)
// --------------------------------------
app.post('/commentaires', async (req, res) => {
    const { fountain_id, email, rating, comment } = req.body;
    try {
        const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
        if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

        const id_utilisateur = userRows[0].id_utilisateur;
        const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
        await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
        res.status(201).json({ message: "Avis ajouté" });
    } catch (err) {
        res.status(500).json({ error: "Erreur SQL" });
    }
});

// 🚀 LANCEMENT SERVEUR
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("🚀 Serveur lancé sur le port " + PORT);
});const express = require('express');
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

   const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

   const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
   const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

   const app = express();
   app.use(helmet());

   const allowedOrigins = [
       process.env.FRONTEND_URL || 'http://localhost:8081',
       'http://localhost:19006',
       'http://localhost:19000'
   ];
   app.use(cors({
       origin: function (origin, callback) {
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

   const globalLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100,
       message: 'Trop de requêtes, veuillez réessayer plus tard.'
   });
   app.use(globalLimiter);

   const authLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 5,
       skipSuccessfulRequests: true,
       message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
   });

   const db = mysql.createPool({
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   }).promise();

   (async () => {
       try {
           const conn = await db.getConnection();
           console.log("✅ Connexion MySQL réussie !");
           conn.release();
       } catch (err) {
           console.error("❌ Erreur de connexion MySQL :", err);
       }
   })();

   // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
   // ... [Gardez tout votre code précédent ici] ...
   // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

   // --------------------------------------
   // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
   // --------------------------------------
   app.get('/commentaires/:fountain_id', async (req, res) => {
       const { fountain_id } = req.params;
       const sql = `
           SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
           FROM avis
           JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
           WHERE avis.fountain_id = ?
           ORDER BY avis.created_at DESC
       `;
       try {
           const [rows] = await db.query(sql, [fountain_id]);
           res.json(rows);
       } catch (err) {
           res.status(500).json({ error: "Erreur SQL", details: err });
       }
   });

   // --------------------------------------
   // 💬 Ajouter un avis (NOUVEAU)
   // --------------------------------------
   app.post('/commentaires', async (req, res) => {
       const { fountain_id, email, rating, comment } = req.body;
       try {
           const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
           if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

           const id_utilisateur = userRows[0].id_utilisateur;
           const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
           await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
           res.status(201).json({ message: "Avis ajouté" });
       } catch (err) {
           res.status(500).json({ error: "Erreur SQL" });
       }
   });

   // 🚀 LANCEMENT SERVEUR
   const PORT = process.env.PORT || 8080;
   app.listen(PORT, () => {
       console.log("🚀 Serveur lancé sur le port " + PORT);
   });const express = require('express');
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

      const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

      const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
      const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

      const app = express();
      app.use(helmet());

      const allowedOrigins = [
          process.env.FRONTEND_URL || 'http://localhost:8081',
          'http://localhost:19006',
          'http://localhost:19000'
      ];
      app.use(cors({
          origin: function (origin, callback) {
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

      const globalLimiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: 'Trop de requêtes, veuillez réessayer plus tard.'
      });
      app.use(globalLimiter);

      const authLimiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 5,
          skipSuccessfulRequests: true,
          message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
      });

      const db = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
      }).promise();

      (async () => {
          try {
              const conn = await db.getConnection();
              console.log("✅ Connexion MySQL réussie !");
              conn.release();
          } catch (err) {
              console.error("❌ Erreur de connexion MySQL :", err);
          }
      })();

      // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
      // ... [Gardez tout votre code précédent ici] ...
      // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

      // --------------------------------------
      // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
      // --------------------------------------
      app.get('/commentaires/:fountain_id', async (req, res) => {
          const { fountain_id } = req.params;
          const sql = `
              SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
              FROM avis
              JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
              WHERE avis.fountain_id = ?
              ORDER BY avis.created_at DESC
          `;
          try {
              const [rows] = await db.query(sql, [fountain_id]);
              res.json(rows);
          } catch (err) {
              res.status(500).json({ error: "Erreur SQL", details: err });
          }
      });

      // --------------------------------------
      // 💬 Ajouter un avis (NOUVEAU)
      // --------------------------------------
      app.post('/commentaires', async (req, res) => {
          const { fountain_id, email, rating, comment } = req.body;
          try {
              const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
              if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

              const id_utilisateur = userRows[0].id_utilisateur;
              const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
              await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
              res.status(201).json({ message: "Avis ajouté" });
          } catch (err) {
              res.status(500).json({ error: "Erreur SQL" });
          }
      });

      // 🚀 LANCEMENT SERVEUR
      const PORT = process.env.PORT || 8080;
      app.listen(PORT, () => {
          console.log("🚀 Serveur lancé sur le port " + PORT);
      });const express = require('express');
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

         const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

         const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
         const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

         const app = express();
         app.use(helmet());

         const allowedOrigins = [
             process.env.FRONTEND_URL || 'http://localhost:8081',
             'http://localhost:19006',
             'http://localhost:19000'
         ];
         app.use(cors({
             origin: function (origin, callback) {
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

         const globalLimiter = rateLimit({
             windowMs: 15 * 60 * 1000,
             max: 100,
             message: 'Trop de requêtes, veuillez réessayer plus tard.'
         });
         app.use(globalLimiter);

         const authLimiter = rateLimit({
             windowMs: 15 * 60 * 1000,
             max: 5,
             skipSuccessfulRequests: true,
             message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
         });

         const db = mysql.createPool({
             host: process.env.DB_HOST,
             user: process.env.DB_USER,
             password: process.env.DB_PASSWORD,
             database: process.env.DB_NAME,
             waitForConnections: true,
             connectionLimit: 10,
             queueLimit: 0
         }).promise();

         (async () => {
             try {
                 const conn = await db.getConnection();
                 console.log("✅ Connexion MySQL réussie !");
                 conn.release();
             } catch (err) {
                 console.error("❌ Erreur de connexion MySQL :", err);
             }
         })();

         // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
         // ... [Gardez tout votre code précédent ici] ...
         // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

         // --------------------------------------
         // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
         // --------------------------------------
         app.get('/commentaires/:fountain_id', async (req, res) => {
             const { fountain_id } = req.params;
             const sql = `
                 SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                 FROM avis
                 JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                 WHERE avis.fountain_id = ?
                 ORDER BY avis.created_at DESC
             `;
             try {
                 const [rows] = await db.query(sql, [fountain_id]);
                 res.json(rows);
             } catch (err) {
                 res.status(500).json({ error: "Erreur SQL", details: err });
             }
         });

         // --------------------------------------
         // 💬 Ajouter un avis (NOUVEAU)
         // --------------------------------------
         app.post('/commentaires', async (req, res) => {
             const { fountain_id, email, rating, comment } = req.body;
             try {
                 const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                 if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                 const id_utilisateur = userRows[0].id_utilisateur;
                 const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                 await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                 res.status(201).json({ message: "Avis ajouté" });
             } catch (err) {
                 res.status(500).json({ error: "Erreur SQL" });
             }
         });

         // 🚀 LANCEMENT SERVEUR
         const PORT = process.env.PORT || 8080;
         app.listen(PORT, () => {
             console.log("🚀 Serveur lancé sur le port " + PORT);
         });const express = require('express');
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

            const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

            const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
            const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

            const app = express();
            app.use(helmet());

            const allowedOrigins = [
                process.env.FRONTEND_URL || 'http://localhost:8081',
                'http://localhost:19006',
                'http://localhost:19000'
            ];
            app.use(cors({
                origin: function (origin, callback) {
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

            const globalLimiter = rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 100,
                message: 'Trop de requêtes, veuillez réessayer plus tard.'
            });
            app.use(globalLimiter);

            const authLimiter = rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 5,
                skipSuccessfulRequests: true,
                message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
            });

            const db = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            }).promise();

            (async () => {
                try {
                    const conn = await db.getConnection();
                    console.log("✅ Connexion MySQL réussie !");
                    conn.release();
                } catch (err) {
                    console.error("❌ Erreur de connexion MySQL :", err);
                }
            })();

            // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
            // ... [Gardez tout votre code précédent ici] ...
            // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

            // --------------------------------------
            // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
            // --------------------------------------
            app.get('/commentaires/:fountain_id', async (req, res) => {
                const { fountain_id } = req.params;
                const sql = `
                    SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                    FROM avis
                    JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                    WHERE avis.fountain_id = ?
                    ORDER BY avis.created_at DESC
                `;
                try {
                    const [rows] = await db.query(sql, [fountain_id]);
                    res.json(rows);
                } catch (err) {
                    res.status(500).json({ error: "Erreur SQL", details: err });
                }
            });

            // --------------------------------------
            // 💬 Ajouter un avis (NOUVEAU)
            // --------------------------------------
            app.post('/commentaires', async (req, res) => {
                const { fountain_id, email, rating, comment } = req.body;
                try {
                    const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                    if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                    const id_utilisateur = userRows[0].id_utilisateur;
                    const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                    await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                    res.status(201).json({ message: "Avis ajouté" });
                } catch (err) {
                    res.status(500).json({ error: "Erreur SQL" });
                }
            });

            // 🚀 LANCEMENT SERVEUR
            const PORT = process.env.PORT || 8080;
            app.listen(PORT, () => {
                console.log("🚀 Serveur lancé sur le port " + PORT);
            });const express = require('express');
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

               const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

               const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
               const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

               const app = express();
               app.use(helmet());

               const allowedOrigins = [
                   process.env.FRONTEND_URL || 'http://localhost:8081',
                   'http://localhost:19006',
                   'http://localhost:19000'
               ];
               app.use(cors({
                   origin: function (origin, callback) {
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

               const globalLimiter = rateLimit({
                   windowMs: 15 * 60 * 1000,
                   max: 100,
                   message: 'Trop de requêtes, veuillez réessayer plus tard.'
               });
               app.use(globalLimiter);

               const authLimiter = rateLimit({
                   windowMs: 15 * 60 * 1000,
                   max: 5,
                   skipSuccessfulRequests: true,
                   message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
               });

               const db = mysql.createPool({
                   host: process.env.DB_HOST,
                   user: process.env.DB_USER,
                   password: process.env.DB_PASSWORD,
                   database: process.env.DB_NAME,
                   waitForConnections: true,
                   connectionLimit: 10,
                   queueLimit: 0
               }).promise();

               (async () => {
                   try {
                       const conn = await db.getConnection();
                       console.log("✅ Connexion MySQL réussie !");
                       conn.release();
                   } catch (err) {
                       console.error("❌ Erreur de connexion MySQL :", err);
                   }
               })();

               // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
               // ... [Gardez tout votre code précédent ici] ...
               // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

               // --------------------------------------
               // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
               // --------------------------------------
               app.get('/commentaires/:fountain_id', async (req, res) => {
                   const { fountain_id } = req.params;
                   const sql = `
                       SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                       FROM avis
                       JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                       WHERE avis.fountain_id = ?
                       ORDER BY avis.created_at DESC
                   `;
                   try {
                       const [rows] = await db.query(sql, [fountain_id]);
                       res.json(rows);
                   } catch (err) {
                       res.status(500).json({ error: "Erreur SQL", details: err });
                   }
               });

               // --------------------------------------
               // 💬 Ajouter un avis (NOUVEAU)
               // --------------------------------------
               app.post('/commentaires', async (req, res) => {
                   const { fountain_id, email, rating, comment } = req.body;
                   try {
                       const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                       if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                       const id_utilisateur = userRows[0].id_utilisateur;
                       const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                       await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                       res.status(201).json({ message: "Avis ajouté" });
                   } catch (err) {
                       res.status(500).json({ error: "Erreur SQL" });
                   }
               });

               // 🚀 LANCEMENT SERVEUR
               const PORT = process.env.PORT || 8080;
               app.listen(PORT, () => {
                   console.log("🚀 Serveur lancé sur le port " + PORT);
               });const express = require('express');
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

                  const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

                  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
                  const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

                  const app = express();
                  app.use(helmet());

                  const allowedOrigins = [
                      process.env.FRONTEND_URL || 'http://localhost:8081',
                      'http://localhost:19006',
                      'http://localhost:19000'
                  ];
                  app.use(cors({
                      origin: function (origin, callback) {
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

                  const globalLimiter = rateLimit({
                      windowMs: 15 * 60 * 1000,
                      max: 100,
                      message: 'Trop de requêtes, veuillez réessayer plus tard.'
                  });
                  app.use(globalLimiter);

                  const authLimiter = rateLimit({
                      windowMs: 15 * 60 * 1000,
                      max: 5,
                      skipSuccessfulRequests: true,
                      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
                  });

                  const db = mysql.createPool({
                      host: process.env.DB_HOST,
                      user: process.env.DB_USER,
                      password: process.env.DB_PASSWORD,
                      database: process.env.DB_NAME,
                      waitForConnections: true,
                      connectionLimit: 10,
                      queueLimit: 0
                  }).promise();

                  (async () => {
                      try {
                          const conn = await db.getConnection();
                          console.log("✅ Connexion MySQL réussie !");
                          conn.release();
                      } catch (err) {
                          console.error("❌ Erreur de connexion MySQL :", err);
                      }
                  })();

                  // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
                  // ... [Gardez tout votre code précédent ici] ...
                  // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

                  // --------------------------------------
                  // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
                  // --------------------------------------
                  app.get('/commentaires/:fountain_id', async (req, res) => {
                      const { fountain_id } = req.params;
                      const sql = `
                          SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                          FROM avis
                          JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                          WHERE avis.fountain_id = ?
                          ORDER BY avis.created_at DESC
                      `;
                      try {
                          const [rows] = await db.query(sql, [fountain_id]);
                          res.json(rows);
                      } catch (err) {
                          res.status(500).json({ error: "Erreur SQL", details: err });
                      }
                  });

                  // --------------------------------------
                  // 💬 Ajouter un avis (NOUVEAU)
                  // --------------------------------------
                  app.post('/commentaires', async (req, res) => {
                      const { fountain_id, email, rating, comment } = req.body;
                      try {
                          const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                          if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                          const id_utilisateur = userRows[0].id_utilisateur;
                          const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                          await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                          res.status(201).json({ message: "Avis ajouté" });
                      } catch (err) {
                          res.status(500).json({ error: "Erreur SQL" });
                      }
                  });

                  // 🚀 LANCEMENT SERVEUR
                  const PORT = process.env.PORT || 8080;
                  app.listen(PORT, () => {
                      console.log("🚀 Serveur lancé sur le port " + PORT);
                  });const express = require('express');
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

                     const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

                     const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
                     const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

                     const app = express();
                     app.use(helmet());

                     const allowedOrigins = [
                         process.env.FRONTEND_URL || 'http://localhost:8081',
                         'http://localhost:19006',
                         'http://localhost:19000'
                     ];
                     app.use(cors({
                         origin: function (origin, callback) {
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

                     const globalLimiter = rateLimit({
                         windowMs: 15 * 60 * 1000,
                         max: 100,
                         message: 'Trop de requêtes, veuillez réessayer plus tard.'
                     });
                     app.use(globalLimiter);

                     const authLimiter = rateLimit({
                         windowMs: 15 * 60 * 1000,
                         max: 5,
                         skipSuccessfulRequests: true,
                         message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
                     });

                     const db = mysql.createPool({
                         host: process.env.DB_HOST,
                         user: process.env.DB_USER,
                         password: process.env.DB_PASSWORD,
                         database: process.env.DB_NAME,
                         waitForConnections: true,
                         connectionLimit: 10,
                         queueLimit: 0
                     }).promise();

                     (async () => {
                         try {
                             const conn = await db.getConnection();
                             console.log("✅ Connexion MySQL réussie !");
                             conn.release();
                         } catch (err) {
                             console.error("❌ Erreur de connexion MySQL :", err);
                         }
                     })();

                     // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
                     // ... [Gardez tout votre code précédent ici] ...
                     // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

                     // --------------------------------------
                     // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
                     // --------------------------------------
                     app.get('/commentaires/:fountain_id', async (req, res) => {
                         const { fountain_id } = req.params;
                         const sql = `
                             SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                             FROM avis
                             JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                             WHERE avis.fountain_id = ?
                             ORDER BY avis.created_at DESC
                         `;
                         try {
                             const [rows] = await db.query(sql, [fountain_id]);
                             res.json(rows);
                         } catch (err) {
                             res.status(500).json({ error: "Erreur SQL", details: err });
                         }
                     });

                     // --------------------------------------
                     // 💬 Ajouter un avis (NOUVEAU)
                     // --------------------------------------
                     app.post('/commentaires', async (req, res) => {
                         const { fountain_id, email, rating, comment } = req.body;
                         try {
                             const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                             if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                             const id_utilisateur = userRows[0].id_utilisateur;
                             const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                             await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                             res.status(201).json({ message: "Avis ajouté" });
                         } catch (err) {
                             res.status(500).json({ error: "Erreur SQL" });
                         }
                     });

                     // 🚀 LANCEMENT SERVEUR
                     const PORT = process.env.PORT || 8080;
                     app.listen(PORT, () => {
                         console.log("🚀 Serveur lancé sur le port " + PORT);
                     });const express = require('express');
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

                        const { authenticateToken, checkUserOwnership } = require('./middleware/auth');

                        const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
                        const JWT_SECRET = process.env.JWT_SECRET || 'changez_cette_valeur_en_production';

                        const app = express();
                        app.use(helmet());

                        const allowedOrigins = [
                            process.env.FRONTEND_URL || 'http://localhost:8081',
                            'http://localhost:19006',
                            'http://localhost:19000'
                        ];
                        app.use(cors({
                            origin: function (origin, callback) {
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

                        const globalLimiter = rateLimit({
                            windowMs: 15 * 60 * 1000,
                            max: 100,
                            message: 'Trop de requêtes, veuillez réessayer plus tard.'
                        });
                        app.use(globalLimiter);

                        const authLimiter = rateLimit({
                            windowMs: 15 * 60 * 1000,
                            max: 5,
                            skipSuccessfulRequests: true,
                            message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
                        });

                        const db = mysql.createPool({
                            host: process.env.DB_HOST,
                            user: process.env.DB_USER,
                            password: process.env.DB_PASSWORD,
                            database: process.env.DB_NAME,
                            waitForConnections: true,
                            connectionLimit: 10,
                            queueLimit: 0
                        }).promise();

                        (async () => {
                            try {
                                const conn = await db.getConnection();
                                console.log("✅ Connexion MySQL réussie !");
                                conn.release();
                            } catch (err) {
                                console.error("❌ Erreur de connexion MySQL :", err);
                            }
                        })();

                        // --- ROUTES EXISTANTES (LOGIN, UTILISATEURS, STATS, BADGES, etc.) ---
                        // ... [Gardez tout votre code précédent ici] ...
                        // [Note : Pour la brièveté, je saute à la nouvelle section des commentaires]

                        // --------------------------------------
                        // 💬 Récupérer les avis d'une fontaine (NOUVEAU)
                        // --------------------------------------
                        app.get('/commentaires/:fountain_id', async (req, res) => {
                            const { fountain_id } = req.params;
                            const sql = `
                                SELECT utilisateur.prenom as user, avis.note as rating, avis.commentaire as comment
                                FROM avis
                                JOIN utilisateur ON avis.id_utilisateur = utilisateur.id_utilisateur
                                WHERE avis.fountain_id = ?
                                ORDER BY avis.created_at DESC
                            `;
                            try {
                                const [rows] = await db.query(sql, [fountain_id]);
                                res.json(rows);
                            } catch (err) {
                                res.status(500).json({ error: "Erreur SQL", details: err });
                            }
                        });

                        // --------------------------------------
                        // 💬 Ajouter un avis (NOUVEAU)
                        // --------------------------------------
                        app.post('/commentaires', async (req, res) => {
                            const { fountain_id, email, rating, comment } = req.body;
                            try {
                                const [userRows] = await db.query("SELECT id_utilisateur FROM utilisateur WHERE email = ?", [email]);
                                if (userRows.length === 0) return res.status(404).json({ error: "User non trouvé" });

                                const id_utilisateur = userRows[0].id_utilisateur;
                                const sql = "INSERT INTO avis (fountain_id, id_utilisateur, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())";
                                await db.query(sql, [fountain_id, id_utilisateur, rating, comment]);
                                res.status(201).json({ message: "Avis ajouté" });
                            } catch (err) {
                                res.status(500).json({ error: "Erreur SQL" });
                            }
                        });

                        // 🚀 LANCEMENT SERVEUR
                        const PORT = process.env.PORT || 8080;
                        app.listen(PORT, () => {
                            console.log("🚀 Serveur lancé sur le port " + PORT);
                        });