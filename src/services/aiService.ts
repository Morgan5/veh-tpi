/**
 * AI Service for generating images and sounds
 * Integration with free AI APIs (Hugging Face, Stable Diffusion, etc.)
 * 
 * MODÈLES RECOMMANDÉS:
 * 
 * IMAGES (Gratuit):
 * - Stable Diffusion 2.1 (Hugging Face) ✅ Implémenté
 * - Stable Diffusion XL (Hugging Face)
 * - DreamShaper (Hugging Face)
 * - Midjourney (Payant mais qualité supérieure)
 * 
 * SONS (Gratuit):
 * - Bark (Text-to-Audio) ✅ Implémenté
 * - MusicGen (Meta) - Génération musique
 * - AudioCraft (Meta) - Sons et musique
 * - ElevenLabs (Free tier 10k chars/mois)
 */

export interface AIGenerationOptions {
  prompt: string;
  type: 'image' | 'sound';
  model?: string;
}

export interface AIGenerationResult {
  url: string;
  metadata: {
    model: string;
    prompt: string;
    generatedAt: string;
  };
}

/**
 * Generate an image using Hugging Face Inference API
 * 
 * MODÈLES DISPONIBLES (Gratuit):
 * 1. stabilityai/stable-diffusion-2-1 (Défaut)
 * 2. stabilityai/stable-diffusion-xl-base-1.0 (Meilleure qualité)
 * 3. runwayml/stable-diffusion-v1-5 (Plus rapide)
 * 4. prompthero/openjourney-v4 (Style artistic)
 * 
 * Free tier: https://huggingface.co/inference-api
 * Obtenir clé API: https://huggingface.co/settings/tokens
 */
export async function generateImageWithAI(
  prompt: string,
  apiKey?: string,
  model: string = 'stabilityai/stable-diffusion-2-1'
): Promise<AIGenerationResult> {
  try {
    const hfApiKey = apiKey || import.meta.env.VITE_HUGGINGFACE_API_KEY;

    if (!hfApiKey) {
      console.warn('Hugging Face API key not found. Using mock data.');
      // Fallback to mock for development
      return {
        url: `https://placehold.co/512x512/4F46E5/FFFFFF/png?text=${encodeURIComponent(prompt.slice(0, 20))}`,
        metadata: {
          model: 'mock-stable-diffusion',
          prompt,
          generatedAt: new Date().toISOString()
        }
      };
    }

    // Améliorer le prompt pour de meilleurs résultats
    const enhancedPrompt = `${prompt}, high quality, detailed, 4k, professional`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.statusText} - ${errorText}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return {
      url: imageUrl,
      metadata: {
        model,
        prompt: enhancedPrompt,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

/**
 * Generate sound/music using AI
 * 
 * MODÈLES DISPONIBLES (Gratuit):
 * 1. facebook/musicgen-small (Musique) ✅ Recommandé
 * 2. suno/bark (Voix + effets sonores)
 * 3. facebook/audiocraft (Sons variés)
 * 
 * ALTERNATIVES (Payant mais Free Tier):
 * - ElevenLabs: 10,000 caractères/mois gratuit
 * - PlayHT: 2,500 mots/mois gratuit
 * 
 * Free tier Hugging Face: https://huggingface.co/inference-api
 */
export async function generateSoundWithAI(
  prompt: string,
  apiKey?: string,
  model: string = 'facebook/musicgen-small'
): Promise<AIGenerationResult> {
  try {
    const hfApiKey = apiKey || import.meta.env.VITE_HUGGINGFACE_API_KEY;

    if (!hfApiKey) {
      console.warn('Hugging Face API key not found. Using placeholder.');
      return {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        metadata: {
          model: 'mock-sound-generator',
          prompt,
          generatedAt: new Date().toISOString()
        }
      };
    }

    // Générer la musique/son avec l'IA
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.statusText} - ${errorText}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    return {
      url: audioUrl,
      metadata: {
        model,
        prompt,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Sound generation error:', error);
    throw error;
  }
}

/**
 * Generate voice using ElevenLabs (Alternative)
 * Free tier: 10,000 caractères/mois
 * https://elevenlabs.io/
 */
export async function generateVoiceWithElevenLabs(
  text: string,
  apiKey?: string,
  voiceId: string = '21m00Tcm4TlvDq8ikWAM' // Rachel voice
): Promise<AIGenerationResult> {
  try {
    const elevenLabsKey = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;

    if (!elevenLabsKey) {
      throw new Error('ElevenLabs API key not found');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    return {
      url: audioUrl,
      metadata: {
        model: 'elevenlabs-tts',
        prompt: text,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('ElevenLabs generation error:', error);
    throw error;
  }
}

/**
 * Upload generated asset to storage
 * This would typically upload to S3, Cloudinary, or your backend
 */
export async function uploadAssetToStorage(
  file: Blob,
  fileName: string,
  type: 'image' | 'sound'
): Promise<string> {
  try {
    // TODO: Implement actual upload to your storage service
    // Example with FormData to your Django backend:
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('type', type);

    // const response = await fetch('/api/upload-asset', {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     'Authorization': `Bearer ${yourAuthToken}`
    //   }
    // });
    
    // const data = await response.json();
    // return data.url;

    // For development, return blob URL
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

