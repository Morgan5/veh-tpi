import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Save, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Button from '../components/Common/Button';
import { useAuthStore } from '../store/authStore';

const profileSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message:
        'Les mots de passe ne correspondent pas ou le mot de passe actuel est manquant',
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (_data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Simulation de mise à jour - à remplacer par l'appel GraphQL réel
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const mockPlayers = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      lastActive: '2024-01-20',
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie@example.com',
      lastActive: '2024-01-19',
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre@example.com',
      lastActive: '2024-01-18',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-soft-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-primary-100 text-lg">
          Gérez votre profil et les paramètres de l'application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profil utilisateur */}
        <div className="bg-white shadow-soft-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Profil utilisateur
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="label-modern">
                Nom complet
              </label>
              <input
                {...register('name')}
                type="text"
                className="input-modern"
                placeholder="Votre nom"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label-modern">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="input-modern pl-11"
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-5 mt-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary-600" />
                Changer le mot de passe
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="label-modern">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('currentPassword')}
                      type="password"
                      className="input-modern pl-11"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="label-modern">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('newPassword')}
                      type="password"
                      className="input-modern pl-11"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label-modern">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      className="input-modern pl-11"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                icon={Save}
                className="w-full"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>

        {/* Liste des joueurs */}
        <div
          className="bg-white shadow-soft-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Joueurs actifs</h2>
          </div>

          <div className="space-y-3">
            {mockPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {player.name}
                    </h3>
                    <p className="text-xs text-gray-500">{player.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(player.lastActive).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                <span className="font-bold text-primary-700">
                  {mockPlayers.length}
                </span>
                <span className="text-gray-600 ml-1">joueurs enregistrés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
