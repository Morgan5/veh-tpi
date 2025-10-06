import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Save, Image, Volume2 } from 'lucide-react';
import { Scene, Scenario, Asset } from '../../types';
import Button from '../Common/Button';
import AssetUploader from '../Common/AssetUploader';
import AIGenerator from '../Common/AIGenerator';
import AssetManager from '../AssetManager/AssetManager';

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Le texte du choix est requis'),
  toSceneId: z.string().min(1, 'Une scène cible est requise'),
  fromSceneId: z.string(),
  condition: z.string().optional()
});

const sceneSchema = z.object({
  id: z.string(),
  scenarioId: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  text: z.string().min(1, 'Le contenu est requis'),
  imageId: z.string().optional(),
  soundId: z.string().optional(),
  isStartScene: z.boolean(),
  choices: z.array(choiceSchema)
});

type SceneFormData = z.infer<typeof sceneSchema>;

interface SceneEditorProps {
  scene: Scene;
  scenarios: Scenario[];
  onSave: (scene: Scene) => void;
  onCancel: () => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, scenarios, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Asset | undefined>(scene.image);
  const [selectedSound, setSelectedSound] = useState<Asset | undefined>(scene.sound);
  const [assetMode, setAssetMode] = useState<'upload' | 'ai' | 'library'>('upload');
  const [soundMode, setSoundMode] = useState<'upload' | 'ai' | 'library'>('upload');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      id: scene.id,
      scenarioId: scene.scenarioId || scenarios[0]?.id || '',
      title: scene.title,
      text: scene.text || '',
      imageId: scene.imageId || '',
      soundId: scene.soundId || '',
      isStartScene: scene.isStartScene || false,
      choices: scene.choices.length > 0 ? scene.choices.map(choice => ({
        ...choice,
        fromSceneId: scene.id
      })) : [
        { id: Date.now().toString(), text: '', toSceneId: '', fromSceneId: scene.id, condition: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices'
  });

  const currentScenario = scenarios[0]; // Assuming we're editing the first scenario
  const availableScenes = currentScenario?.scenes || [];

  const onSubmit = async (data: SceneFormData) => {
    setIsSaving(true);
    try {
      const updatedScene: Scene = {
        ...scene,
        scenarioId: data.scenarioId,
        title: data.title,
        text: data.text,
        imageId: selectedImage?.id,
        image: selectedImage,
        soundId: selectedSound?.id,
        sound: selectedSound,
        isStartScene: data.isStartScene,
        choices: data.choices.filter(choice => choice.text && choice.toSceneId).map(choice => ({
          ...choice,
          fromSceneId: scene.id
        }))
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(updatedScene);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addChoice = () => {
    append({
      id: Date.now().toString(),
      text: '',
      toSceneId: '',
      fromSceneId: scene.id,
      condition: ''
    });
  };

  const sceneText = watch('text');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {scene.title || 'Nouvelle scène'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la scène
              </label>
              <input
                {...register('title')}
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Titre de la scène"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  {...register('isStartScene')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Scène de départ</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Contenu narratif
            </label>
            <textarea
              {...register('text')}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Décrivez ce qui se passe dans cette scène..."
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
            )}
          </div>

          {/* Image Asset Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Image className="h-4 w-4 inline mr-1" />
                Image de la scène
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssetMode('upload')}
                  className={`px-3 py-1 text-xs rounded ${
                    assetMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setAssetMode('library')}
                  className={`px-3 py-1 text-xs rounded ${
                    assetMode === 'library'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bibliothèque
                </button>
                <button
                  type="button"
                  onClick={() => setAssetMode('ai')}
                  className={`px-3 py-1 text-xs rounded ${
                    assetMode === 'ai'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  IA Génération
                </button>
              </div>
            </div>

            {assetMode === 'upload' ? (
              <AssetUploader
                type="image"
                currentAsset={selectedImage}
                onAssetSelected={setSelectedImage}
                onRemove={() => setSelectedImage(undefined)}
              />
            ) : assetMode === 'library' ? (
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <AssetManager
                  selectionMode={true}
                  filterType="image"
                  onSelectAsset={(asset) => {
                    setSelectedImage(asset);
                    setAssetMode('upload'); // Retour au mode upload pour voir la preview
                  }}
                />
              </div>
            ) : (
              <AIGenerator
                type="image"
                sceneContext={sceneText}
                onAssetGenerated={setSelectedImage}
              />
            )}
          </div>

          {/* Sound Asset Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Volume2 className="h-4 w-4 inline mr-1" />
                Son/Musique de la scène
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSoundMode('upload')}
                  className={`px-3 py-1 text-xs rounded ${
                    soundMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setSoundMode('library')}
                  className={`px-3 py-1 text-xs rounded ${
                    soundMode === 'library'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bibliothèque
                </button>
                <button
                  type="button"
                  onClick={() => setSoundMode('ai')}
                  className={`px-3 py-1 text-xs rounded ${
                    soundMode === 'ai'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  IA Génération
                </button>
              </div>
            </div>

            {soundMode === 'upload' ? (
              <AssetUploader
                type="sound"
                currentAsset={selectedSound}
                onAssetSelected={setSelectedSound}
                onRemove={() => setSelectedSound(undefined)}
              />
            ) : soundMode === 'library' ? (
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <AssetManager
                  selectionMode={true}
                  filterType="sound"
                  onSelectAsset={(asset) => {
                    setSelectedSound(asset);
                    setSoundMode('upload'); // Retour au mode upload pour voir la preview
                  }}
                />
              </div>
            ) : (
              <AIGenerator
                type="sound"
                sceneContext={sceneText}
                onAssetGenerated={setSelectedSound}
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Choix disponibles</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={addChoice}
              >
                Ajouter un choix
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Choix {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texte du choix
                      </label>
                      <input
                        {...register(`choices.${index}.text`)}
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Que faire ensuite ?"
                      />
                      {errors.choices?.[index]?.text && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.choices[index]?.text?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scène cible
                      </label>
                      <select
                        {...register(`choices.${index}.toSceneId`)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sélectionner une scène</option>
                        {availableScenes
                          .filter(s => s.id !== scene.id)
                          .map(targetScene => (
                            <option key={targetScene.id} value={targetScene.id}>
                              {targetScene.title}
                            </option>
                          ))}
                      </select>
                      {errors.choices?.[index]?.toSceneId && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.choices[index]?.toSceneId?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition d'apparition (optionnel)
                    </label>
                    <input
                      {...register(`choices.${index}.condition`)}
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="ex: hasKey === true"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isSaving}
              icon={Save}
            >
              Enregistrer la scène
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SceneEditor;