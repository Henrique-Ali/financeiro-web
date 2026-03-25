import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import type { 
  TransactionType, 
  PaymentMethod, 
  Category, 
  Responsible, 
  Account, 
  CreditCard 
} from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TransactionFormProps {
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { 
    addTransaction, 
    categories, 
    responsibles, 
    accounts, 
    creditCards 
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [responsibleId, setResponsibleId] = useState(responsibles[0]?.id || '');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [installments, setInstallments] = useState('1');

  // Auto-select default values when data is loaded
  React.useEffect(() => {
    if (!accountId && accounts.length > 0) {
      const mainAcc = accounts.find(a => a.isCash) || accounts[0];
      setAccountId(mainAcc.id);
    }
    if (!cardId && creditCards.length > 0) {
      setCardId(creditCards[0].id);
    }
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    if (!responsibleId && responsibles.length > 0) {
      setResponsibleId(responsibles[0].id);
    }
  }, [accounts, creditCards, categories, responsibles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Força a criação da data usando componentes locais para evitar o shift de timezone do "new Date(string)"
      const [year, month, day] = date.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day, 12, 0, 0);

      await addTransaction({
        description,
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        type,
        method,
        categoryId,
        responsibleId,
        accountId: method === 'CASH' ? accountId : undefined,
        cardId: method === 'CARD' ? cardId : undefined,
        installments: method === 'CARD' ? parseInt(installments) : undefined,
        isPaid: method === 'CASH' // If cash, it's paid immediately
      });

      onSuccess();
    } catch (error) {
      // Error is already logged in context, but we could show a local error message here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <button
          type="button"
          onClick={() => setType('EXPENSE')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'EXPENSE' ? 'bg-white dark:bg-zinc-700 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType('INCOME')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'INCOME' ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Receita
        </button>
      </div>

      <Input 
        label="Descrição" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        placeholder="Ex: Almoço, Salário..."
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Valor" 
          type="number" 
          step="0.01"
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          required
        />
        <Input 
          label="Data" 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoria {type === 'EXPENSE' && '*'}
          </label>
          <select 
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required={type === 'EXPENSE'}
          >
            <option value="">Selecione...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Responsável</label>
          <select 
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
            value={responsibleId}
            onChange={e => setResponsibleId(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {responsibles.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pagamento</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              checked={method === 'CASH'} 
              onChange={() => setMethod('CASH')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Dinheiro/Caixa</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              checked={method === 'CARD'} 
              onChange={() => setMethod('CARD')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Cartão de Crédito</span>
          </label>
        </div>
      </div>

      {method === 'CASH' && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conta de Origem/Destino</label>
          <select 
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            required
          >
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.isCash ? 'Caixa' : 'Conta'})</option>)}
          </select>
        </div>
      )}

      {method === 'CARD' && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cartão</label>
            <select 
              className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
              value={cardId}
              onChange={e => setCardId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {creditCards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
            </select>
          </div>
          <Input 
            label="Parcelas" 
            type="number" 
            min="1"
            value={installments} 
            onChange={e => setInstallments(e.target.value)} 
            required
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit" className="w-full md:w-auto">
          Salvar Transação
        </Button>
      </div>
    </form>
  );
};
