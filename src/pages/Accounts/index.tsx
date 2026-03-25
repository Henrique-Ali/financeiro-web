import React, { useState } from 'react';
import { useFinance } from '../../contexts/useFinance';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Wallet, Plus, ArrowLeftRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const Accounts: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    deleteAccount,
    transferBetweenAccounts 
  } = useFinance();

  // Account State
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [isCash, setIsCash] = useState(false);

  // Transfer State
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      name: accName,
      balance: parseFloat(accBalance),
      isCash
    });
    setAccName('');
    setAccBalance('');
    setIsCash(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transferBetweenAccounts(fromId, toId, parseFloat(transferAmount));
    alert('Transferência realizada com sucesso!');
    setTransferAmount('');
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta? Isso removerá o saldo associado.')) {
      deleteAccount(id);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Contas Bancárias</h2>
        <p className="text-xs md:text-sm text-gray-500">Gerencie seus saldos e transfira dinheiro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Adicionar Conta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Wallet size={20} className="md:size-6" />
            <h3 className="text-lg md:text-xl font-semibold">Nova Conta</h3>
          </div>
          
          <Card className="p-4 md:p-6">
            <form onSubmit={handleAddAccount} className="space-y-4">
              <Input label="Nome da Conta/Banco" value={accName} onChange={e => setAccName(e.target.value)} placeholder="Ex: Nubank" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Saldo Inicial" type="number" step="0.01" value={accBalance} onChange={e => setAccBalance(e.target.value)} placeholder="0.00" required />
                <div className="flex items-center space-x-2 sm:pt-8 h-10">
                  <input 
                    type="checkbox" 
                    id="isCash" 
                    className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                    checked={isCash} 
                    onChange={e => setIsCash(e.target.checked)} 
                  />
                  <label htmlFor="isCash" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Conta de Caixa?</label>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus size={18} className="mr-2" /> Adicionar Conta
              </Button>
            </form>
          </Card>
        </div>

        {/* Listagem de Contas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
             <h3 className="text-lg md:text-xl font-semibold">Minhas Contas</h3>
          </div>
          <div className="grid gap-3">
            {accounts.map(acc => (
              <Card key={acc.id} className="p-3 md:p-4 flex justify-between items-center group relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${acc.isCash ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white leading-tight">{acc.name}</p>
                    {acc.isCash && <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider">Conta Principal</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <p className="text-lg md:text-xl font-bold text-indigo-600">{formatCurrency(acc.balance)}</p>
                  <button 
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-2 text-red-400 hover:text-red-600 md:opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
            {accounts.length === 0 && (
               <div className="py-10 text-center bg-gray-50 dark:bg-zinc-900 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 italic">Nenhuma conta cadastrada.</p>
               </div>
            )}
          </div>
        </div>

        {/* Transferência entre Contas */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-indigo-600 border-t border-gray-100 dark:border-zinc-800 pt-6">
            <ArrowLeftRight size={20} className="md:size-6" />
            <h3 className="text-lg md:text-xl font-semibold">Transferência de Saldo</h3>
          </div>

          <Card className="p-4 md:p-6">
            <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Origem</label>
                <select className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-sm text-gray-900 dark:text-zinc-100" value={fromId} onChange={e => setFromId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Destino</label>
                <select className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-sm text-gray-900 dark:text-zinc-100" value={toId} onChange={e => setToId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <Input label="Valor" type="number" step="0.01" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" required className="text-sm" />
              <Button type="submit" className="w-full">Executar</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
