import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Play, Calendar, User } from 'lucide-react';
import { useScenarioStore } from '../store/scenarioStore';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useQuery } from '@apollo/client';
import { GET_SCENARIOS } from '../graphql/queries';

const Dashboard: React.FC = () => {
  const { scenarios, setScenarios, deleteScenario } = useScenarioStore();
  const [isLoading, setIsLoading] = useState(true);
  const { data } = useQuery(GET_SCENARIOS);

  useEffect(() => {
    if (data?.allScenarios) {
      setScenarios(
        data.allScenarios.map((s: any) => ({
          id: s.mongoId,
          title: s.title,
          description: s.description,
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt || new Date().toISOString(),
          author: { name: 'Admin' }, // temporaire si pas dans ton backend
          scenes: [],
        }))
      );
      setIsLoading(false);
    }
  }, [data]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
      try {
        // Simulation de suppression - à remplacer par l'appel GraphQL
        await new Promise(resolve => setTimeout(resolve, 500));
        deleteScenario(id);
        toast.success('Scénario supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Scénarios</h1>
          <p className="text-gray-600">Gérez vos histoires interactives</p>
        </div>
        <Link to="/scenario/new">
          <Button icon={Plus}>
            Nouveau scénario
          </Button>
        </Link>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun scénario</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier scénario interactif.</p>
          <div className="mt-6">
            <Link to="/scenario/new">
              <Button icon={Plus}>
                Créer un scénario
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {scenarios.map((scenario) => (
              <li key={scenario.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {scenario.title}
                        </h3>
                      </div>
                      {scenario.description && (
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {scenario.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Créé le {formatDate(scenario.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{scenario.author.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/scenario/${scenario.id}/edit`}>
                        <Button variant="secondary" size="sm" icon={Edit}>
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Play}
                        onClick={() => {
                          // Logique pour tester le scénario
                          toast.success('Fonctionnalité de test à venir');
                        }}
                      >
                        Tester
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(scenario.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;