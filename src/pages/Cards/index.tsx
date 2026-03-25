import React, { useState, useMemo } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CreditCard as CardIcon, Plus, History, Receipt, Calendar, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import type { CreditCard } from '../../types';

export const CardsPage: React.FC = () => {
  const { creditCards, addCreditCard, deleteCreditCard, transactions } = useFinance();

  // Cadastro State
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  // History State
  const [viewingTransactionsCard, setViewingTransactionsCard] = useState<CreditCard | null>(null);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    addCreditCard({
      name: cardName,
      limit: parseFloat(cardLimit),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay)
    });
    setCardName('');
    setCardLimit('');
    setClosingDay('');
    setDueDay('');
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão? Isso removerá o histórico de faturas dele.')) {
      deleteCreditCard(id);
    }
  };

  const cardTransactions = useMemo(() => {
    if (!viewingTransactionsCard) return [];
    return transactions
      .filter(t => t.cardId === viewingTransactionsCard.id && !t.isPaid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, viewingTransactionsCard]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Meus Cartões</h2>
        <p className="text-xs md:text-sm text-gray-500">Gerencie seus cartões e limites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-6">
              <CardIcon size={20} />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Novo Cartão</h3>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <Input label="Nome do Cartão" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Ex: Nubank" required className="text-sm" />
              <Input label="Limite Total" type="number" step="0.01" value={cardLimit} onChange={e => setCardLimit(e.target.value)} required className="text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Dia Fechamento" type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} required className="text-sm" />
                <Input label="Dia Vencimento" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} required className="text-sm" />
              </div>
              <Button type="submit" className="w-full">
                <Plus size={18} className="mr-2" /> Adicionar
              </Button>
            </form>
          </Card>
        </div>

        {/* Listagem */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {creditCards.map(card => (
            <Card key={card.id} className="border-l-4 border-l-indigo-600 flex flex-col justify-between group relative overflow-hidden p-4 md:p-5 shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate">{card.name}</h4>
                    <p className="text-[10px] md:text-sm text-gray-500 font-medium">Vence dia {card.dueDay}</p>
                  </div>
                  <div className="flex items-start gap-1">
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 md:opacity-0 group-hover:opacity-100 transition-all"
                      title="Excluir Cartão"
                    >
                      <Trash2 size={18} />
                    </button>
                    <CardIcon className="text-indigo-100 dark:text-zinc-800" size={32} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[9px] md:text-xs text-gray-400 uppercase font-bold tracking-widest">Limite Disponível</p>
                  <p className="text-xl md:text-2xl font-black text-indigo-600 leading-none">{formatCurrency(card.limit)}</p>
                </div>
                <div className="mt-3 text-[10px] md:text-xs text-gray-500 flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 w-fit px-2 py-1 rounded">
                  <Calendar size={12} /> Fechamento: Dia {card.closingDay}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 text-xs h-9"
                  onClick={() => setViewingTransactionsCard(card)}
                >
                  <History size={16} /> Ver Lançamentos
                </Button>
              </div>
            </Card>
          ))}
          {creditCards.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
               <p className="text-sm text-gray-500 italic">Nenhum cartão cadastrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Transações do Cartão */}
      <Modal 
        isOpen={!!viewingTransactionsCard} 
        onClose={() => setViewingTransactionsCard(null)}
        title={`Fatura: ${viewingTransactionsCard?.name}`}
      >
        <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-1 space-y-2 md:space-y-3 custom-scrollbar">
          {cardTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm shrink-0 border border-gray-100 dark:border-zinc-700 text-indigo-500">
                  <Receipt size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                    <span className="whitespace-nowrap">{formatDate(t.date)}</span>
                    {t.installments && t.installments > 1 && (
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-1 rounded">
                        {t.currentInstallment || 1}/{t.installments}
                      </span>
                    )}

                  </div>
                </div>
              </div>
              <span className="font-bold text-red-600 text-xs md:text-sm whitespace-nowrap ml-2">
                -{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {cardTransactions.length === 0 && (
            <div className="text-center py-10 bg-gray-50 dark:bg-zinc-900/50 rounded-xl">
              <p className="text-xs text-gray-500 italic">Nenhuma compra pendente nesta fatura.</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Button variant="secondary" className="w-full" onClick={() => setViewingTransactionsCard(null)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
