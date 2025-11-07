# StoryAdmin – Tableau de bord de scénarios interactifs

StoryAdmin est une application React permettant d’administrer des scénarios narratifs interactifs. Elle propose une authentification par JWT, un éditeur graphique des scènes, ainsi qu’une intégration complète avec une API GraphQL.

## Fonctionnalités
- Authentification administrateur avec gestion de session persistante et redirection automatique.
- Tableau de bord listant les scénarios, avec filtres visuels, actions de test et suppression contrôlée.
- Création et édition de scénarios, dont la structure narrative (scènes et choix) est visualisée via un graphe interactif basé sur React Flow.
- Formulaires intelligents validés par Zod et React Hook Form pour garantir la cohérence des données.
- Gestion centralisée de l’état (authentification et scénarios) avec Zustand et persistance locale.
- Notifications utilisateur temps réel (succès/erreur) grâce à React Hot Toast.

## Stack Technique
- `React 18` + `TypeScript`
- `Vite 5` pour le bundling et le développement
- `React Router 7` pour la navigation et les routes protégées
- `Apollo Client 3` (GraphQL) + `InMemoryCache`
- `Tailwind CSS 3` pour le design et les composants UI
- `React Flow 11` pour la visualisation du graphe de scènes
- `Zustand 5` pour la gestion d’état, avec middleware de persistance
- `React Hook Form 7` + `Zod 4` pour les formulaires typés
- `Lucide React` pour les icônes

## Prérequis
- Node.js ≥ 18.17 (LTS recommandé) et npm ≥ 9
- Accès à une API GraphQL compatible avec les schémas utilisés (cf. section ci-dessous)
- Navigateur moderne (Chrome, Firefox, Edge) supportant ES2020

## Installation
1. Cloner le dépôt :
   ```bash
   git clone <url-du-repo>
   cd veh-tpi
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Créer un fichier `.env` à la racine avec l’URL du serveur GraphQL :
   ```bash
   echo "VITE_GRAPHQL_URL=http://localhost:8000/graphql/" > .env
   ```
4. Lancer l’application en mode développement :
   ```bash
   npm run dev
   ```
5. Ouvrir `http://localhost:5173` et se connecter avec des identifiants valides fournis par votre backend.

## API GraphQL
L’application consomme plusieurs opérations GraphQL à travers `src/graphql/queries.ts` :

- **Authentification** : `login(email, password)` retourne `token`, `success`, `message`.
- **Scénarios** :
  - `allScenarios` pour lister les scénarios publiés.
  - `scenarioById(scenarioId)` pour récupérer la structure complète (scènes et choix).
  - `createScenario(input)` et `updateScenario(scenarioId, input)` pour la gestion du cycle de vie.
- **Scènes** : `createScene(input)` et `updateScene(sceneId, input)` gèrent les nœuds narratifs.
- **Choix** : `createChoice`, `updateChoice`, `deleteChoices` permettent de relier les scènes.

Le client Apollo (`src/graphql/client.ts`) ajoute automatiquement le header `Authorization: JWT <token>` si un jeton est présent dans le store d’authentification et gère les erreurs réseau (déconnexion forcée en cas de 401 ou redirection vers `/login`).

## Application React
- **Architecture** :
  - `src/App.tsx` initialise le routeur, Apollo Provider et les routes protégées.
  - `src/pages` contient les vues métier (`Login`, `Dashboard`, `ScenarioEditor`, `Settings`).
  - `src/components/ScenarioEditor` englobe le graphe (`SceneGraphView`) et l’éditeur modal (`SceneEditor`).
  - `src/store` centralise les états `authStore` et `scenarioStore`.
  - `src/utils` fournit la conversion GraphQL → modèles (`dataMapping`) et la logique de positionnement/cycle (`postionComputing`).
- **Interface** : Tailwind CSS et des composants réutilisables (bouton, spinner) assurent une cohérence visuelle.
- **Formulaires** : les validations sont typées, les soumissions asynchrones affichent des toast contextuels.

## Sécurité
- Authentification basée sur JWT stocké localement via Zustand + localStorage, avec sérialisation limitée (`partialize`).
- Routes protégées (`ProtectedRoute`) empêchant l’accès aux pages internes sans authentification.
- Gestion centralisée des erreurs GraphQL : redirection vers `/login` sur `Authentication required` et purge du store sur 401.
- Validation côté client (Zod) pour réduire les entrées invalides avant envoi à l’API.

## Déploiement
1. Générer le bundle de production :
   ```bash
   npm run build
   ```
2. Prévisualiser localement :
   ```bash
   npm run preview
   ```
3. Déployer le dossier `dist/` sur un serveur web statique.
4. Configurer la variable d’environnement `VITE_GRAPHQL_URL` sur la plateforme d’hébergement (build et runtime) pour pointer vers l’API GraphQL publique.

## Configuration
- Variables d’environnement :
  - `VITE_GRAPHQL_URL` (obligatoire) – URL complète de l’endpoint GraphQL.
- Thème/UI : personnaliser `tailwind.config.js` et `src/index.css`.
- Icônes et graphes : ajuster `lucide-react` et `ReactFlow` selon vos besoins.
- Stores : étendre `authStore` et `scenarioStore` pour inclure d’autres attributs (rôles, états supplémentaires, etc.).

## Performance
- Utilisation de `ReactFlow` avec `useMemo` et `useNodesState` pour optimiser le recalcul du graphe.
- Cache Apollo (`InMemoryCache`) limitant les requêtes répétées.
- Validation paresseuse des formulaires (React Hook Form) évitant les rendus inutiles.
- Persistence sélective dans Zustand pour limiter les écritures dans le stockage local.
- Possibilité d’activer le code-splitting via Vite si l’application s’étend.

## Monitoring et Debug
- `react-hot-toast` offre un feedback en temps réel sur les actions utilisateur.
- Activer les DevTools Apollo pour inspecter le cache, les requêtes et les réponses GraphQL.
- Utiliser les DevTools React/Zustand pour suivre l’état global.
- Journalisation centralisée des erreurs réseau via `errorLink` (console + redirections).
- Intégrer des outils externes (Sentry, LogRocket) en ajoutant des links Apollo ou des boundary React.

## Contribution
1. Forker le dépôt et créer une branche de fonctionnalité (`feature/ma-fonctionnalite`).
2. Respecter le formatage (`npm run lint`) et ajouter des tests si nécessaire.
3. Décrire clairement les changements dans les Pull Requests (fonctionnalité, corrections, impacts API).
4. Synchroniser avec la branche principale avant fusion.

## Licence
Ce projet n’inclut pas encore de licence explicite. Ajoutez un fichier `LICENSE` (MIT, Apache 2.0, etc.) selon les besoins de votre organisation avant une distribution publique.
