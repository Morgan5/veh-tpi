# 🤖 Guide des Modèles IA

## Configuration des Modèles d'IA pour la Génération d'Assets

---

## 🎨 **GÉNÉRATION D'IMAGES**

### 1. Hugging Face (GRATUIT 100%) ⭐ Recommandé

**Avantages** :
- ✅ Complètement gratuit
- ✅ Pas de limite mensuelle stricte
- ✅ Plusieurs modèles disponibles
- ✅ Facile à configurer

**Configuration** :

```bash
# .env
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Obtenir une clé API** :
1. Créer un compte : https://huggingface.co/join
2. Aller dans Settings → Access Tokens : https://huggingface.co/settings/tokens
3. Créer un nouveau token (Read access suffit)
4. Copier la clé (commence par `hf_`)

**Modèles disponibles** :

| Modèle | Description | Qualité | Vitesse |
|--------|-------------|---------|---------|
| `stabilityai/stable-diffusion-2-1` | Défaut, équilibré | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| `stabilityai/stable-diffusion-xl-base-1.0` | Meilleure qualité | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| `runwayml/stable-diffusion-v1-5` | Plus rapide | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `prompthero/openjourney-v4` | Style artistique | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| `dreamshaper-8` | Fantasy/Anime | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Exemples de prompts** :

```typescript
// Château médiéval
"medieval castle at sunset, dark atmosphere, detailed, 4k"

// Dragon doré
"golden dragon flying in the sky, fantasy art, epic, detailed"

// Forêt mystérieuse
"mysterious dark forest, fog, moonlight, atmospheric, cinematic"
```

**Utilisation dans le code** :

```typescript
import { generateImageWithAI } from './services/aiService';

// Défaut (Stable Diffusion 2.1)
const result = await generateImageWithAI("medieval castle");

// Modèle spécifique
const result = await generateImageWithAI(
  "medieval castle",
  undefined,
  "stabilityai/stable-diffusion-xl-base-1.0"
);
```

---

## 🎵 **GÉNÉRATION DE SONS/MUSIQUE**

### 1. Hugging Face - MusicGen (GRATUIT 100%) ⭐ Recommandé

**Avantages** :
- ✅ Complètement gratuit
- ✅ Génération de musique de qualité
- ✅ Utilise la même clé API que les images
- ✅ Plusieurs durées disponibles

**Modèles disponibles** :

| Modèle | Description | Utilisation |
|--------|-------------|-------------|
| `facebook/musicgen-small` | Musique générale | Ambiances, musiques de fond |
| `facebook/musicgen-medium` | Meilleure qualité | Musiques principales |
| `facebook/musicgen-large` | Qualité maximale | Production de qualité |
| `suno/bark` | Voix + effets | Dialogues, narration, bruitages |
| `facebook/audiocraft` | Sons variés | Effets sonores complexes |

**Exemples de prompts** :

```typescript
// Musique mystérieuse
"mysterious ambient music with violins and piano"

// Musique épique
"epic orchestral music with drums and horns, cinematic"

// Ambiance sombre
"dark atmospheric music, suspense, horror style"

// Musique médiévale
"medieval tavern music with flute and lute"
```

**Utilisation** :

```typescript
import { generateSoundWithAI } from './services/aiService';

// Défaut (MusicGen Small)
const result = await generateSoundWithAI("mysterious ambient music");

// Modèle spécifique
const result = await generateSoundWithAI(
  "epic orchestral music",
  undefined,
  "facebook/musicgen-medium"
);
```

---

### 2. ElevenLabs TTS (Free Tier: 10,000 chars/mois) 🎙️

**Avantages** :
- ✅ Qualité vocale exceptionnelle
- ✅ Plusieurs voix disponibles
- ✅ Support multilingue
- ✅ Free tier généreux

**Inconvénients** :
- ⚠️ Limité à 10,000 caractères/mois
- ⚠️ Uniquement pour la voix (pas de musique)

**Configuration** :

```bash
# .env
VITE_ELEVENLABS_API_KEY=your_key_here
```

**Obtenir une clé API** :
1. Créer un compte : https://elevenlabs.io/
2. Aller dans Profile → API Key
3. Copier la clé

**Voix disponibles** :

| Voice ID | Nom | Description |
|----------|-----|-------------|
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Voix féminine calme |
| `ErXwobaYiN019PkySvjV` | Antoni | Voix masculine bien modulée |
| `MF3mGyEYCl7XYWbV9V6O` | Elli | Voix féminine jeune |
| `TxGEqnHWrfWFTfGW9XjX` | Josh | Voix masculine mature |

**Utilisation** :

```typescript
import { generateVoiceWithElevenLabs } from './services/aiService';

const result = await generateVoiceWithElevenLabs(
  "Vous vous trouvez devant un château mystérieux...",
  undefined,
  "21m00Tcm4TlvDq8ikWAM" // Rachel voice
);
```

---

## 📊 **COMPARAISON DES SOLUTIONS**

### Images

| Solution | Coût | Qualité | Vitesse | Limite |
|----------|------|---------|---------|--------|
| Hugging Face | Gratuit | ⭐⭐⭐⭐ | ⭐⭐⭐ | Aucune |
| Midjourney | $10/mois | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 200 images |
| DALL-E 3 | Pay-per-use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0.04/image |

### Sons

| Solution | Coût | Qualité | Type | Limite |
|----------|------|---------|------|--------|
| MusicGen | Gratuit | ⭐⭐⭐⭐ | Musique | Aucune |
| Bark | Gratuit | ⭐⭐⭐ | Voix + FX | Aucune |
| ElevenLabs | Gratuit* | ⭐⭐⭐⭐⭐ | Voix | 10k chars/mois |
| PlayHT | $7.20/mois | ⭐⭐⭐⭐ | Voix | 2500 mots gratuit |

---

## 🚀 **GUIDE DE DÉMARRAGE RAPIDE**

### Étape 1 : Créer le fichier `.env`

```bash
# Copier le template
cp .env.example .env
```

### Étape 2 : Configuration minimale (Gratuit)

```env
# Hugging Face (obligatoire)
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# Backend
VITE_GRAPHQL_URL=http://localhost:8000/graphql

# Stockage local (dev)
VITE_STORAGE_TYPE=local
```

### Étape 3 : Configuration avancée (Optionnel)

```env
# ElevenLabs pour voix premium
VITE_ELEVENLABS_API_KEY=your_key_here

# AWS S3 pour prod
VITE_STORAGE_TYPE=s3
VITE_AWS_ACCESS_KEY_ID=xxx
VITE_AWS_SECRET_ACCESS_KEY=xxx
VITE_AWS_BUCKET_NAME=my-bucket
```

---

## 💡 **CONSEILS D'UTILISATION**

### Pour les Images

**✅ Bons prompts** :
```
"medieval castle at sunset, detailed architecture, 4k, professional"
"golden dragon in flight, fantasy art, epic composition, detailed scales"
"dark forest path, moonlight filtering through trees, atmospheric, cinematic"
```

**❌ Mauvais prompts** :
```
"château" (trop vague)
"dragon" (manque de détails)
"image" (pas descriptif)
```

**Astuces** :
- Ajouter "detailed, 4k, professional" améliore la qualité
- Mentionner le style : "fantasy art", "cinematic", "photorealistic"
- Être précis : couleurs, lumière, composition

### Pour les Sons

**✅ Bons prompts** :
```
"mysterious ambient music with soft piano and strings, slow tempo"
"epic battle music with drums and brass, fast tempo, intense"
"peaceful nature ambiance with birds chirping and water flowing"
```

**❌ Mauvais prompts** :
```
"musique" (trop vague)
"son" (pas descriptif)
"noise" (résultat imprévisible)
```

**Astuces** :
- Mentionner les instruments
- Indiquer le tempo : slow, medium, fast
- Décrire l'ambiance : mysterious, epic, peaceful

---

## 🔧 **DÉPANNAGE**

### Erreur: "API key not found"

```bash
# Vérifier que la clé est dans .env
cat .env | grep HUGGINGFACE

# Redémarrer le serveur dev
npm run dev
```

### Erreur: "Model is loading"

Les modèles Hugging Face peuvent prendre 20-30s à démarrer la première fois.
C'est normal ! Réessayez après quelques secondes.

### Erreur: "Rate limit exceeded"

Si vous générez trop d'images/sons rapidement :
- Attendre quelques minutes
- Utiliser plusieurs comptes Hugging Face
- Passer à un plan payant

### Images de mauvaise qualité

1. Améliorer le prompt (plus de détails)
2. Essayer un modèle différent (SDXL pour meilleure qualité)
3. Ajouter des mots-clés de qualité : "4k", "detailed", "professional"

---

## 📚 **RESSOURCES**

### Documentation Officielle

- **Hugging Face** : https://huggingface.co/docs/api-inference
- **Stable Diffusion** : https://stability.ai/
- **MusicGen** : https://huggingface.co/facebook/musicgen-small
- **ElevenLabs** : https://docs.elevenlabs.io/

### Prompts Templates

- **Images** : https://prompthero.com/
- **Musique** : https://www.musicgen.com/prompts

### Communauté

- Discord Hugging Face : https://hf.co/join/discord
- Reddit r/StableDiffusion : https://reddit.com/r/StableDiffusion

---

## 🎯 **RÉSUMÉ : MEILLEURE CONFIGURATION**

```env
# Configuration recommandée pour débuter (100% Gratuit)

# Hugging Face (Images + Sons)
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# Backend
VITE_GRAPHQL_URL=http://localhost:8000/graphql

# Stockage local (développement)
VITE_STORAGE_TYPE=local
```

**Coût total : 0€** ✅

**Fonctionnalités** :
- ✅ Génération d'images illimitée
- ✅ Génération de musique illimitée
- ✅ Plusieurs modèles disponibles
- ✅ Qualité professionnelle

---

**Besoin d'aide ?** Consultez `IMPLEMENTATION.md` ou `QUICKSTART.md`

