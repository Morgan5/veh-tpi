# 🏗️ Architecture des Composants

## Frontend Web Backoffice - Assets & IA

---

## 📐 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│                          (App.tsx)                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
       ┌────────▼────────┐ ┌───▼────┐  ┌──────▼──────┐
       │   Dashboard     │ │ Assets │  │   Scenario  │
       │    (page)       │ │ (page) │  │ Editor(page)│
       └────────┬────────┘ └───┬────┘  └──────┬──────┘
                │              │               │
                │              │               │
                │      ┌───────▼───────┐       │
                │      │ AssetManager  │       │
                │      │  (component)  │       │
                │      └───────┬───────┘       │
                │              │               │
                │              │        ┌──────▼──────┐
                │              │        │ SceneEditor │
                │              │        │ (component) │
                │              │        └──────┬──────┘
                │              │               │
                └──────────────┴───────────────┴──────────┐
                                                           │
                        ┌──────────────────────────────────┤
                        │                                  │
                ┌───────▼──────┐              ┌───────────▼─────────┐
                │ AssetUploader│              │    AIGenerator      │
                │  (component) │              │    (component)      │
                └───────┬──────┘              └───────────┬─────────┘
                        │                                  │
                        └──────────────┬───────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │    aiService.ts     │
                            │  (service layer)    │
                            └──────────┬──────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
          ┌─────────▼────────┐  ┌──────▼─────┐  ┌────────▼────────┐
          │  Hugging Face    │  │  PlayHT   │  │  Storage (S3/   │
          │  (Image AI)      │  │ (Sound AI)│  │   Cloudinary)   │
          └──────────────────┘  └───────────┘  └─────────────────┘
```

---

## 🧩 Flux de Données

### 1. Upload d'Asset

```
┌────────────┐
│    User    │
└─────┬──────┘
      │ Sélectionne fichier
      ▼
┌─────────────────┐
│ AssetUploader   │ ───── Validation (type, taille)
└─────┬───────────┘
      │ createFormData()
      ▼
┌─────────────────┐
│  GraphQL API    │ ───── mutation UploadAsset
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Django Backend  │ ───── Upload vers Storage
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│  MongoDB Asset  │ ───── Sauvegarde métadonnées
└─────┬───────────┘
      │ Retourne Asset
      ▼
┌─────────────────┐
│   SceneEditor   │ ───── Met à jour imageId/soundId
└─────────────────┘
```

### 2. Génération IA d'Asset

```
┌────────────┐
│    User    │
└─────┬──────┘
      │ Entre prompt
      ▼
┌─────────────────┐
│  AIGenerator    │ ───── Affiche loading
└─────┬───────────┘
      │ generateWithAI(prompt)
      ▼
┌─────────────────┐
│   aiService     │ ───── Appel API externe
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Hugging Face/   │ ───── Génère image/son
│    PlayHT       │
└─────┬───────────┘
      │ Retourne Blob
      ▼
┌─────────────────┐
│   aiService     │ ───── uploadAssetToStorage()
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Django Backend  │ ───── Sauvegarde dans MongoDB
└─────┬───────────┘
      │ Retourne Asset avec metadata.aiGenerated
      ▼
┌─────────────────┐
│   SceneEditor   │ ───── Affiche preview + sauvegarde
└─────────────────┘
```

---

## 🔄 États et Props

### AssetUploader

**Props** :
```typescript
interface AssetUploaderProps {
  type: 'image' | 'sound';
  currentAsset?: Asset;
  onAssetSelected: (asset: Asset) => void;
  onRemove?: () => void;
}
```

**États internes** :
- `isUploading: boolean`
- `preview: string | null`

**Événements** :
- `handleFileSelect()` - Upload fichier
- `handleRemove()` - Supprimer asset

---

### AIGenerator

**Props** :
```typescript
interface AIGeneratorProps {
  type: 'image' | 'sound';
  onAssetGenerated: (asset: Asset) => void;
  sceneContext?: string;
}
```

**États internes** :
- `isGenerating: boolean`
- `prompt: string`
- `showPromptInput: boolean`
- `generatedPreview: string | null`

**Événements** :
- `generateWithAI()` - Lancer génération
- `handleAutoGenerate()` - Utiliser contexte scène

---

### AssetManager

**Props** :
```typescript
interface AssetManagerProps {
  onSelectAsset?: (asset: Asset) => void;
  selectionMode?: boolean;
  filterType?: 'image' | 'sound';
}
```

**États internes** :
- `assets: Asset[]`
- `isLoading: boolean`
- `viewMode: 'grid' | 'list'`
- `searchQuery: string`
- `activeFilter: 'all' | 'image' | 'sound'`
- `showUploader: boolean`

**Événements** :
- `loadAssets()` - Charger depuis API
- `handleDeleteAsset(id)` - Supprimer
- `handleAssetUploaded(asset)` - Ajouter nouveau

---

## 🗂️ Structure des Fichiers

```
src/
├── components/
│   ├── Common/
│   │   ├── AssetUploader.tsx       ← Upload fichiers
│   │   │   ├── Validation taille/type
│   │   │   ├── Prévisualisation
│   │   │   └── FormData creation
│   │   │
│   │   ├── AIGenerator.tsx         ← Génération IA
│   │   │   ├── Interface prompt
│   │   │   ├── Appel aiService
│   │   │   └── États de chargement
│   │   │
│   │   ├── Button.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── AssetManager/
│   │   └── AssetManager.tsx        ← Bibliothèque
│   │       ├── Vue grille/liste
│   │       ├── Recherche & filtres
│   │       ├── CRUD operations
│   │       └── Modal uploader
│   │
│   └── ScenarioEditor/
│       ├── SceneEditor.tsx          ← Intégration assets
│       │   ├── Section image (upload + IA)
│       │   ├── Section son (upload + IA)
│       │   └── Sauvegarde avec assets
│       │
│       └── SceneGraphView.tsx       ← Vue graphique
│
├── pages/
│   ├── Assets.tsx                   ← Page bibliothèque
│   ├── ScenarioEditor.tsx
│   └── Dashboard.tsx
│
├── services/
│   └── aiService.ts                 ← Service IA
│       ├── generateImageWithAI()
│       ├── generateSoundWithAI()
│       └── uploadAssetToStorage()
│
├── types/
│   └── index.ts                     ← Types
│       ├── Asset
│       ├── Scene (avec imageId/soundId)
│       └── Choice (avec fromSceneId/toSceneId)
│
└── graphql/
    └── queries.ts                   ← Queries/Mutations
        ├── GET_ASSETS
        ├── UPLOAD_ASSET
        ├── GENERATE_IMAGE_WITH_AI
        ├── GENERATE_SOUND_WITH_AI
        └── DELETE_ASSET
```

---

## 🎨 Intégration dans SceneEditor

### Avant (Sans Assets)

```tsx
<div>
  <label>Image (URL)</label>
  <input type="text" {...register('image')} />
</div>

<div>
  <label>Audio (URL)</label>
  <input type="text" {...register('audio')} />
</div>
```

### Après (Avec Assets + IA)

```tsx
{/* IMAGE SECTION */}
<div>
  <div className="flex justify-between">
    <label>Image de la scène</label>
    <div>
      <button onClick={() => setAssetMode('upload')}>Upload</button>
      <button onClick={() => setAssetMode('ai')}>IA</button>
    </div>
  </div>
  
  {assetMode === 'upload' ? (
    <AssetUploader
      type="image"
      currentAsset={selectedImage}
      onAssetSelected={setSelectedImage}
    />
  ) : (
    <AIGenerator
      type="image"
      sceneContext={sceneText}
      onAssetGenerated={setSelectedImage}
    />
  )}
</div>

{/* SOUND SECTION */}
<div>
  <label>Son/Musique</label>
  <AssetUploader type="sound" ... />
  <div>ou</div>
  <AIGenerator type="sound" ... />
</div>
```

---

## 🔐 Sécurité

### Validation côté Frontend

```typescript
// AssetUploader.tsx
const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

if (file.size > maxSize) {
  toast.error('Fichier trop volumineux');
  return;
}

if (!file.type.startsWith(type)) {
  toast.error('Type de fichier invalide');
  return;
}
```

### À implémenter côté Backend

```python
# Django validators
from django.core.validators import FileExtensionValidator

class Asset(Document):
    file = FileField(
        validators=[
            FileExtensionValidator(['jpg', 'png', 'gif', 'mp3', 'wav']),
            validate_file_size  # Custom validator
        ]
    )
```

---

## 🚀 Performance

### Optimisations implémentées

1. **Lazy Loading** :
   ```tsx
   // AssetManager charge les assets à la demande
   useEffect(() => {
     loadAssets();
   }, []);
   ```

2. **Prévisualisation optimisée** :
   ```tsx
   // Blob URLs pour preview local (pas de re-upload)
   const localUrl = URL.createObjectURL(file);
   ```

3. **Debouncing sur recherche** :
   ```tsx
   // La recherche filtre localement (pas d'appel API)
   const filteredAssets = assets.filter(asset =>
     asset.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
   ```

### À optimiser côté Backend

- Pagination des assets (limite 50 par page)
- Compression d'images automatique
- CDN pour servir les assets
- Cache des résultats IA

---

## 📊 Métriques

### Complexité des composants

| Composant | Lignes | Complexité | Responsabilités |
|-----------|--------|------------|-----------------|
| AssetUploader | 175 | Moyenne | Upload, validation, preview |
| AIGenerator | 182 | Moyenne | Prompt, API call, preview |
| AssetManager | 320 | Élevée | CRUD, search, filter, views |
| SceneEditor | 350+ | Élevée | Form, choices, assets |
| aiService | 112 | Faible | API wrapper |

### Bundle Size Impact

- AssetUploader : ~5KB
- AIGenerator : ~5KB
- AssetManager : ~8KB
- aiService : ~3KB
- **Total ajouté** : ~21KB (minifié)

---

## 🧪 Points de Test

### Tests à implémenter

```typescript
// AssetUploader.test.tsx
describe('AssetUploader', () => {
  test('rejette fichier trop volumineux');
  test('rejette mauvais type de fichier');
  test('affiche preview pour image');
  test('affiche lecteur pour son');
  test('appelle onAssetSelected avec bon format');
});

// AIGenerator.test.tsx
describe('AIGenerator', () => {
  test('génère avec prompt custom');
  test('génère avec contexte scène');
  test('affiche loading pendant génération');
  test('gère erreur API');
});

// AssetManager.test.tsx
describe('AssetManager', () => {
  test('charge assets au montage');
  test('filtre par recherche');
  test('filtre par type');
  test('change vue grille/liste');
  test('supprime asset');
});
```

---

## 🔄 Cycle de Vie Complet

### Scénario : Créer une scène avec image IA

```
1. User ouvre SceneEditor
   └─→ État: showSceneEditor = true

2. User entre titre et texte de scène
   └─→ État: sceneText mis à jour

3. User clique onglet "IA Génération"
   └─→ État: assetMode = 'ai'

4. AIGenerator s'affiche avec sceneText comme contexte
   └─→ Props: { sceneContext: "Vous êtes dans un château..." }

5. User modifie/confirme le prompt
   └─→ État: prompt = "medieval castle, dark atmosphere"

6. User clique "Générer"
   └─→ generateWithAI() est appelé
   └─→ État: isGenerating = true

7. aiService.generateImageWithAI() appelle Hugging Face
   └─→ API call avec prompt
   └─→ Retourne Blob d'image

8. Image générée est convertie en Asset
   └─→ Asset créé avec metadata.aiGenerated = true
   └─→ setState: isGenerating = false

9. onAssetGenerated(asset) est appelé
   └─→ SceneEditor: setSelectedImage(asset)
   └─→ Preview s'affiche

10. User clique "Enregistrer la scène"
    └─→ SceneEditor crée Scene avec imageId
    └─→ onSave(updatedScene)

11. Scene sauvegardée dans scenario
    └─→ Visible dans SceneGraphView
    └─→ Asset disponible dans AssetManager
```

---

Voilà l'architecture complète des composants Assets et IA ! 🏗️✨

