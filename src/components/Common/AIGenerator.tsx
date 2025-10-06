import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Asset } from '../../types';
import Button from './Button';
import toast from 'react-hot-toast';

interface AIGeneratorProps {
  type: 'image' | 'sound';
  onAssetGenerated: (asset: Asset) => void;
  sceneContext?: string; // Context to help AI generation
}

const AIGenerator: React.FC<AIGeneratorProps> = ({
  type,
  onAssetGenerated,
  sceneContext
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<Asset | null>(null);

  const generateWithAI = async () => {
    if (!prompt.trim() && !sceneContext) {
      toast.error('Veuillez entrer une description ou avoir un contexte de scène');
      return;
    }

    setIsGenerating(true);

    try {
      const finalPrompt = prompt.trim() || sceneContext || '';

      if (type === 'image') {
        // TODO: Replace with actual Hugging Face / Stable Diffusion API call
        // Example with Hugging Face Inference API:
        // const response = await fetch(
        //   "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        //   {
        //     headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        //     method: "POST",
        //     body: JSON.stringify({ inputs: finalPrompt }),
        //   }
        // );
        // const blob = await response.blob();
        // const imageUrl = URL.createObjectURL(blob);

        // For now, simulate with placeholder
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Placeholder image (in production, this would be the AI-generated image)
        const placeholderUrl = `https://placehold.co/512x512/4F46E5/FFFFFF/png?text=${encodeURIComponent('AI: ' + finalPrompt.slice(0, 20))}`;
        
        const newAsset: Asset = {
          id: `ai-${Date.now()}`,
          type: 'image',
          name: `AI Generated: ${finalPrompt.slice(0, 30)}...`,
          url: placeholderUrl,
          uploadedBy: 'current-user-id',
          createdAt: new Date().toISOString(),
          metadata: {
            aiGenerated: true,
            prompt: finalPrompt,
            model: 'stable-diffusion-2-1'
          }
        };

        setGeneratedPreview(placeholderUrl);
        setGeneratedAsset(newAsset);
        onAssetGenerated(newAsset);
        toast.success('Image générée avec succès !');
        
      } else {
        // TODO: Replace with actual AI sound generation API
        // Example with PlayHT or similar:
        // const response = await fetch('https://api.playht.ai/v1/generate', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     text: finalPrompt,
        //     voice: 'en-US-neural'
        //   })
        // });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // For now, create a placeholder
        const newAsset: Asset = {
          id: `ai-sound-${Date.now()}`,
          type: 'sound',
          name: `AI Generated Sound: ${finalPrompt.slice(0, 30)}...`,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
          uploadedBy: 'current-user-id',
          createdAt: new Date().toISOString(),
          metadata: {
            aiGenerated: true,
            prompt: finalPrompt,
            model: 'playht-v1'
          }
        };

        setGeneratedPreview(newAsset.url);
        setGeneratedAsset(newAsset);
        onAssetGenerated(newAsset);
        toast.success('Son généré avec succès !');
      }

      setShowPromptInput(false);
    } catch (error) {
      console.error('AI Generation error:', error);
      toast.error('Erreur lors de la génération IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoGenerate = () => {
    if (sceneContext) {
      setPrompt(sceneContext);
      generateWithAI();
    } else {
      setShowPromptInput(true);
    }
  };

  const handleRegenerate = () => {
    setGeneratedPreview(null);
    setGeneratedAsset(null);
    setPrompt('');
  };

  return (
    <div className="space-y-3">
      {/* Preview de l'asset généré */}
      {generatedPreview && generatedAsset && (
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {type === 'image' ? 'Image générée' : 'Son généré'} avec succès !
              </span>
            </div>
            <button
              onClick={handleRegenerate}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Générer une autre
            </button>
          </div>

          {type === 'image' ? (
            <div className="relative">
              <img
                src={generatedPreview}
                alt="Generated"
                className="w-full h-auto rounded-md"
              />
            </div>
          ) : (
            <div>
              <audio controls className="w-full">
                <source src={generatedPreview} />
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </div>
          )}

          {generatedAsset.metadata?.prompt && (
            <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
              <strong>Prompt:</strong> {generatedAsset.metadata.prompt}
            </div>
          )}
        </div>
      )}

      {/* Formulaire de génération */}
      {!generatedPreview && !showPromptInput ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={Sparkles}
            onClick={handleAutoGenerate}
            loading={isGenerating}
            className="flex-1"
          >
            {type === 'image' ? 'Générer une image avec IA' : 'Générer un son avec IA'}
          </Button>
          {!sceneContext && (
            <Button
              type="button"
              variant="secondary"
              icon={Wand2}
              onClick={() => setShowPromptInput(true)}
              className="flex-1"
            >
              Prompt personnalisé
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-start space-x-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description pour l'IA
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  type === 'image'
                    ? 'Ex: Un château médiéval mystérieux au crépuscule, avec des nuages sombres...'
                    : 'Ex: Musique d\'ambiance mystérieuse avec violons et sons de vent...'
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isGenerating}
              />
              <p className="mt-1 text-xs text-gray-600">
                Plus la description est détaillée, meilleur sera le résultat
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={generateWithAI}
              loading={isGenerating}
              disabled={!prompt.trim()}
              icon={isGenerating ? Loader2 : type === 'image' ? ImageIcon : Volume2}
              className="flex-1"
            >
              {isGenerating ? 'Génération en cours...' : 'Générer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPromptInput(false);
                setPrompt('');
              }}
              disabled={isGenerating}
            >
              Annuler
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cela peut prendre quelques secondes...
            </div>
          )}
        </div>
      )}

      {/* AI Model Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <p className="font-medium mb-1">ℹ️ Modèles IA utilisés:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {type === 'image' ? (
            <>
              <li>Stable Diffusion 2.1 (Hugging Face)</li>
              <li>Gratuit via API Inference</li>
            </>
          ) : (
            <>
              <li>PlayHT / Coqui TTS (Text-to-Speech)</li>
              <li>Free tier disponible</li>
            </>
          )}
        </ul>
      </div>
      )
    </div>
  );
};

export default AIGenerator;

