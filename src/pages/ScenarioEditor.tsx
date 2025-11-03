import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Eye } from 'lucide-react';
import { useScenarioStore } from '../store/scenarioStore';
import { Scenario, Scene } from '../types';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import SceneGraphView from '../components/ScenarioEditor/SceneGraphView';
import SceneEditor from '../components/ScenarioEditor/SceneEditor';
import { useQuery } from '@apollo/client';
import { GET_SCENARIO_BY_ID } from '../graphql/queries';
import { mapScenarioFromGraphQL } from '../utils/dataMapping';
import { hasCycle } from '../utils/postionComputing';

const scenarioSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional()
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

const ScenarioEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentScenario, setCurrentScenario, addScenario, updateScenario } = useScenarioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const isNew = id === 'new';
  const { data, loading, error } = useQuery(GET_SCENARIO_BY_ID, {
    skip: !id || isNew,
    variables: { scenarioId: id }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema)
  });

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!id || isNew) {
      const newScenario: Scenario = {
        id: Date.now().toString(),
        title: "",
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenes: [],
        author: {
          id: "1",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin"
        }
      };
      setCurrentScenario(newScenario);
      reset({ title: "", description: "" });
    } else if (data?.scenarioById) {
      const scenario = mapScenarioFromGraphQL(data.scenarioById);
      setCurrentScenario(scenario);
      reset({ title: scenario.title, description: scenario.description });
    } else if (error) {
      toast.error("Erreur lors du chargement du scénario");
      navigate("/dashboard");
    }
  }, [id, isNew, data, error, setCurrentScenario, reset, navigate]);

  const onSubmit = async (data: ScenarioFormData) => {
    if (!currentScenario) return;

    setIsSaving(true);
    try {
      const updatedScenario: Scenario = {
        ...currentScenario,
        title: data.title,
        description: data.description || '',
        updatedAt: new Date().toISOString()
      };

      // Simulation de sauvegarde - à remplacer par l'appel GraphQL
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isNew) {
        addScenario(updatedScenario);
        toast.success('Scénario créé avec succès');
      } else {
        updateScenario(updatedScenario);
        toast.success('Scénario mis à jour avec succès');
      }

      setCurrentScenario(updatedScenario);

      if (isNew) {
        navigate(`/scenario/${updatedScenario.id}/edit`);
      }
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

  const handleSceneUpdate = (updatedScene: Scene) => {
    if (!currentScenario) return;

    // Vérifie si la scène existe déjà
    const exists = currentScenario.scenes.some(scene => scene.id === updatedScene.id);

    const updatedScenes = exists
      ? currentScenario.scenes.map(scene =>
        scene.id === updatedScene.id ? updatedScene : scene
      )
      : [...currentScenario.scenes, updatedScene]; // si pas trouvé → on ajoute

    const updatedScenario: Scenario = {
      ...currentScenario,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    };

    if (hasCycle(updatedScenes)) {
      toast.error("Erreur : une boucle a été détectée dans le scénario !");
      setTimeout(()=>1000)
      window.location.reload();
      return;
    }
    setCurrentScenario(updatedScenario);
    setShowSceneEditor(false);
    setSelectedScene(null);
  };


  const handleAddScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: 'Nouvelle scène',
      content: '',
      choices: [],
      position: { x: 200, y: 200 }
    };

    setSelectedScene(newScene);
    setShowSceneEditor(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Nouveau scénario' : 'Modifier le scénario'}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            icon={Plus}
            onClick={handleAddScene}
          >
            Ajouter une scène
          </Button>
          <Button
            variant="secondary"
            icon={Eye}
            onClick={() => {
              // Logique pour prévisualiser le scénario
              toast.success('Fonctionnalité de prévisualisation à venir');
            }}
          >
            Prévisualiser
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre du scénario
            </label>
            <input
              {...register('title')}
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Le titre de votre scénario"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Décrivez votre scénario..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSaving}
              icon={Save}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Structure du scénario</h2>
        <div className="h-96 border border-gray-200 rounded-md">
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
        />
      )}
    </div>
  );
};

export default ScenarioEditor;