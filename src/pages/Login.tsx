import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Common/Button';
import { LOG_USER } from '../graphql/queries';
import { useMutation } from '@apollo/client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toLog] = useMutation(LOG_USER);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await toLog({
        variables: { email: data.email, password: data.password },
      });

      if (response.data.login.success) {
        const mockUser = {
          id: '1',
          email: data.email,
          name: 'Admin User',
          role: 'admin'
        };
        const mockToken = response.data.login.token;
        useAuthStore.getState().setUser(mockUser, mockToken);

        toast.success('Connexion réussie !');
        navigate('/dashboard');
      }

      else {
        toast.error('Erreur de connexion: ' + response.data.login.message);
      }

    } catch (error) {
      toast.error('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre tableau de bord
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;