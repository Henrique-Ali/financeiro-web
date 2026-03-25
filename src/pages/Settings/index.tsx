import React, { useState } from 'react';
import { useFinance } from '../../contexts/useFinance';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Users, Tags, Plus, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    deleteCategory,
    responsibles, 
    addResponsible,
    deleteResponsible
  } = useFinance();

  const [catName, setCatName] = useState('');
  const [catLimit, setCatLimit] = useState('');
  
  const [resName, setResName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({
      name: catName,
      monthlyLimit: parseFloat(catLimit) || 0
    });
    setCatName('');
    setCatLimit('');
  };

  const handleAddResponsible = (e: React.FormEvent) => {
    e.preventDefault();
    addResponsible({ name: resName, isDefault: false });
    setResName('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
        <p className="text-gray-500">Gerencie suas categorias, responsáveis e preferências.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categorias */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Tags size={24} />
            <h3 className="text-xl font-semibold">Categorias</h3>
          </div>
          
          <Card>
            <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Nome da Categoria" 
                  value={catName} 
                  onChange={e => setCatName(e.target.value)}
                  placeholder="Ex: Alimentação"
                  required
                />
                <Input 
                  label="Limite Mensal (R$)" 
                  type="number"
                  value={catLimit} 
                  onChange={e => setCatLimit(e.target.value)}
                  placeholder="Ex: 500"
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus size={18} className="mr-2" /> Adicionar Categoria
              </Button>
            </form>

            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg group">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500">Limite: {Number(cat.monthlyLimit) > 0 ? `R$ ${Number(cat.monthlyLimit).toFixed(2)}` : 'Sem limite'}</p>
                  </div>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir Categoria"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Nenhuma categoria cadastrada.</p>}
            </div>
          </Card>
        </div>

        {/* Responsáveis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Users size={24} />
            <h3 className="text-xl font-semibold">Responsáveis</h3>
          </div>

          <Card>
            <form onSubmit={handleAddResponsible} className="space-y-4 mb-6">
              <Input 
                label="Nome do Responsável" 
                value={resName} 
                onChange={e => setResName(e.target.value)}
                placeholder="Ex: Henrique"
                required
              />
              <Button type="submit" className="w-full">
                <Plus size={18} className="mr-2" /> Adicionar Responsável
              </Button>
            </form>

            <div className="space-y-2">
              {responsibles.map(res => (
                <div key={res.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg group">
                  <p className="font-medium text-gray-900 dark:text-white">{res.name}</p>
                  <button 
                    onClick={() => deleteResponsible(res.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir Responsável"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {responsibles.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Nenhum responsável cadastrado.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
