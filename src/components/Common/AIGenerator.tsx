import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Sparkles, Wand2, Image as ImageIcon, Volume2, Music, Mic, Check } from 'lucide-react';
import { Asset } from '../../types';
import { GENERATE_ASSET } from '../../graphql/queries';
import Button from './Button';
import toast from 'react-hot-toast';

interface AIGeneratorProps {
  type: 'image' | 'sound';
  onAssetGenerated: (asset: Asset) => void;
  onCancel: () => void;
  sceneContext?: string; // Optional context from the scene for better prompts
}

const AIGenerator: React.FC<AIGeneratorProps> = ({
  type,
  onAssetGenerated,
  onCancel,
  sceneContext,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [soundType, setSoundType] = useState<'tts' | 'music'>('tts');
  const [language, setLanguage] = useState('fr');
  const [duration, setDuration] = useState(30);
  const [generatedAsset, setGeneratedAsset] = useState<Asset | null>(null);
  const [generateAsset] = useMutation(GENERATE_ASSET);

  const handleGenerate = async () => {
    if (!assetName.trim() || !description.trim()) {
      toast.error('Veuillez remplir le nom et la description');
      return;
    }

    setIsGenerating(true);
    try {
      // Préparation des variables pour la mutation GraphQL
      const variables: any = {
        type: type,
        name: assetName,
        description: description,
      };

      if (type === 'sound') {
        variables.soundType = soundType;
        if (soundType === 'tts') {
          variables.language = language;
        } else if (soundType === 'music') {
          variables.duration = duration;
        }
      }

      console.log('🤖 Génération IA - Variables:', variables);
      console.log('📡 Envoi de la mutation generateAsset vers:', import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/');
      
      // Envoi de la mutation GraphQL au backend Django
      // Le backend va :
      // - Pour images : Appeler Hugging Face Stable Diffusion
      // - Pour TTS : Utiliser gTTS avec la langue spécifiée
      // - Pour musique : Utiliser MusicGen avec la durée spécifiée
      const { data } = await generateAsset({
        variables,
      });
      
      console.log('📦 Réponse génération IA:', data);

      if (data?.generateAsset?.success && data?.generateAsset?.asset) {
        const assetData = data.generateAsset.asset;
        
        // Utiliser fullUrl si disponible, sinon construire l'URL complète depuis url relative
        let assetUrl = assetData.fullUrl;
        if (!assetUrl && assetData.url) {
          // Si fullUrl n'est pas disponible, construire l'URL complète depuis url relative
          const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/';
          const baseUrl = graphqlUrl.replace('/graphql/', '');
          assetUrl = assetData.url.startsWith('http') 
            ? assetData.url 
            : `${baseUrl}${assetData.url.startsWith('/') ? '' : '/'}${assetData.url}`;
        }
        
        const asset: Asset = {
          id: assetData.id || assetData.mongoId,
          mongoId: assetData.mongoId || assetData.id,
          type: assetData.type,
          name: assetData.name,
          filename: assetData.filename,
          url: assetUrl || assetData.url, // URL complète (fullUrl ou construite)
          fileSize: assetData.fileSize,
          fileSizeMb: assetData.fileSizeMb,
          mimeType: assetData.mimeType,
          metadata: assetData.metadata || {},
          isPublic: assetData.isPublic,
          createdAt: assetData.createdAt,
        };
        
        console.log('🎵 Asset audio créé:', asset);
        console.log('🎵 URL audio (fullUrl):', assetData.fullUrl);
        console.log('🎵 URL audio (relative):', assetData.url);
        console.log('🎵 URL audio (finale):', asset.url);

        setGeneratedAsset(asset);
        toast.success(`${type === 'image' ? 'Image' : 'Son'} généré avec succès !`);
      } else {
        throw new Error(data?.generateAsset?.message || 'Erreur lors de la génération');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Erreur lors de la génération';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAsset = () => {
    if (generatedAsset) {
      onAssetGenerated(generatedAsset);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <span>Générer {type === 'image' ? 'une image' : 'un son'} via IA</span>
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!generatedAsset ? (
            <>
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'asset
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ex: Image de forêt magique"
                />
              </div>

              {/* Description/Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Prompt {sceneContext && (
                    <span className="text-xs text-gray-500">(contexte de la scène disponible)</span>
                  )}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={
                    type === 'image'
                      ? 'ex: Une forêt magique avec des arbres lumineux et des créatures fantastiques'
                      : soundType === 'tts'
                      ? 'ex: Bienvenue dans cette aventure fantastique'
                      : 'ex: Musique d\'ambiance mystérieuse et envoûtante'
                  }
                />
                {sceneContext && (
                  <p className="mt-2 text-xs text-gray-500">
                    <strong>Contexte de la scène :</strong> {sceneContext}
                  </p>
                )}
              </div>

              {/* Sound Type Selection (only for sound) */}
              {type === 'sound' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de son
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="soundType"
                        value="tts"
                        checked={soundType === 'tts'}
                        onChange={(e) => setSoundType(e.target.value as 'tts' | 'music')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Mic className="h-4 w-4" />
                      <span className="text-sm text-gray-700">Text-to-Speech</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="soundType"
                        value="music"
                        checked={soundType === 'music'}
                        onChange={(e) => setSoundType(e.target.value as 'tts' | 'music')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Music className="h-4 w-4" />
                      <span className="text-sm text-gray-700">Musique</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Language Selection (for TTS) */}
              {type === 'sound' && soundType === 'tts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="it">Italien</option>
                  </select>
                </div>
              )}

              {/* Duration Selection (for music) */}
              {type === 'sound' && soundType === 'music' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (secondes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Durée recommandée : 10-60 secondes (la génération peut prendre 1-10 minutes)
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> La génération peut prendre{' '}
                  {type === 'image' ? '10-30 secondes' : soundType === 'tts' ? '1-5 secondes' : '1-10 minutes'}.
                  Veuillez patienter...
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerate}
                  loading={isGenerating}
                  icon={Wand2}
                  disabled={!assetName.trim() || !description.trim()}
                >
                  {isGenerating ? 'Génération en cours...' : 'Générer'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Generated Asset Preview */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-6 w-6" />
                  <span className="font-medium">Asset généré avec succès !</span>
                </div>

                {type === 'image' ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={generatedAsset.url}
                      alt={generatedAsset.name}
                      className="max-w-full max-h-96 mx-auto rounded"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4">
                        <audio 
                      controls 
                      className="w-full"
                      preload="auto"
                      onError={(e) => {
                        console.error('❌ Erreur de chargement audio:', e);
                        console.error('URL audio:', generatedAsset.url);
                        toast.error('Impossible de charger le fichier audio');
                      }}
                      onLoadedMetadata={(e) => {
                        console.log('✅ Audio chargé avec succès:', {
                          duration: e.currentTarget.duration,
                          url: generatedAsset.url
                        });
                      }}
                    >
                      <source src={generatedAsset.url} type={generatedAsset.mimeType || 'audio/mpeg'} />
                      <source src={generatedAsset.url} type="audio/wav" />
                      <source src={generatedAsset.url} type="audio/ogg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <p className="text-xs text-gray-500 mt-2">
                      URL: {generatedAsset.url}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p><strong>Nom :</strong> {generatedAsset.name}</p>
                  <p><strong>Type :</strong> {generatedAsset.type}</p>
                  {generatedAsset.fileSize && (
                    <p><strong>Taille :</strong> {(generatedAsset.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setGeneratedAsset(null)}
                  >
                    Générer un autre
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUseAsset}
                    icon={type === 'image' ? ImageIcon : Volume2}
                  >
                    Utiliser cet asset
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;

