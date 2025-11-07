# Frontend React - Application Narratif Interactif

Interface web pour une application de **livre dont vous êtes le héros**, permettant la création et la navigation à travers des **scénarios**, **scènes** et **choix**.  
Ce frontend interagit avec le backend Django via une **API GraphQL** pour offrir une expérience narrative interactive.

---

## 🚀 Fonctionnalités

- **Authentification** via API GraphQL (connexion, déconnexion, sessions JWT)
- **Tableau de bord** des scénarios et scènes créés
- **Éditeur de scénario interactif** :
  - Création et modification de scénarios
  - Ajout, suppression et édition de scènes
  - Liaison de scènes par des **choix** (branches narratives)
  - Vue graphique du graphe narratif (via `SceneGraphView`)
- **Protection des routes** selon le rôle utilisateur (admin/joueur)
- **Interface fluide et moderne** (React + Tailwind)
- **Intégration complète avec l’API GraphQL Django**

---

## 🛠️ Stack Technique

- **React 18 + TypeScript**
- **Vite** (pour un build rapide et léger)
- **Apollo Client** (communication GraphQL)
- **React Router v6**
- **Tailwind CSS** (design moderne et responsive)
- **ESLint + Prettier** (qualité de code)
- **JWT** (authentification sécurisée avec le backend Django)

---

## 📂 Structure du projet

src/
├── components/
│ ├── Common/ # Composants réutilisables
│ ├── Layout/ # Layout global (header, sidebar, etc.)
│ └── ScenarioEditor/ # Outils de création et édition de scénarios
│ ├── SceneEditor.tsx
│ ├── SceneGraphView.tsx
│ └── ProtectedRoute.tsx
│
├── graphql/
│ ├── client.ts # Configuration Apollo Client
│ └── queries.ts # Requêtes et mutations GraphQL
│
├── pages/
│ ├── Dashboard.tsx # Page principale (liste des scénarios)
│ ├── Login.tsx # Authentification
│ ├── ScenarioEditor.tsx # Page d’édition des scénarios
│ └── Settings.tsx # Paramètres utilisateur
│
├── store/ # (optionnel) Gestion d’état global
│
├── types/
│ └── index.ts # Types TypeScript globaux
│
├── utils/
│ ├── App.tsx # Point d’entrée de l’application
│ ├── index.css # Styles globaux
│ ├── main.tsx # Initialisation React + Router + Apollo
│ └── vite-env.d.ts # Déclarations d’environnement Vite
│
├── index.html
└── package-lock.json

---

## ⚙️ Installation et Lancement

### 1️⃣ Cloner le projet

```bash
git clone <repository-url>
cd veh-tpi-frontend
```

2️⃣ Installer les dépendances
npm install

# ou

yarn install

3️⃣ Lancer le serveur de développement
npm run dev

5173

🔗 Intégration avec le Backend Django

Le front communique avec le backend via Apollo Client configuré dans src/graphql/client.ts.

Exemple de requête GraphQL (Query → SELECT)
export const GET_SCENARIOS = gql`  query {
  allScenarios {
    mongoId
    title
    description
    isPublished
  }
}`;

Exemple de mutation (Mutation → INSERT / UPDATE / DELETE)
export const CREATE_SCENARIO = gql`  mutation CreateScenario($input: CreateScenarioInput!) {
    createScenario(input: $input) {
      scenario {
        mongoId
        title
        description
        isPublished
      }
      success
      message
    }
  }`;

## 🎨 Éditeur de Scénario

L’éditeur est le cœur du projet. Il permet aux **créateurs** de concevoir facilement des récits interactifs :

- 🧩 **Création et édition de scénarios**
- 🖋️ **Ajout, modification et suppression de scènes**
- 🔀 **Création de choix** reliant plusieurs scènes (branches narratives)
- 🌐 **Visualisation du graphe narratif** via `SceneGraphView`
- 💾 **Sauvegarde automatique** via l’API GraphQL
- 🔒 **Accès protégé** (réservé aux créateurs connectés)

## 🚀 Fonctionnalités principales

✨ **Pour les créateurs**

- Créer et éditer des scénarios
- Ajouter des scènes et des choix
- Relier les scènes entre elles de façon interactive
- Générer des assets visuels et audio pour enrichir l’histoire

🎮 **Pour les joueurs**

- Explorer les scénarios créés
- Faire des choix qui influencent le déroulement de l’histoire
- Suivre sa progression et rejouer différentes branches

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
