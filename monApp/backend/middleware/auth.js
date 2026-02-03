// 🔒 Middleware d'authentification JWT
// A01:2025 - Broken Access Control

const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token JWT
 * Protège les routes sensibles contre les accès non autorisés
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token manquant. Authentification requise.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token invalide ou expiré
            return res.status(403).json({ error: 'Token invalide ou expiré.' });
        }

        // Ajouter les infos utilisateur à la requête
        req.user = user;
        next();
    });
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 */
const checkUserOwnership = (req, res, next) => {
    const requestedUserId = req.params.id || req.body.id_utilisateur || req.params.id_utilisateur;
    const authenticatedUserId = req.user.id;

    if (parseInt(requestedUserId) !== parseInt(authenticatedUserId)) {
        return res.status(403).json({ 
            error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.' 
        });
    }

    next();
};

module.exports = { authenticateToken, checkUserOwnership };
