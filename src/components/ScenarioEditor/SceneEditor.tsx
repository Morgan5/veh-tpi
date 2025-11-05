import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Save, Image, Volume2, Upload, Sparkles } from 'lucide-react';
import { Scene, Scenario, Asset } from '../../types';
import Button from '../Common/Button';
import AssetUploader from '../Common/AssetUploader';
import AIGenerator from '../Common/AIGenerator';
import toast from 'react-hot-toast';

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Le texte du choix est requis'),
  targetSceneId: z.string().min(1, 'Une scène cible est requise'),
  condition: z.string().optional()
});

const sceneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  image: z.string().optional(),
  audio: z.string().optional(),
  imageAssetId: z.string().optional(),
  audioAssetId: z.string().optional(),
  isStartScene: z.boolean(),
  choices: z.array(choiceSchema)
});

type SceneFormData = z.infer<typeof sceneSchema>;

interface SceneEditorProps {
  scene: Scene;
  scenarios: Scenario[];
  onSave: (scene: Scene) => Promise<void>;
  onCancel: () => void;
  deleteChoice: (choiceId: string[]) => Promise<void>;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, scenarios, onSave, onCancel, deleteChoice }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [choiceToDelete, setChoiceToDelete] = useState<string[]>([]);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showSoundUploader, setShowSoundUploader] = useState(false);
  const [showSoundGenerator, setShowSoundGenerator] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch
  } = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      id: scene.id,
      title: scene.title,
      content: scene.content,
      image: scene.image || '',
      audio: scene.audio || '',
      imageAssetId: scene.imageAssetId || '',
      audioAssetId: scene.audioAssetId || '',
      isStartScene: scene.isStartScene || false,
      choices: scene.choices.length > 0 ? scene.choices : [

      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices'
  });

  const currentScenario = scenarios[0]; // Assuming we're editing the first scenario
  const availableScenes = currentScenario?.scenes || [];
  const watchedChoices = watch("choices");

  const onSubmit = async (data: SceneFormData) => {
    setIsSaving(true);
    try {
      const updatedScene: Scene = {
        ...scene,
        title: data.title,
        content: data.content,
        image: data.image || undefined,
        audio: data.audio || undefined,
        imageAssetId: data.imageAssetId || undefined,
        audioAssetId: data.audioAssetId || undefined,
        isStartScene: data.isStartScene,
        choices: data.choices.filter(choice => choice.text && choice.targetSceneId)
      };
      // for(const choiceId of choiceToDelete){
      // await deleteChoice(choiceId);
      // }
      await deleteChoice(choiceToDelete);
      await onSave(updatedScene);
      toast.success('Scène sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addChoice = () => {
    append({
      id: "temp-" + Date.now().toString(),
      text: '',
      targetSceneId: '',
      condition: ''
    });
  };

  const haveStartScene = () => {
    for (const s of currentScenario.scenes) {
      if (s.isStartScene && !scene.isStartScene) return true;
    }
    return false;
  }

  const onDeleteChoice = (index: number) => {
    const choice = watchedChoices[index];
    const choiceId = choice?.id;
    if (!choiceId.startsWith("temp-")) {
      setChoiceToDelete([...choiceToDelete, choiceId]);
    }
    remove(index);
  }

  const handleImageAssetSelected = (asset: Asset) => {
    // Stocker à la fois l'URL (pour affichage) et l'ID (pour sauvegarde)
    setValue('image', asset.url);
    setValue('imageAssetId', asset.mongoId);
    setShowImageUploader(false);
    setShowImageGenerator(false);
    toast.success('Image sélectionnée');
  };

  const handleSoundAssetSelected = (asset: Asset) => {
    // Stocker à la fois l'URL (pour affichage) et l'ID (pour sauvegarde)
    setValue('audio', asset.url);
    setValue('audioAssetId', asset.mongoId);
    setShowSoundUploader(false);
    setShowSoundGenerator(false);
    toast.success('Son sélectionné');
  };
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
                  disabled={haveStartScene()}
                />
                <span className="text-sm font-medium text-gray-700">Scène de départ</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenu narratif
            </label>
            <textarea
              {...register('content')}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Décrivez ce qui se passe dans cette scène..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="h-4 w-4 inline mr-1" />
                Image
              </label>
              <input
                {...register('image')}
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
                placeholder="URL de l'image ou utilisez les boutons ci-dessous"
              />
              {/* Champ caché pour stocker l'ID de l'asset */}
              <input
                {...register('imageAssetId')}
                type="hidden"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => setShowImageUploader(true)}
                >
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => setShowImageGenerator(true)}
                >
                  Générer IA
                </Button>
              </div>
              {watch('image') && (
                <div className="mt-2">
                  <img
                    src={watch('image')}
                    alt="Preview"
                    className="max-w-full max-h-32 rounded border border-gray-200"
                    onError={() => toast.error('Impossible de charger l\'image')}
                  />
                </div>
              )}
            </div>

            {/* Audio Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Volume2 className="h-4 w-4 inline mr-1" />
                Audio
              </label>
              <input
                {...register('audio')}
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
                placeholder="URL de l'audio ou utilisez les boutons ci-dessous"
              />
              {/* Champ caché pour stocker l'ID de l'asset */}
              <input
                {...register('audioAssetId')}
                type="hidden"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => setShowSoundUploader(true)}
                >
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => setShowSoundGenerator(true)}
                >
                  Générer IA
                </Button>
              </div>
              {watch('audio') && (
                <div className="mt-2">
                  <audio controls className="w-full">
                    <source src={watch('audio')} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                </div>
              )}
            </div>
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
                      onClick={() => onDeleteChoice(index)}
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
                        {...register(`choices.${index}.targetSceneId`)}
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
                      {errors.choices?.[index]?.targetSceneId && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.choices[index]?.targetSceneId?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition d'apparition (optionnel)
                    </label>
                    <input
                      {...register(`choices.${index}.condition`)}
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="ex: hasKey === true"
                    />
                  </div> */}
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

      {/* Asset Modals */}
      {showImageUploader && (
        <AssetUploader
          type="image"
          onAssetSelected={handleImageAssetSelected}
          onCancel={() => setShowImageUploader(false)}
        />
      )}

      {showImageGenerator && (
        <AIGenerator
          type="image"
          onAssetGenerated={handleImageAssetSelected}
          onCancel={() => setShowImageGenerator(false)}
          sceneContext={watch('content')}
        />
      )}

      {showSoundUploader && (
        <AssetUploader
          type="sound"
          onAssetSelected={handleSoundAssetSelected}
          onCancel={() => setShowSoundUploader(false)}
        />
      )}

      {showSoundGenerator && (
        <AIGenerator
          type="sound"
          onAssetGenerated={handleSoundAssetSelected}
          onCancel={() => setShowSoundGenerator(false)}
          sceneContext={watch('content')}
        />
      )}
    </div>
  );
};

export default SceneEditor;