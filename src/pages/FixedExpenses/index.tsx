import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Calendar, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { FixedExpense } from '../../types';

export const FixedExpenses: React.FC = () => {
  const { 
    fixedExpenses, 
    addFixedExpense, 
    deleteFixedExpense,
    payFixedExpense, 
    responsibles 
  } = useFinance();

  // Cadastro State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [catId] = useState(''); // Category placeholder for now
  const [resId, setResId] = useState('');

  // Pagamento State
  const [payingExpense, setPayingExpense] = useState<FixedExpense | null>(null);
  const [realAmount, setRealAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addFixedExpense({
      description: desc,
      amount: parseFloat(amount),
      day: parseInt(day),
      categoryId: catId || undefined,
      responsibleId: resId
    });
    setDesc(''); setAmount(''); setDay('');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingExpense) {
      payFixedExpense(payingExpense.id, parseFloat(realAmount), new Date().toISOString());
      setPayingExpense(null);
      setRealAmount('');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este gasto fixo?')) {
      deleteFixedExpense(id);
    }
  };

  const isPaidThisMonth = (lastPaidDate?: string) => {
    if (!lastPaidDate) return false;
    const date = new Date(lastPaidDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Gastos Fixos</h2>
        <p className="text-xs md:text-sm text-gray-500">Contas recorrentes mensais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Formulário de Cadastro */}
        <Card className="lg:col-span-1 h-fit p-4 md:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-indigo-600">
            <Plus size={18} /> Novo Gasto Fixo
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Descrição" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Aluguel, Internet" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Valor Estimado" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
              <Input label="Dia do Vencimento" type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Responsável</label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-sm" value={resId} onChange={e => setResId(e.target.value)} required>
                <option value="">Selecione...</option>
                {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full">Cadastrar Gasto Fixo</Button>
          </form>
        </Card>

        {/* Listagem */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {fixedExpenses.map(expense => {
            const paid = isPaidThisMonth(expense.lastPaidDate);
            return (
              <Card key={expense.id} className={`p-3 md:p-4 group relative transition-all ${paid ? 'opacity-60 bg-gray-50 dark:bg-zinc-900/50' : 'border-l-4 border-l-orange-500 shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`p-2.5 md:p-3 rounded-full shrink-0 ${paid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {paid ? <CheckCircle2 size={20} className="md:size-6" /> : <Calendar size={20} className="md:size-6" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">{expense.description}</h4>
                      <p className="text-[10px] md:text-sm text-gray-500 truncate">Vence todo dia {expense.day}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                    <div className="sm:text-right">
                      <p className="text-[9px] md:text-xs text-gray-400 uppercase font-bold">Estimado</p>
                      <p className="font-bold text-base md:text-lg text-indigo-600">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!paid ? (
                        <Button 
                          variant="primary" 
                          className="px-3 md:px-4 py-1 h-8 md:h-9 text-xs md:text-sm"
                          onClick={() => {
                            setPayingExpense(expense);
                            setRealAmount(expense.amount.toString());
                          }}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <span className="text-xs md:text-sm font-bold text-green-600 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                          <CheckCircle2 size={14} /> PAGO
                        </span>
                      )}
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors ml-1"
                        title="Excluir Gasto Fixo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {fixedExpenses.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-500 italic">Nenhum gasto fixo cadastrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Pagamento */}
      <Modal 
        isOpen={!!payingExpense} 
        onClose={() => setPayingExpense(null)} 
        title={`Pagar: ${payingExpense?.description}`}
      >
        <form onSubmit={handlePay} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">Confirme o valor real pago desta conta para que o sistema abata corretamente do seu caixa.</p>
          </div>
          
          <Input 
            label="Valor Real Pago" 
            type="number" 
            step="0.01" 
            value={realAmount} 
            onChange={e => setRealAmount(e.target.value)}
            autoFocus
            required
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setPayingExpense(null)}>Cancelar</Button>
            <Button type="submit">Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
