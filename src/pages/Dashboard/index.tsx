import React, { useMemo, useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../../components/ui/Card';
import { BillCard } from '../../components/BillCard';
import { formatCurrency } from '../../utils/format';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Wallet, CreditCard, TrendingUp, Plus, AlertTriangle, CalendarCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TransactionForm } from '../../components/forms/TransactionForm';
import { Input } from '../../components/ui/Input';
import type { FixedExpense } from '../../types';

export const Dashboard: React.FC = () => {
  const { 
    accounts, 
    creditCards, 
    getBill, 
    payBill, 
    transactions,
    fixedExpenses,
    categories,
    payFixedExpense
  } = useFinance();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // Pagamento de Gasto Fixo
  const [payingExpense, setPayingExpense] = useState<FixedExpense | null>(null);
  const [realAmount, setRealAmount] = useState('');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // 1. Total Balance (Only Cash accounts)
  const totalBalance = useMemo(() => 
    accounts
      .filter(acc => acc.isCash)
      .reduce((acc, curr) => acc + curr.balance, 0), 
  [accounts]);

  // 2. Bills (First unpaid bill > 0, searching from 6 months ago)
  const bills = useMemo(() => {
    const activeBills: { card: any, currentBill: any, nextBill: any }[] = [];
    creditCards.forEach(card => {
      // Começamos a procurar 6 meses antes do mês atual
      let searchDate = new Date(currentYear, currentMonth - 6, 1);
      let foundBill = null;
      let attempts = 0;

      // Procuramos por até 18 meses (6 passados + 12 futuros)
      while (attempts < 18) {
        const month = searchDate.getMonth();
        const year = searchDate.getFullYear();
        const bill = getBill(card.id, month, year);

        // Se encontrarmos uma fatura não paga com valor, essa é a nossa prioridade
        if (!bill.isPaid && bill.totalAmount > 0) {
          foundBill = bill;
          break;
        }

        // Se já passamos do mês atual e não achamos nada pendente,
        // pegamos a fatura do mês atual mesmo que esteja zerada (para mostrar o card)
        if (year === currentYear && month === currentMonth && !foundBill) {
          foundBill = bill;
          // Se ela estiver paga ou zerada, continuamos procurando uma próxima com valor
          if (bill.isPaid || bill.totalAmount === 0) {
            // mas guardamos ela como fallback caso não ache nada no futuro
          } else {
            break;
          }
        }

        searchDate.setMonth(searchDate.getMonth() + 1);
        attempts++;
      }

      if (foundBill) {
        const nextMonthDate = new Date(foundBill.year, foundBill.month + 1, 1);
        activeBills.push({ 
          card, 
          currentBill: foundBill, 
          nextBill: getBill(card.id, nextMonthDate.getMonth(), nextMonthDate.getFullYear()) 
        });
      }
    });
    return activeBills;
  }, [creditCards, currentMonth, currentYear, getBill]);

  const totalBillsAmount = useMemo(() => 
    bills.reduce((acc, { currentBill }) => acc + currentBill.totalAmount, 0), 
  [bills]);

  // 3. Fixed Expenses Pending
  const pendingFixedExpenses = useMemo(() => {
    return fixedExpenses.filter(expense => {
      if (!expense.lastPaidDate) return true;
      const date = new Date(expense.lastPaidDate);
      return date.getMonth() !== currentMonth || date.getFullYear() !== currentYear;
    });
  }, [fixedExpenses, currentMonth, currentYear]);

  const totalFixedExpensesAmount = useMemo(() => 
    pendingFixedExpenses.reduce((acc, curr) => acc + curr.amount, 0),
  [pendingFixedExpenses]);

  const totalToPay = totalBillsAmount + totalFixedExpensesAmount;

  // 4. Budget Alerts
  const budgetAlerts = useMemo(() => {
    const categorySpent: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'EXPENSE' && t.categoryId && new Date(t.date).getMonth() === currentMonth) {
        categorySpent[t.categoryId] = (categorySpent[t.categoryId] || 0) + t.amount;
      }
    });

    return categories.filter(cat => cat.monthlyLimit > 0).map(cat => {
      const spent = categorySpent[cat.id] || 0;
      const percent = (spent / cat.monthlyLimit) * 100;
      return { ...cat, spent, percent };
    }).filter(item => item.percent >= 70);
  }, [categories, transactions, currentMonth]);

  // 5. Chart Data
  const chartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'EXPENSE' && t.categoryId && new Date(t.date).getMonth() === currentMonth) {
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
        categoryMap[catName] = (categoryMap[catName] || 0) + t.amount;
      }
    });
    return Object.keys(categoryMap).map(key => ({ name: key, amount: categoryMap[key] }));
  }, [transactions, currentMonth, categories]);

  const handlePayFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingExpense) {
      payFixedExpense(payingExpense.id, parseFloat(realAmount), new Date().toISOString());
      setPayingExpense(null);
      setRealAmount('');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Dashboard</h2>
          <p className="text-xs md:text-sm text-gray-500">Gestão financeira e pendências do mês.</p>
        </div>
        <Button onClick={() => setIsTransactionModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2">
          <Plus size={18} /> Nova Transação
        </Button>
      </div>

      {/* Alertas de Orçamento */}
      {budgetAlerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {budgetAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`flex items-center gap-3 p-3 md:p-4 rounded-lg border-l-4 shadow-sm ${alert.percent >= 100 ? 'bg-red-50 border-red-500 text-red-800' : 'bg-amber-50 border-amber-500 text-amber-800'}`}
            >
              <AlertTriangle className="shrink-0 size-5 md:size-6" />
              <div>
                <p className="text-[10px] md:text-sm font-bold uppercase tracking-tight">Limite de {alert.name}</p>
                <p className="text-[10px] md:text-xs">
                  {alert.percent >= 100 
                    ? `Estourou! ${formatCurrency(alert.spent)} de ${formatCurrency(alert.monthlyLimit)}` 
                    : `Atingiu ${alert.percent.toFixed(0)}% do limite.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-[10px] md:text-sm font-medium uppercase tracking-wider">Saldo em Caixa</p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</h2>
            </div>
            <Wallet className="w-8 h-8 md:w-10 md:h-10 opacity-30" />
          </div>
        </Card>

        <Card className="shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] md:text-sm font-medium uppercase tracking-wider">Total a Pagar</p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900 dark:text-white">{formatCurrency(totalToPay)}</h2>
            </div>
            <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-red-100" />
          </div>
        </Card>

        <Card className="shadow-md p-5 sm:col-span-2 md:col-span-1">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] md:text-sm font-medium uppercase tracking-wider">Pendências Fixas</p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 text-orange-600">{pendingFixedExpenses.length} contas</h2>
            </div>
             <CalendarCheck className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Lado Esquerdo: Faturas e Gastos Fixos */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Credit Cards */}
          <section>
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard size={20} /> Faturas Pendentes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bills.map(({ card, currentBill, nextBill }) => (
                <BillCard 
                  key={card.id} 
                  card={card} 
                  bill={currentBill} 
                  nextBill={nextBill}
                  onPay={(b) => payBill(b, accounts.find(a => a.isCash)?.id || '')} 
                />
              ))}
              {bills.length === 0 && (
                 <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-zinc-900 rounded-xl border-2 border-dashed border-gray-200">
                   <p className="text-sm text-gray-500 italic">Nenhuma fatura com valor pendente.</p>
                 </div>
              )}
            </div>
          </section>

          {/* Fixed Expenses Pending List */}
          <section>
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarCheck size={20} /> Contas Fixas do Mês
            </h3>
            <div className="space-y-3">
              {pendingFixedExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base font-medium">{expense.description}</span>
                      <span className="text-[10px] md:text-xs text-gray-400">Vence dia {expense.day}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-sm md:text-base font-bold text-gray-700 dark:text-zinc-300">{formatCurrency(expense.amount)}</span>
                    <Button 
                      variant="primary" 
                      className="px-2 md:px-3 py-1 h-7 md:h-8 text-[10px] md:text-xs"
                      onClick={() => {
                        setPayingExpense(expense);
                        setRealAmount(expense.amount.toString());
                      }}
                    >
                      Pagar
                    </Button>
                  </div>
                </div>
              ))}
              {pendingFixedExpenses.length === 0 && (
                <p className="text-xs md:text-sm text-gray-500 italic bg-green-50 p-3 rounded-lg text-green-700">Tudo pago por aqui!</p>
              )}
            </div>
          </section>
        </div>

        {/* Lado Direito: Gráfico e Últimas */}
        <div className="space-y-6 md:space-y-8">
          <Card className="h-72 md:h-80 flex flex-col shadow-md p-4">
            <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Gastos / Categoria</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-md p-4">
            <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Últimas Atividades</h3>
            <div className="space-y-3 md:space-y-4">
              {transactions.slice(-5).reverse().map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600 truncate mr-2">{t.description}</span>
                  <span className={`font-bold whitespace-nowrap ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="Nova Transação">
        <TransactionForm onSuccess={() => setIsTransactionModalOpen(false)} />
      </Modal>

      {/* Modal de Confirmação de Pagamento de Gasto Fixo */}
      <Modal 
        isOpen={!!payingExpense} 
        onClose={() => setPayingExpense(null)} 
        title={`Pagar: ${payingExpense?.description}`}
      >
        <form onSubmit={handlePayFixedExpense} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-blue-700 dark:text-blue-300">
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