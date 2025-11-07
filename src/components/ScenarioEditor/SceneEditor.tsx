import { zodResolver } from '@hookform/resolvers/zod';
import {
  Image,
  Music,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Scenario, Scene } from '../../types';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Le texte du choix est requis'),
  targetSceneId: z.string().min(1, 'Une scène cible est requise'),
  condition: z.string().optional(),
});

const sceneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  image: z.string().optional(),
  audio: z.string().optional(),
  music: z.string().optional(),
  isStartScene: z.boolean(),
  // Drapeaux de génération backend
  autoGenerateImage: z.boolean().optional(),
  autoGenerateSound: z.boolean().optional(),
  autoGenerateMusic: z.boolean().optional(),
  choices: z.array(choiceSchema),
});

type SceneFormData = z.infer<typeof sceneSchema>;

interface SceneEditorProps {
  scene: Scene;
  scenarios: Scenario[];
  onSave: (scene: Scene) => Promise<void>;
  onCancel: () => void;
  deleteChoice: (choiceId: string[]) => Promise<void>;
  onDelete?: (sceneId: string) => Promise<void>;
}

const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  scenarios,
  onSave,
  onCancel,
  deleteChoice,
  onDelete,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [choiceToDelete, setChoiceToDelete] = useState<string[]>([]);

  // Construire l'URL complète pour les assets
  const getFullUrl = (url?: string) => {
    if (!url) return null;
    // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Sinon, construire l'URL avec le base URL de l'API
    // Utiliser VITE_GRAPHQL_URL pour extraire le base URL, ou VITE_API_URL, ou une valeur par défaut
    const graphqlUrl =
      import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/';
    const apiUrl =
      import.meta.env.VITE_API_URL || graphqlUrl.replace('/graphql/', '');
    return `${apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      id: scene.id,
      title: scene.title,
      content: scene.content,
      image: scene.image || '',
      audio: scene.audio || '',
      music: scene.music || '',
      isStartScene: scene.isStartScene || false,
      autoGenerateImage: scene.autoGenerateImage || false,
      autoGenerateSound: scene.autoGenerateSound || false,
      autoGenerateMusic: scene.autoGenerateMusic || false,
      choices: scene.choices.length > 0 ? scene.choices : [],
    },
  });

  // Synchroniser le formulaire quand la prop scene change (après sauvegarde)
  // Utiliser une clé basée sur les URLs des assets pour détecter les changements
  useEffect(() => {
    reset({
      id: scene.id,
      title: scene.title,
      content: scene.content,
      image: scene.image || '',
      audio: scene.audio || '',
      music: scene.music || '',
      isStartScene: scene.isStartScene || false,
      autoGenerateImage: scene.autoGenerateImage || false,
      autoGenerateSound: scene.autoGenerateSound || false,
      autoGenerateMusic: scene.autoGenerateMusic || false,
      choices: scene.choices.length > 0 ? scene.choices : [],
    });
  }, [
    scene.id,
    scene.title,
    scene.content,
    scene.image,
    scene.audio,
    scene.music,
    scene.isStartScene,
    scene.autoGenerateImage,
    scene.autoGenerateSound,
    scene.autoGenerateMusic,
    // Utiliser JSON.stringify pour détecter les changements dans les choix
    JSON.stringify(scene.choices),
    reset,
  ]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const currentScenario = scenarios[0]; // Assuming we're editing the first scenario
  const availableScenes = currentScenario?.scenes || [];
  const watchedChoices = watch('choices');

  // Watchers pour les champs URL et génération
  const watchedImage = watch('image');
  const watchedAudio = watch('audio');
  const watchedMusic = watch('music');
  const watchedAutoGenerateImage = watch('autoGenerateImage');
  const watchedAutoGenerateSound = watch('autoGenerateSound');
  const watchedAutoGenerateMusic = watch('autoGenerateMusic');

  // Effacer l'URL quand la génération est cochée
  useEffect(() => {
    if (watchedAutoGenerateImage && watchedImage) {
      setValue('image', '');
    }
  }, [watchedAutoGenerateImage, watchedImage, setValue]);

  useEffect(() => {
    if (watchedAutoGenerateSound && watchedAudio) {
      setValue('audio', '');
    }
  }, [watchedAutoGenerateSound, watchedAudio, setValue]);

  useEffect(() => {
    if (watchedAutoGenerateMusic && watchedMusic) {
      setValue('music', '');
    }
  }, [watchedAutoGenerateMusic, watchedMusic, setValue]);

  // Décocher la génération quand une URL est saisie
  useEffect(() => {
    if (watchedImage && watchedAutoGenerateImage) {
      setValue('autoGenerateImage', false);
    }
  }, [watchedImage, watchedAutoGenerateImage, setValue]);

  useEffect(() => {
    if (watchedAudio && watchedAutoGenerateSound) {
      setValue('autoGenerateSound', false);
    }
  }, [watchedAudio, watchedAutoGenerateSound, setValue]);

  useEffect(() => {
    if (watchedMusic && watchedAutoGenerateMusic) {
      setValue('autoGenerateMusic', false);
    }
  }, [watchedMusic, watchedAutoGenerateMusic, setValue]);

  const onSubmit = async (data: SceneFormData) => {
    // Validation : vérifier qu'on n'a pas à la fois URL et génération
    const errors: string[] = [];

    if (data.image && data.autoGenerateImage) {
      errors.push(
        "Vous ne pouvez pas utiliser à la fois une URL et la génération automatique pour l'image."
      );
    }
    if (data.audio && data.autoGenerateSound) {
      errors.push(
        "Vous ne pouvez pas utiliser à la fois une URL et la génération automatique pour l'audio."
      );
    }
    if (data.music && data.autoGenerateMusic) {
      errors.push(
        'Vous ne pouvez pas utiliser à la fois une URL et la génération automatique pour la musique.'
      );
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    try {
      const updatedScene: Scene = {
        ...scene,
        title: data.title,
        content: data.content,
        image: data.image || undefined,
        audio: data.audio || undefined,
        music: data.music || undefined,
        isStartScene: data.isStartScene,
        autoGenerateImage: !!data.autoGenerateImage,
        autoGenerateSound: !!data.autoGenerateSound,
        autoGenerateMusic: !!data.autoGenerateMusic,
        choices: data.choices.filter(
          (choice) => choice.text && choice.targetSceneId
        ),
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
      id: 'temp-' + Date.now().toString(),
      text: '',
      targetSceneId: '',
      condition: '',
    });
  };

  const haveStartScene = () => {
    for (const s of currentScenario.scenes) {
      if (s.isStartScene && !scene.isStartScene) return true;
    }
    return false;
  };

  const onDeleteChoice = (index: number) => {
    const choice = watchedChoices[index];
    const choiceId = choice?.id;
    if (!choiceId.startsWith('temp-')) {
      setChoiceToDelete([...choiceToDelete, choiceId]);
    }
    remove(index);
  };

  const handleDelete = async () => {
    if (!onDelete || !scene.id || scene.id.startsWith('temp-')) {
      toast.error('Impossible de supprimer une scène non sauvegardée');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(scene.id);
      // Le toast de succès est géré dans handleSceneDelete du parent
      onCancel();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Le toast d'erreur est géré dans handleSceneDelete du parent
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {scene.title || 'Nouvelle scène'}
          </h2>
          <div className="flex items-center space-x-2">
            {onDelete && scene.id && !scene.id.startsWith('temp-') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 transition-colors p-1 flex items-center gap-1"
                title="Supprimer la scène"
              >
                <Trash2 className="h-5 w-5" />
                <span>Supprimer</span>
              </button>
            )}
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre de la scène
              </label>
              <input
                {...register('title')}
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Titre de la scène"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
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
                <span className="text-sm font-medium text-gray-700">
                  Scène de départ
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contenu narratif
            </label>
            <textarea
              {...register('content')}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Décrivez ce qui se passe dans cette scène..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Champ ordre masqué: géré automatiquement côté front/backend */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Image className="h-4 w-4 inline mr-1" />
                Image
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Choisissez une option : URL ou génération automatique
              </p>
              <input
                {...register('image')}
                type="text"
                disabled={watchedAutoGenerateImage}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  watchedAutoGenerateImage
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {/* Aperçu image */}
              {watch('image') &&
                getFullUrl(watch('image')) &&
                !watchedAutoGenerateImage && (
                  <div className="mt-2 rounded overflow-hidden border border-gray-200 flex justify-center">
                    <img
                      src={getFullUrl(watch('image'))!}
                      alt="Aperçu"
                      className="max-w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              <label className="mt-2 flex items-center space-x-2">
                <input
                  {...register('autoGenerateImage')}
                  type="checkbox"
                  disabled={!!watchedImage}
                  className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                    watchedImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <span
                  className={`text-sm ${
                    watchedImage ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  Générer automatiquement (IA)
                </span>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </label>
            </div>

            <div>
              <label
                htmlFor="audio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Volume2 className="h-4 w-4 inline mr-1" />
                Audio
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Choisissez une option : URL ou génération automatique
              </p>
              <input
                {...register('audio')}
                type="text"
                disabled={watchedAutoGenerateSound}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  watchedAutoGenerateSound
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                placeholder="https://example.com/audio.mp3"
              />
              {/* Aperçu narration TTS */}
              {watch('audio') &&
                getFullUrl(watch('audio')) &&
                !watchedAutoGenerateSound && (
                  <div className="mt-2">
                    <audio
                      className="w-full"
                      controls
                      src={getFullUrl(watch('audio'))!}
                      onError={(e) => {
                        (e.target as HTMLAudioElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    {...register('autoGenerateSound')}
                    type="checkbox"
                    disabled={!!watchedAudio}
                    className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      watchedAudio ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      watchedAudio ? 'text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    Générer narration (TTS)
                  </span>
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </label>
              </div>
              {/* Champ et aperçu musique d'ambiance */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Music className="h-4 w-4 inline mr-1" />
                  Musique
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Choisissez une option : URL ou génération automatique
                </p>
                <input
                  {...register('music')}
                  type="text"
                  disabled={watchedAutoGenerateMusic}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    watchedAutoGenerateMusic
                      ? 'bg-gray-100 cursor-not-allowed'
                      : ''
                  }`}
                  placeholder="https://example.com/music.mp3"
                />
                {watch('music') &&
                  getFullUrl(watch('music')) &&
                  !watchedAutoGenerateMusic && (
                    <div className="mt-2">
                      <audio
                        className="w-full"
                        controls
                        src={getFullUrl(watch('music'))!}
                        onError={(e) => {
                          (e.target as HTMLAudioElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                <label className="mt-2 flex items-center space-x-2">
                  <input
                    {...register('autoGenerateMusic')}
                    type="checkbox"
                    disabled={!!watchedMusic}
                    className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      watchedMusic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      watchedMusic ? 'text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    Générer musique d'ambiance
                  </span>
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Choix disponibles
              </h3>
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
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Choix {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onDeleteChoice(index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
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
                          .filter((s) => s.id !== scene.id)
                          .map((targetScene) => (
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
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" icon={Save}>
              Enregistrer la scène
            </Button>
          </div>
        </form>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la scène "{scene.title}" ?
                Cette action supprimera également tous les choix associés et les
                assets (images, sons, musiques). Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  loading={isDeleting}
                  icon={Trash2}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay de chargement */}
        {isSaving && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 flex flex-col items-center">
              <LoadingSpinner size="lg" className="mb-4" />
              {watch('autoGenerateImage') ||
              watch('autoGenerateSound') ||
              watch('autoGenerateMusic') ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Génération en cours...
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Veuillez patienter, la génération via IA peut prendre 1 à 3
                    minutes.
                    <br />
                    Ne fermez pas cette fenêtre.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Save className="h-5 w-5 text-blue-500" />
                    Enregistrement en cours...
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Veuillez patienter pendant l'enregistrement de la scène.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneEditor;
