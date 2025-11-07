import { useMutation, useQuery } from '@apollo/client';
import { Calendar, Edit, Play, Plus, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { DELETE_SCENARIO, GET_SCENARIOS } from '../graphql/queries';
import { useScenarioStore } from '../store/scenarioStore';

const Dashboard: React.FC = () => {
  const { scenarios, setScenarios, deleteScenario } = useScenarioStore();
  const [isLoading, setIsLoading] = useState(true);
  const { data, refetch } = useQuery(GET_SCENARIOS);
  const [deleteScenarioMutation] = useMutation(DELETE_SCENARIO);

  useEffect(() => {
    if (data?.allScenarios) {
      setScenarios(
        data.allScenarios.map((s: any) => ({
          id: s.mongoId,
          title: s.title,
          description: s.description,
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt || new Date().toISOString(),
          author: { name: 'Admin' },
          scenes: [],
        }))
      );
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
      try {
        const { data: deleteData } = await deleteScenarioMutation({
          variables: { scenarioId: id },
        });

        if (deleteData?.deleteScenario?.success) {
          deleteScenario(id);
          await refetch();
          toast.success(
            deleteData.deleteScenario.message || 'Scénario supprimé avec succès'
          );
        } else {
          toast.error(
            deleteData?.deleteScenario?.message ||
              'Erreur lors de la suppression'
          );
        }
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-soft-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Scénarios</h1>
            <p className="text-primary-100 text-lg">
              Gérez vos histoires interactives
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{scenarios.length}</span>
              <span className="text-sm">
                scénario{scenarios.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <Link to="/scenario/new">
            <Button
              icon={Plus}
              className="bg-white text-primary-600 hover:bg-gray-50 shadow-lg"
            >
              Nouveau scénario
            </Button>
          </Link>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft-lg p-12 text-center animate-slide-up">
          <div className="mx-auto h-20 w-20 text-gray-300 mb-4">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun scénario
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Commencez par créer votre premier scénario interactif et donnez vie
            à vos histoires.
          </p>
          <Link to="/scenario/new">
            <Button icon={Plus} size="lg">
              Créer un scénario
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={scenario.id}
              className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden group hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header with Gradient */}
              <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500"></div>

              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {scenario.title}
                </h3>

                {/* Description */}
                {scenario.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {scenario.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>{formatDate(scenario.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary-500" />
                    <span>{scenario.author.name}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link to={`/scenario/${scenario.id}/edit`} className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      className="w-full"
                    >
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Play}
                    onClick={() => {
                      toast.success('Fonctionnalité de test à venir');
                    }}
                    className="flex-1"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
