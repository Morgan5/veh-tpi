import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, Plus, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import SceneEditor from '../components/ScenarioEditor/SceneEditor';
import SceneGraphView from '../components/ScenarioEditor/SceneGraphView';
import {
  CREATE_CHOICE,
  CREATE_SCENARIO,
  CREATE_SCENE,
  DELETE_CHOICES,
  DELETE_SCENE,
  GET_SCENARIO_BY_ID,
  UPDATE_CHOICE,
  UPDATE_SCENARIO,
  UPDATE_SCENE,
} from '../graphql/queries';
import { useScenarioStore } from '../store/scenarioStore';
import { Choice, Scenario, Scene } from '../types';
import {
  mapChoiceFromGraphQL,
  mapScenarioFromGraphQL,
  mapSceneFromGraphQL,
} from '../utils/dataMapping';

const scenarioSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

const ScenarioEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentScenario, setCurrentScenario } = useScenarioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const isNew = !id || id === 'new';
  const { data, loading, error, refetch } = useQuery(GET_SCENARIO_BY_ID, {
    skip: isNew,
    variables: { scenarioId: id },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
  });

  const [createScenario] = useMutation(CREATE_SCENARIO);
  const [updateScenario] = useMutation(UPDATE_SCENARIO);
  const [createScene] = useMutation(CREATE_SCENE);
  const [createChoice] = useMutation(CREATE_CHOICE);
  const [updateScene] = useMutation(UPDATE_SCENE);
  const [updateChoice] = useMutation(UPDATE_CHOICE);
  const [delChoice] = useMutation(DELETE_CHOICES);
  const [deleteScene] = useMutation(DELETE_SCENE);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!id || isNew) {
      const newScenario: Scenario = {
        id: Date.now().toString(),
        title: '',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenes: [],
        author: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
      };
      setCurrentScenario(newScenario);
      reset({ title: '', description: '' });
    } else if (data?.scenarioById) {
      const scenario = mapScenarioFromGraphQL(data.scenarioById);
      setCurrentScenario(scenario);
      reset({ title: scenario.title, description: scenario.description });
    } else if (error) {
      toast.error('Erreur lors du chargement du scénario');
      navigate('/dashboard');
    }
  }, [id, isNew, data, error, setCurrentScenario, reset, navigate]);

  const deleteChoice = async (choiceIds: string[]) => {
    const variables = {
      choiceIds: choiceIds,
    };
    await delChoice({ variables });
  };

  const saveChoice = async (
    choice: Choice,
    fromSceneId: string,
    order: number
  ): Promise<Choice | null> => {
    // si le choix n'a pas d'ID, il n'existe pas en base → on le crée
    if (!choice.id || choice.id.startsWith('temp-')) {
      let v = {
        input: {
          fromSceneId: fromSceneId,
          toSceneId: choice.targetSceneId,
          text: choice.text,
          order: order,
          // condition: "{\"score\": 10}", // optionnel
        },
      };
      const res = await createChoice({ variables: v });
      if (res.data.createChoice.success) {
        // Mapper le choix retourné par le backend
        const createdChoice = res.data.createChoice.choice;
        return mapChoiceFromGraphQL(createdChoice);
      }
    } else {
      let arg = {
        choiceId: choice.id,
        input: {
          text: choice.text,
          order: order,
          toSceneId: choice.targetSceneId,
        },
      };
      const res = await updateChoice({ variables: arg });
      if (res.data.updateChoice.success) {
        // Mapper le choix retourné par le backend
        const updatedChoice = res.data.updateChoice.choice;
        return mapChoiceFromGraphQL(updatedChoice);
      }
    }
    return null;
  };
  const saveScene = async (scene: Scene, scenarioId: string) => {
    // si la scène n'a pas d'ID, elle n'existe pas en base → on la crée
    if (!scene.id || scene.id.startsWith('temp-')) {
      // Déterminer l'ordre de la scène: dernière position + 1
      const nextOrder = (currentScenario?.scenes?.length || 0) + 1;
      let variables = {
        input: {
          scenarioId: scenarioId,
          title: scene.title,
          text: scene.content,
          order: nextOrder,
          isStartScene: scene.isStartScene || false,
          isEndScene: false,
          // Drapeaux de génération d'assets côté backend
          autoGenerateImage: !!scene.autoGenerateImage,
          autoGenerateSound: !!scene.autoGenerateSound,
          autoGenerateMusic: !!scene.autoGenerateMusic,
          // imageId: "<ASSET_ID>", // optionnel
          // soundId: "<ASSET_ID>", // optionnel
        },
      };
      const r = await createScene({ variables });
      if (r.data.createScene.success) {
        const createdScene = r.data.createScene.scene;
        // Mapper la scène retournée par le backend pour obtenir les URLs des assets
        const mappedScene = mapSceneFromGraphQL(createdScene);
        // Sauvegarder les choix et récupérer les choix mis à jour
        const savedChoices: Choice[] = [];
        for (let i = 0; i < scene.choices.length; i++) {
          const savedChoice = await saveChoice(
            scene.choices[i],
            mappedScene.id,
            i + 1
          );
          if (savedChoice) {
            savedChoices.push(savedChoice);
          }
        }
        // Utiliser les choix sauvegardés avec leurs IDs mis à jour
        mappedScene.choices = savedChoices;
        // Décocher les drapeaux de génération si les assets ont été générés
        mappedScene.autoGenerateImage =
          scene.autoGenerateImage && !mappedScene.image;
        mappedScene.autoGenerateSound =
          scene.autoGenerateSound && !mappedScene.audio;
        mappedScene.autoGenerateMusic =
          scene.autoGenerateMusic && !mappedScene.music;
        return mappedScene;
      }
      return null;
    } else {
      // Construire l'input en excluant order s'il est indéfini
      const input: any = {
        title: scene.title,
        text: scene.content,
        // Ne pas écraser l'ordre existant côté backend par défaut
        isStartScene: scene.isStartScene || false,
        // Drapeaux de génération d'assets côté backend
        autoGenerateImage: !!scene.autoGenerateImage,
        autoGenerateSound: !!scene.autoGenerateSound,
        autoGenerateMusic: !!scene.autoGenerateMusic,
      };
      if (typeof scene.order === 'number') {
        input.order = scene.order;
      }
      const arg = {
        sceneId: scene.id,
        input,
      };
      const r = await updateScene({ variables: arg });
      if (r.data.updateScene.success) {
        const updatedScene = r.data.updateScene.scene;
        // Mapper la scène retournée par le backend pour obtenir les URLs des assets
        const mappedScene = mapSceneFromGraphQL(updatedScene);
        // Sauvegarder les choix et récupérer les choix mis à jour
        const savedChoices: Choice[] = [];
        for (let i = 0; i < scene.choices.length; i++) {
          const savedChoice = await saveChoice(
            scene.choices[i],
            mappedScene.id,
            i + 1
          );
          if (savedChoice) {
            savedChoices.push(savedChoice);
          }
        }
        // Utiliser les choix sauvegardés avec leurs IDs mis à jour
        mappedScene.choices = savedChoices;
        // Décocher les drapeaux de génération si les assets ont été générés
        mappedScene.autoGenerateImage =
          scene.autoGenerateImage && !mappedScene.image;
        mappedScene.autoGenerateSound =
          scene.autoGenerateSound && !mappedScene.audio;
        mappedScene.autoGenerateMusic =
          scene.autoGenerateMusic && !mappedScene.music;
        return mappedScene;
      }
    }
    return null;
  };
  const onSubmit = async (data: ScenarioFormData) => {
    if (!currentScenario) return;

    setIsSaving(true);
    try {
      const updatedScenario: Scenario = {
        ...currentScenario,
        title: data.title,
        description: data.description || '',
        updatedAt: new Date().toISOString(),
      };

      // Simulation de sauvegarde - à remplacer par l'appel GraphQL
      var response;
      if (isNew || !id) {
        response = await createScenario({
          variables: {
            input: {
              title: updatedScenario.title,
              description: updatedScenario.description,
              isPublished: true,
            },
          },
        });
      } else {
        response = await updateScenario({
          variables: {
            scenarioId: id,
            input: {
              title: updatedScenario.title,
              description: updatedScenario.description,
              isPublished: true,
            },
          },
        });
      }

      if (isNew || !id) {
        if (response.data.createScenario.success) {
          const createdScenario = response.data.createScenario.scenario;
          updatedScenario.id = createdScenario.mongoId;
          // Mettre à jour le store et rediriger vers l'éditeur du scénario créé
          setCurrentScenario({ ...updatedScenario, scenes: [] });
          toast.success('Scénario créé avec succès');
          navigate(`/scenario/${updatedScenario.id}/edit`);
          return;
        }
      } else {
        toast.success('Scénario mis à jour avec succès');
      }
      navigate(`/dashboard`);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setShowSceneEditor(true);
  };

  const handleSceneUpdate = async (updatedScene: Scene) => {
    if (!currentScenario) return;

    const exists = currentScenario.scenes.some(
      (scene) => scene.id === updatedScene.id
    );

    try {
      const newScene = await saveScene(updatedScene, currentScenario.id);
      if (!newScene) {
        toast.error("Échec de l'enregistrement de la scène.");
        return;
      }

      // Étape 4 : mise à jour du scénario avec la valeur retournée
      const finalScenes = exists
        ? currentScenario.scenes.map((scene) =>
            scene.id === newScene.id ? newScene : scene
          )
        : [...currentScenario.scenes, newScene];

      const updatedScenario: Scenario = {
        ...currentScenario,
        scenes: finalScenes,
        updatedAt: new Date().toISOString(),
      };

      setCurrentScenario(updatedScenario);
      // Mettre à jour selectedScene avec la nouvelle scène pour que les aperçus se mettent à jour
      setSelectedScene(newScene);
      // Ne pas fermer la fenêtre immédiatement pour que l'utilisateur puisse voir les nouveaux assets
      // setShowSceneEditor(false);
      // setSelectedScene(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      id: 'temp-' + Date.now().toString(),
      title: 'Nouvelle scène',
      content: '',
      choices: [],
      position: { x: 200, y: 200 },
    };

    setSelectedScene(newScene);
    setShowSceneEditor(true);
  };

  const handleSceneDelete = async (sceneId: string) => {
    if (!currentScenario || isNew || !id) {
      toast.error(
        "Impossible de supprimer une scène d'un scénario non sauvegardé"
      );
      return;
    }

    try {
      const response = await deleteScene({
        variables: { sceneId },
        refetchQueries: [
          { query: GET_SCENARIO_BY_ID, variables: { scenarioId: id } },
        ],
      });

      if (response.data?.deleteScene?.success) {
        // Retirer la scène de la liste locale
        const updatedScenes = currentScenario.scenes.filter(
          (scene) => scene.id !== sceneId
        );

        const updatedScenario: Scenario = {
          ...currentScenario,
          scenes: updatedScenes,
          updatedAt: new Date().toISOString(),
        };

        setCurrentScenario(updatedScenario);
        setShowSceneEditor(false);
        setSelectedScene(null);
        toast.success('Scène supprimée avec succès');
      } else {
        throw new Error(
          response.data?.deleteScene?.message || 'Erreur inconnue'
        );
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la scène');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Scénario non trouvé</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Retour au dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-soft-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
              className="bg-white/90 hover:bg-white border-0"
            >
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isNew ? 'Nouveau scénario' : 'Modifier le scénario'}
              </h1>
              <p className="text-primary-100 text-sm mt-1">
                {isNew
                  ? 'Créez votre histoire interactive'
                  : 'Éditez votre scénario'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              icon={Eye}
              onClick={() => {
                toast.success('Fonctionnalité de prévisualisation à venir');
              }}
              className="bg-white/90 hover:bg-white border-0"
            >
              Prévisualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-soft-lg rounded-2xl p-8 animate-slide-up">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="label-modern">
              Titre du scénario
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-modern"
              placeholder="Le titre de votre scénario"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠</span> {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label-modern">
              Description (optionnel)
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-modern resize-none"
              placeholder="Décrivez votre scénario..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSaving} icon={Save} size="lg">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>

      <div
        className="bg-white shadow-soft-lg rounded-2xl p-8 animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Structure du scénario
            </h2>
            <p className="text-sm text-gray-500">
              Créez et organisez les scènes de votre histoire
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddScene}
            disabled={isNew || !id}
          >
            Ajouter une scène
          </Button>
        </div>
        <div className="h-[800px] border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <SceneGraphView
            scenes={currentScenario.scenes}
            onSceneSelect={handleSceneSelect}
          />
        </div>
      </div>

      {showSceneEditor && selectedScene && (
        <SceneEditor
          scene={selectedScene}
          scenarios={[currentScenario]}
          onSave={handleSceneUpdate}
          onCancel={() => {
            setShowSceneEditor(false);
            setSelectedScene(null);
          }}
          deleteChoice={deleteChoice}
          onDelete={handleSceneDelete}
        />
      )}
    </div>
  );
};

export default ScenarioEditor;
