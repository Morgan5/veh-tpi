# VEH - Éditeur de Scénarios

Application web React pour créer et éditer des scénarios interactifs dans l'univers **VEH (Vous Êtes le Héros)**. Cette application permet aux auteurs de créer des histoires à embranchements avec une interface visuelle intuitive basée sur des graphes.

## 🎯 Fonctionnalités

- **Authentification JWT** : Connexion sécurisée avec gestion de session
- **Dashboard** : Vue d'ensemble des scénarios créés
- **Éditeur de scénarios** : Création et modification de scénarios interactifs
  - Visualisation graphique des scènes avec React Flow
  - Édition de scènes (titre, contenu, choix)
  - Gestion des connexions entre scènes
  - Génération automatique d'assets (images, sons, musiques) via le backend
- **Gestion des scènes** : Ajout, modification, suppression de scènes
- **Gestion des choix** : Création de branches narratives avec conditions
- **Paramètres** : Configuration de l'application

## 🛠️ Stack Technique

- **Framework** : React 18.3.1 avec TypeScript
- **Build Tool** : Vite 7.2.1
- **Routing** : React Router DOM 7.7.0
- **GraphQL** : Apollo Client 3.13.8
- **State Management** : Zustand 5.0.6
- **Formulaires** : React Hook Form 7.60.0 avec Zod 4.0.5
- **Visualisation de graphes** : React Flow 11.11.4 avec Dagre 0.8.5
- **UI** : Tailwind CSS 3.4.1
- **Icônes** : Lucide React 0.344.0
- **Notifications** : React Hot Toast 2.5.2

## 📋 Prérequis

- Node.js ≥ 18.x et npm ≥ 9 (ou pnpm/yarn)
- Backend GraphQL Django démarré et accessible (par défaut sur `http://localhost:8000/graphql/`)

## 🔧 Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd veh-tpi
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'URL de l'API GraphQL** (si nécessaire)
   - Créer un fichier `.env` à la racine du projet :
     ```bash
     VITE_GRAPHQL_URL=http://localhost:8000/graphql/
     ```
   - Par défaut, l'application utilise `http://localhost:8000/graphql/`

4. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173` (ou le port indiqué par Vite)

## 📜 Scripts disponibles

- `npm run dev` : Lance le serveur de développement Vite
- `npm run build` : Compile l'application pour la production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run format` : Formate le code avec Prettier
- `npm run format:check` : Vérifie le formatage du code

## 📁 Structure du projet

```
veh-tpi/
├── src/
│   ├── components/          # Composants React réutilisables
│   │   ├── Common/         # Composants communs (Button, LoadingSpinner)
│   │   ├── Layout/         # Composants de mise en page (Header, Layout)
│   │   └── ScenarioEditor/ # Composants de l'éditeur (SceneEditor, SceneGraphView)
│   ├── graphql/            # Configuration GraphQL
│   │   ├── client.ts       # Configuration Apollo Client
│   │   └── queries.ts      # Requêtes et mutations GraphQL
│   ├── pages/              # Pages de l'application
│   │   ├── Dashboard.tsx   # Tableau de bord
│   │   ├── Login.tsx       # Page de connexion
│   │   ├── ScenarioEditor.tsx # Éditeur de scénarios
│   │   └── Settings.tsx    # Paramètres
│   ├── store/              # Stores Zustand
│   │   ├── authStore.ts    # Gestion de l'authentification
│   │   └── scenarioStore.ts # Gestion des scénarios
│   ├── types/              # Définitions TypeScript
│   │   └── index.ts        # Types partagés
│   ├── utils/              # Utilitaires
│   │   ├── dataMapping.ts  # Mapping des données GraphQL
│   │   └── postionComputing.ts # Calcul des positions des nœuds
│   ├── App.tsx             # Composant racine
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── index.html              # Template HTML
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
├── tailwind.config.js      # Configuration Tailwind CSS
└── eslint.config.js        # Configuration ESLint
```

## 🔌 API GraphQL

L'application se connecte à un backend Django GraphQL. Les principales opérations utilisées :

- **Authentification** : `login`, `createUser`
- **Scénarios** : `allScenarios`, `scenario`, `scenarioById`, `createScenario`, `updateScenario`
- **Scènes** : `scenesByScenario`, `createScene`, `updateScene`, `deleteScene`
- **Choix** : `choicesByScene`, `createChoice`, `updateChoice`, `deleteChoices`

Assurez-vous que le backend implémente ces opérations avec les champs attendus (voir `src/graphql/queries.ts`).

## 🎨 Interface utilisateur

L'application utilise Tailwind CSS avec un thème personnalisé. Les composants principaux incluent :

- **SceneGraphView** : Visualisation interactive du graphe de scénario avec React Flow
- **SceneEditor** : Éditeur de scènes avec support pour la génération d'assets
- **Layout** : Mise en page avec header et navigation

## 🔐 Authentification

L'authentification utilise JWT stocké dans le store Zustand. Les routes protégées sont gérées par le composant `ProtectedRoute`.

## 🚀 Déploiement

Pour créer une version de production :

```bash
npm run build
```

Les fichiers compilés seront générés dans le dossier `dist/`.

## 📝 Notes

- Cette application fait partie du projet **VEH (Vous Êtes le Héros)** du Master MBDS 2024/2025
- Le backend Django doit être démarré pour que l'application fonctionne correctement
- La génération d'assets (images, sons, musiques) est gérée par le backend via des flags dans les mutations GraphQL
