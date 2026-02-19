# 🔍 GUIDE : TESTS DE PÉNÉTRATION AVEC OWASP ZAP

## 📝 Introduction

**OWASP ZAP** (Zed Attack Proxy) est un outil gratuit de test de pénétration (pentesting) recommandé par OWASP.

**Ce que tu vas apprendre :**
1. Installer OWASP ZAP
2. Scanner ton application
3. Identifier les vulnérabilités restantes
4. Générer un rapport PDF pour ton projet

**Durée estimée :** 30 minutes

---

## 📥 ÉTAPE 1 : Installation OWASP ZAP

### Windows :

**⚠️ IMPORTANT : BIEN INSTALLER JAVA !**

1. Télécharger OWASP ZAP `ZAP_2.X_X_windows.exe` : https://github.com/zaproxy/zaproxy/releases/latest
2. Télécharger Java 17+ : https://adoptium.net/fr/temurin/releases?version=17
3. Décompresser le ZIP
4. Lancer `ZAP_2_X_X_windows.exe` et localiser `Java.exe` si nécessaire
5. Installer avec les options par défaut
6. Lancer ZAP 2.X.X


### Alternative (tous OS) :

```bash
# Via Docker (plus simple !)
docker pull zaproxy/zap-stable
docker run -u zap -p 8080:8080 -i zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080
```

---

## 🎯 ÉTAPE 2 : Préparer l'application

### 2.1 Démarrer le backend

```bash
cd backend
npm start
# Le serveur tourne sur http://localhost:8080
```

### 2.2 Démarrer l'application mobile

```bash
cd monApp
npm expo start
# Ouvrir dans l'émulateur Android
```

### 2.3 Créer un compte test

1. S'inscrire avec un email test : `test@exemple.com`
2. Mot de passe : `Test1234!`
3. Se connecter

---

## 🔍 ÉTAPE 3 : Scanner avec OWASP ZAP

### Mode 1 : Scan Automatique (débutant)

1. **Ouvrir OWASP ZAP**
2. Cliquer sur **Automated Scan**
3. Entrer l'URL : `http://localhost:8080`
4. Cliquer sur **Attack**
5. Attendre 5-10 minutes

### Mode 2 : Scan Manuel (avancé)

#### A. Configuration du proxy

1. Dans ZAP : **Tools → Options → Local Proxies**
   - Address: `localhost`
   - Port: `8081`

2. Configurer l'application pour utiliser le proxy :
   ```javascript
   // Ajouter temporairement dans fetch
   const response = await fetch(url, {
       ...options,
       proxy: 'http://localhost:8081'
   });
   ```

#### B. Spider (exploration)

1. Dans ZAP : Clic droit sur `http://localhost:8080`
2. **Attack → Spider**
3. Attendre que toutes les pages soient découvertes

#### C. Active Scan (test d'attaque)

1. Dans ZAP : Clic droit sur `http://localhost:8080`
2. **Attack → Active Scan**
3. Cocher :
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - Path Traversal
   - Server Side Code Injection
4. Lancer le scan

---

## 📊 ÉTAPE 4 : Analyser les résultats

### Types d'alertes :

- 🔴 **High (Rouge)** : Vulnérabilité critique
- 🟠 **Medium (Orange)** : Vulnérabilité moyenne
- 🟡 **Low (Jaune)** : Vulnérabilité mineure
- ℹ️ **Informational (Bleu)** : Information

### Alertes attendues APRÈS nos corrections :

```
✅ RÉSOLU :
- SQL Injection → Protégé par express-validator
- Weak Authentication → Protégé par rate limiting + JWT
- Missing Authentication → Protégé par JWT
- Information Disclosure → Messages génériques

⚠️ POSSIBLES (à ignorer pour mobile app) :
- X-Frame-Options → Normal (Helmet l'ajoute)
- Content-Security-Policy → À configurer selon besoins
- Cookie without Secure flag → Pas de cookies (on utilise JWT)
```

---

## 📝 ÉTAPE 5 : Générer le rapport

### Rapport HTML :

1. **Report → Generate HTML Report**
2. Choisir l'emplacement : `monApp/OWASP_ZAP_Report.html`
3. Sauvegarder

### Rapport PDF (pour le projet) :

1. **Report → Generate PDF Report**
2. Sauvegarder : `monApp/OWASP_ZAP_Report.pdf`

### Inclure dans le rapport :

```markdown
# Résumé des tests OWASP ZAP

**Date du scan :** [Date]
**URL testée :** http://localhost:8080
**Durée du scan :** 10 minutes

## Résultats :
- 🔴 High : 0 (toutes corrigées)
- 🟠 Medium : 2 (acceptables)
- 🟡 Low : 5 (mineures)

## Vulnérabilités corrigées :
1. SQL Injection ✅
2. Broken Authentication ✅
3. Sensitive Data Exposure ✅
4. Security Misconfiguration ✅

## Recommandations restantes :
1. Activer HTTPS en production
2. Implémenter CSP (Content Security Policy)
3. Ajouter HSTS (HTTP Strict Transport Security)
```

---

## 🧪 ÉTAPE 6 : Tests manuels complémentaires

### Test 1 : SQL Injection

```bash
# Tester dans le champ email du login
email: admin' OR '1'='1
password: anything

# Résultat attendu : ❌ Rejeté par validation
```

### Test 2 : XSS (Cross-Site Scripting)

```bash
# Tester dans le champ nom de l'inscription
nom: <script>alert('XSS')</script>

# Résultat attendu : ❌ Rejeté par validation
```

### Test 3 : Brute Force

```bash
# Tenter 101 connexions avec mauvais mot de passe
# Résultat attendu : Blocage après 100 tentatives
```

### Test 4 : Broken Access Control

```bash
# Se connecter avec utilisateur A (id: 1)
# Essayer d'accéder aux données de l'utilisateur B (id: 2)

GET /hydration/today/2
Authorization: Bearer [token_utilisateur_A]

# Résultat attendu : ❌ 403 Forbidden
```

---

## 📸 CAPTURES D'ÉCRAN POUR LE PROJET

### À inclure dans ton rapport :

1. **Screenshot 1 : Dashboard OWASP ZAP**
   - Vue d'ensemble du scan
   - Nombre de requêtes testées

2. **Screenshot 2 : Alertes trouvées**
   - Liste des vulnérabilités (idéalement 0 High)

3. **Screenshot 3 : Détail d'une alerte corrigée**
   - Avant/Après la correction

4. **Screenshot 4 : Test rate limiting**
   - Message "Trop de tentatives"

5. **Screenshot 5 : Test mot de passe faible**
   - Message d'erreur de validation

---

## 🛠️ DÉPANNAGE

### Problème : "Connection refused"

**Solution :**
```bash
# Vérifier que le backend tourne
curl http://localhost:8080

# Vérifier le port dans server.js
console.log("Serveur lancé sur le port", PORT);
```

### Problème : "CORS error dans ZAP"

**Solution :**
```javascript
// Ajouter temporairement dans server.js
app.use(cors({
    origin: '*' // SEULEMENT POUR LES TESTS !
}));
```

### Problème : "ZAP ne trouve aucune page"

**Solution :**
1. Utiliser le mode **Manual Explore**
2. Naviguer manuellement dans l'application
3. ZAP enregistrera automatiquement les requêtes
4. Puis lancer l'Active Scan

---

## 📋 CHECKLIST FINALE

Avant de soumettre ton projet :

- [ ] ✅ OWASP ZAP installé et configuré
- [ ] ✅ Scan automatique effectué
- [ ] ✅ Rapport PDF généré
- [ ] ✅ Captures d'écran prises
- [ ] ✅ Tests manuels validés
- [ ] ✅ Vulnérabilités documentées
- [ ] ✅ Corrections expliquées

---

## 📚 RESSOURCES COMPLÉMENTAIRES

### Documentation OWASP :
- OWASP Top 10 2025 : https://owasp.org/Top10/2025/
- OWASP ZAP Guide : https://www.zaproxy.org/docs/
- OWASP MAS : https://mas.owasp.org/

### Vidéos tutoriels :
- OWASP ZAP Tutorial : https://www.youtube.com/watch?v=4COMnDy2VPg
- Pentesting Web Apps : https://www.youtube.com/watch?v=X4eRbHgRawI

### Outils alternatifs :
- **Burp Suite Community** : https://portswigger.net/burp
- **Nikto** : Scanner de vulnérabilités
- **SQLMap** : Test injection SQL
- **Postman** : Test API manuellement

---

## 🎓 POUR TON RAPPORT ACADÉMIQUE

### Structure recommandée :

```
1. Introduction
   - Présentation du projet
   - Objectifs de sécurité

2. Méthodologie
   - Référentiel OWASP Top 10:2025
   - Outils utilisés (ZAP, code review)

3. Audit de sécurité
   - Vulnérabilités identifiées (tableau)
   - Captures d'écran ZAP

4. Corrections apportées
   - Code avant/après
   - Explications techniques

5. Tests de validation
   - Rapport OWASP ZAP
   - Tests manuels

6. Résultats
   - Score de sécurité
   - Améliorations futures

7. Conclusion

Annexes :
- Rapport OWASP ZAP complet (PDF)
- Code source sécurisé
- Guide de déploiement
```

---

**Bonne chance pour ton projet ! 🚀**

**Questions ?** N'hésite pas à relire les fichiers :
- `RAPPORT_SECURITE_COMPLET.md` (détails techniques)
- `GUIDE_SECURITE.md` (explications simples)
