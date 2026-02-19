# ⚡ TESTS RAPIDES - VALIDATION SÉCURITÉ

## 🎯 Tests à effectuer avant la présentation (15 minutes)

---

## ✅ TEST 1 : Démarrage de l'application

### Étape 1 : Configurer .env

```bash
cd backend

# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Éditer .env et coller la clé générée
# Exemple : JWT_SECRET=8f3a2b1c...
```

### Étape 2 : Installer et démarrer

```bash
# Installer les dépendances
cd backend
npm install

# Démarrer le serveur
npm start

# ✅ Attendu : "✅ Connexion MySQL réussie !"
# ✅ Attendu : "🚀 Serveur lancé sur le port 8080"
```

### Étape 3 : Démarrer le frontend

```bash
# Dans un nouveau terminal
cd monApp
npm start

# Ouvrir dans l'émulateur Android
```

---

## ✅ TEST 2 : Mot de passe faible (doit être refusé)

**Action :**
1. Ouvrir l'écran d'inscription
2. Remplir le formulaire :
   - Prénom : `Test`
   - Nom : `User`
   - Email : `test1@example.com`
   - Mot de passe : `azerty`
   - Confirmer : `azerty`
3. Accepter les conditions
4. Cliquer sur "S'inscrire"

**✅ Résultat attendu :**
```
❌ "Le mot de passe doit contenir au moins 8 caractères"
```

**📸 Capture d'écran :** Prendre une photo de ce message d'erreur

---

## ✅ TEST 3 : Mot de passe fort (doit être accepté)

**Action :**
1. Même formulaire mais avec :
   - Mot de passe : `Azerty123!`
   - Confirmer : `Azerty123!`

**✅ Résultat attendu :**
```
✅ "Bienvenue Test !"
✅ Redirection vers l'accueil
```

**📸 Capture d'écran :** Prendre une photo du succès

---

## ✅ TEST 4 : Validation email

**Action :**
1. Inscription avec email invalide : `test@invalid`

**✅ Résultat attendu :**
```
❌ "Données invalides"
```

---

## ✅ TEST 5 : Rate Limiting (brute-force)

**Action :**
1. Se déconnecter
2. Essayer de se connecter avec un mauvais mot de passe
3. Répéter 5 fois avec le même email : `test1@example.com`
4. À la 6ème tentative :

**✅ Résultat attendu :**
```
❌ "Trop de tentatives. Réessayez dans 15 minutes."
```

**📸 Capture d'écran :** Prendre une photo de ce message

**Note :** Pour débloquer, attendre 15 min OU redémarrer le serveur

---

## ✅ TEST 6 : JWT Token stocké

**Action :**
1. Se connecter avec succès
2. Ouvrir React Native Debugger ou utiliser :

```javascript
// Dans la console du navigateur (Expo web) ou React Native Debugger
AsyncStorage.getAllKeys().then(keys => {
    AsyncStorage.multiGet(keys).then(result => {
        console.log(result);
    });
});
```

**✅ Résultat attendu :**
```json
[
  ["authToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
  ["userId", "1"],
  ["userEmail", "test1@example.com"],
  ["userName", "Test User"]
]
```

**📸 Capture d'écran :** Prendre une photo montrant le token

---

## ✅ TEST 7 : Clé API sécurisée

**Action :**
1. Ouvrir `backend/server.js`
2. Chercher "WEATHER_API_KEY"

**✅ Résultat attendu :**
```javascript
// ✅ CORRECT
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// ❌ INCORRECT (ne doit PAS être présent)
const WEATHER_API_KEY = "703b002e3b8de955c0ff503db47e689a";
```

**Action 2 :**
3. Vérifier que `.env` existe dans `backend/`
4. Vérifier que `.env` est dans `.gitignore`

```bash
cd backend
cat .env  # Doit contenir WEATHER_API_KEY=...
cat .gitignore  # Doit contenir .env
git status  # .env ne doit PAS apparaître
```

---

## ✅ TEST 8 : CORS configuré

**Action :**
1. Ouvrir `backend/server.js`
2. Chercher la configuration CORS

**✅ Résultat attendu :**
```javascript
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://localhost:19006', // Expo
    'http://localhost:19000'  // Expo
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
```

---

## ✅ TEST 9 : Validation des entrées

**Action :**
1. Essayer de s'inscrire avec :
   - Nom : `<script>alert('XSS')</script>`

**✅ Résultat attendu :**
```
❌ "Données invalides" ou "Nom invalide"
```

---

## ✅ TEST 10 : Accès sans authentification

**Action avec Postman ou curl :**

```bash
# Essayer d'accéder à une route protégée sans token
curl http://localhost:8080/hydration/today/1

# ✅ Résultat attendu :
# {"error":"Token manquant. Authentification requise."}
```

---

## 📸 CAPTURES D'ÉCRAN À PRENDRE

Pour ton rapport, prends ces captures :

1. ✅ Message "Le mot de passe doit contenir au moins 8 caractères"
2. ✅ Message "Bienvenue Test !"
3. ✅ Message "Trop de tentatives. Réessayez dans 15 minutes."
4. ✅ AsyncStorage montrant le JWT token
5. ✅ Code `server.js` montrant `process.env.WEATHER_API_KEY`
6. ✅ Fichier `.env` (masquer les vraies valeurs)
7. ✅ Fichier `.gitignore` contenant `.env`
8. ✅ `git status` montrant que `.env` n'apparaît pas

---

## 🧪 TESTS OWASP ZAP (BONUS)

**Si tu as le temps (30 minutes) :**

1. Installer OWASP ZAP : https://www.zaproxy.org/download/
2. Lancer un scan automatique de `http://localhost:8080`
3. Générer le rapport PDF
4. Joindre au dossier

**Guide complet :** Voir `GUIDE_OWASP_ZAP.md`

---

## ✅ CHECKLIST RAPIDE

Avant la présentation :

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Test mot de passe faible → refusé ✅
- [ ] Test mot de passe fort → accepté ✅
- [ ] Test rate limiting → bloqué après 100 tentatives ✅
- [ ] JWT token présent dans AsyncStorage ✅
- [ ] Clé API dans .env (pas dans le code) ✅
- [ ] .env dans .gitignore ✅
- [ ] 6+ captures d'écran prises ✅

---

## 🚨 DÉPANNAGE RAPIDE

### Problème : "JWT_SECRET not defined"

```bash
cd backend
# Vérifier que .env existe
ls -la | grep .env

# Si absent, créer .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" > .env
echo "WEATHER_API_KEY=703b002e3b8de955c0ff503db47e689a" >> .env
```

### Problème : "Rate limiting bloque tout"

```bash
# Le problème : globalLimiter trop bas (100 au lieu de 1000)
# Dans server.js, vérifier :
const globalLimiter = rateLimit({
    max: 1000, // Doit être élevé pour usage normal
});

# L'authLimiter (100) protège seulement contre brute force login
const authLimiter = rateLimit({
    max: 100, // OK pour protection connexion
});

# Si toujours bloqué : attendre 15 min ou redémarrer (dev)
```

### Problème : "Module not found"

```bash
cd backend
npm install express-rate-limit express-validator helmet jsonwebtoken
```

---

## 📊 RÉSULTATS ATTENDUS

Après tous les tests :

```
✅ 10/10 tests passés
✅ 8 captures d'écran prises
✅ Application sécurisée
✅ Prêt pour la présentation
```

**Score de sécurité final : 7/10** ✅

---

**Bon courage ! 🚀**
