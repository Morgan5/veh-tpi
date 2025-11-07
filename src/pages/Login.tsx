import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Common/Button';
import { LOG_USER, GET_ME } from '../graphql/queries';
import { useMutation, useLazyQuery } from '@apollo/client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toLog] = useMutation(LOG_USER);
  const [getMe] = useLazyQuery(GET_ME);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await toLog({
        variables: { email: data.email, password: data.password },
      });

      if (response.data.login.success && response.data.login.token) {
        const token = response.data.login.token;

        // Sauvegarder le token d'abord
        useAuthStore.getState().setUser(
          {
            id: '', // Sera mis à jour après la requête GET_ME
            email: data.email,
            name: '',
            role: '',
          },
          token
        );

        // Récupérer les vraies données utilisateur
        try {
          const { data: userData } = await getMe({
            fetchPolicy: 'network-only',
          });

          if (userData?.me) {
            const user = {
              id: userData.me.mongoId || '',
              email: userData.me.email || data.email,
              name:
                `${userData.me.firstName || ''} ${userData.me.lastName || ''}`.trim() ||
                data.email,
              role: userData.me.role || 'user',
            };
            useAuthStore.getState().setUser(user, token);
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // Utiliser les données de base si la requête échoue
          const fallbackUser = {
            id: '',
            email: data.email,
            name: data.email,
            role: 'user',
          };
          useAuthStore.getState().setUser(fallbackUser, token);
        }

        toast.success('Connexion réussie !');
        navigate('/dashboard');
      } else {
        toast.error(
          'Erreur de connexion: ' +
            (response.data.login.message || 'Token non reçu')
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 px-4 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-soft-lg">
                <BookOpen className="h-12 w-12 text-primary-600" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            VEH Éditeur
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Connectez-vous pour créer vos scénarios interactifs
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm py-8 px-8 shadow-soft-lg rounded-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div>
              <label htmlFor="password" className="label-modern">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="input-modern pl-11"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full shadow-lg"
              size="lg"
            >
              Se connecter
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
