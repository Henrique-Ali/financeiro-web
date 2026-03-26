import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      setIsLoading(false);
    }
  };

  // Efeito para criar os dados iniciais assim que o user estiver disponível após o registro
  React.useEffect(() => {
    const createInitialData = async () => {
      if (user && isAuthenticated && isLoading) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          };

          // 1. Criar Conta Caixa
          await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'Caixa', balance: 0, isCash: true })
          });

          // 2. Criar Responsável Padrão
          await fetch(`${API_BASE_URL}/responsibles`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: user.name, isDefault: true })
          });

          // 3. Criar Categorias Padrão
          const defaultCategories = ['Salário', 'Mercado', 'Aluguel', 'Lazer', 'Outros'];
          await Promise.all(defaultCategories.map(catName =>
            fetch(`${API_BASE_URL}/categories`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ name: catName, monthlyLimit: 0 })
            })
          ));

          navigate('/');
        } catch (err) {
          console.error("Erro ao criar dados iniciais:", err);
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      }
    };

    createInitialData();
  }, [user, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Financeiro Icon" className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Financeiro</h1>
          </div>
          <p className="text-gray-500 mt-2">Crie sua conta em segundos</p>
        </div>

        <Card className="shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Conta</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}

            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Registrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Já tem uma conta?</span>{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Fazer login agora
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
