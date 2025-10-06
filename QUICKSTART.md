# 🚀 Guide de Démarrage Rapide

## Frontend Web Backoffice - "Livre dont vous êtes le héros"

---

## 📋 Prérequis

- Node.js >= 18
- npm ou yarn
- Backend Django/GraphQL en cours d'exécution (port 8000 par défaut)

---

## 🔧 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration (Optionnel)

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifier `.env` avec vos clés API (optionnel pour le développement) :

```env
# Backend GraphQL
VITE_GRAPHQL_URL=http://localhost:8000/graphql

# Génération IA d'images (Optionnel)
VITE_HUGGINGFACE_API_KEY=hf_your_key_here
```

---

## 🏃 Lancer l'application

### Mode Développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

### Build Production

```bash
npm run build
npm run preview
```

---

## 🔑 Connexion

### Compte de test (avec données mockées)

- **Email**: n'importe quel email valide
- **Mot de passe**: au moins 6 caractères

> ⚠️ Actuellement en mode simulation. Pour utiliser de vrais comptes, connectez le backend.

---

## 🎯 Fonctionnalités Disponibles

### ✅ Fonctionnalités Complètes

1. **Dashboard** (`/dashboard`)
   - Liste des scénarios
   - Créer, modifier, supprimer

2. **Éditeur de Scénarios** (`/scenario/new` ou `/scenario/:id/edit`)
   - Création de scènes
   - Vue graphique interactive
   - Gestion des choix et branches
   - **Upload d'images et sons** ✨
   - **Génération IA d'assets** ✨

3. **Bibliothèque d'Assets** (`/assets`) ✨ **NOUVEAU**
   - Gérer toutes vos images et sons
   - Upload direct
   - Génération avec IA
   - Recherche et filtres

4. **Paramètres** (`/settings`)
   - Gestion du profil
   - Liste des joueurs actifs

---

## 🎨 Génération IA

### Images

Le système utilise **Stable Diffusion** via l'API Hugging Face.

**Pour activer :**

1. Créer un compte sur [Hugging Face](https://huggingface.co/)
2. Générer un token API : https://huggingface.co/settings/tokens
3. Ajouter dans `.env` :
   ```env
   VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
   ```

### Sons

Le système supporte **PlayHT** ou **Coqui TTS**.

**Option 1 : PlayHT (plus facile)**
1. Créer un compte sur [PlayHT](https://play.ht/)
2. Obtenir votre API key
3. Ajouter dans `.env`

**Option 2 : Coqui TTS (gratuit, open source)**
- Installer localement ou utiliser une API self-hosted

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── Common/
│   │   ├── AssetUploader.tsx      ✨ Upload d'assets
│   │   ├── AIGenerator.tsx        ✨ Génération IA
│   │   ├── Button.tsx
│   │   └── LoadingSpinner.tsx
│   ├── AssetManager/
│   │   └── AssetManager.tsx       ✨ Bibliothèque d'assets
│   ├── ScenarioEditor/
│   │   ├── SceneEditor.tsx        (mise à jour avec assets)
│   │   └── SceneGraphView.tsx
│   └── Layout/
│       ├── Header.tsx
│       └── Layout.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── ScenarioEditor.tsx
│   ├── Assets.tsx                 ✨ Page bibliothèque
│   ├── Settings.tsx
│   └── Login.tsx
├── services/
│   └── aiService.ts               ✨ Service génération IA
├── store/
│   ├── authStore.ts
│   └── scenarioStore.ts
├── types/
│   └── index.ts                   (mise à jour avec Asset)
├── graphql/
│   ├── client.ts
│   └── queries.ts                 (mise à jour avec mutations Asset)
└── App.tsx
```

---

## 🧪 Utilisation Rapide

### Créer votre premier scénario avec IA

1. **Connexion**
   ```
   Email: admin@test.com
   Password: 123456
   ```

2. **Créer un scénario**
   - Cliquer "Nouveau scénario"
   - Titre: "Ma première aventure"
   - Description: "Une aventure épique"

3. **Ajouter une scène avec image IA**
   - Cliquer "Ajouter une scène"
   - Titre: "Entrée du château"
   - Texte: "Vous vous trouvez devant un château mystérieux..."
   - Onglet "IA Génération"
   - Prompt: "medieval castle at sunset, mysterious atmosphere"
   - Cliquer "Générer"

4. **Ajouter des choix**
   - "Entrer dans le château" → Créer nouvelle scène
   - "Explorer les environs" → Créer nouvelle scène

5. **Visualiser le graphe**
   - Les scènes apparaissent dans la vue graphique
   - Les connexions montrent les choix

---

## 🔌 Connexion au Backend Django

### Configuration Backend

Dans le backend Django, vous devez implémenter :

1. **Modèles MongoDB**
   - Asset (type, name, url, metadata, uploaded_by)
   - Scene (scenario_id, image_id, sound_id)
   - Choice (from_scene_id, to_scene_id)

2. **Mutations GraphQL**
   - `uploadAsset(file, type, name)`
   - `generateImageWithAI(prompt)`
   - `generateSoundWithAI(prompt)`
   - `deleteAsset(id)`

3. **Queries GraphQL**
   - `assets(type)` - liste des assets
   - Modifier `scenario(id)` pour inclure les assets peuplés

### Exemple de configuration Django

```python
# settings.py
GRAPHENE = {
    'SCHEMA': 'app.schema.schema'
}

# Pour upload de fichiers
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

---

## 🐛 Dépannage

### L'application ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Les images IA ne se génèrent pas
- Vérifier que `VITE_HUGGINGFACE_API_KEY` est dans `.env`
- Vérifier que la clé API est valide
- En mode dev, des placeholders sont utilisés par défaut

### Erreur CORS
- Vérifier que le backend Django autorise l'origine du frontend
- Ajouter dans Django `CORS_ALLOWED_ORIGINS = ['http://localhost:5173']`

---

## 📚 Documentation Complète

- **Guide d'implémentation** : Voir `IMPLEMENTATION.md`
- **Architecture backend** : Voir le diagramme fourni dans la documentation du projet

---

## 🤝 Contribution

Ce projet fait partie d'un travail de groupe. Les tâches ont été réparties :

- **Frontend Web (Backoffice)** : Ce repo ✅
- **Frontend Mobile (React Native)** : Autre repo
- **Backend API (Django + GraphQL)** : Autre repo
- **Base de données (MongoDB)** : Intégré au backend
- **IA (Génération assets)** : Intégré ici ✅

---

## 📞 Support

En cas de problème :
1. Vérifier `IMPLEMENTATION.md` pour les détails techniques
2. Vérifier que le backend est en cours d'exécution
3. Vérifier la console navigateur pour les erreurs

---

Bon développement ! 🚀

