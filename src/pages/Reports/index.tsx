import React, { useMemo } from 'react';
import { useFinance } from '../../contexts/useFinance';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { ArrowUpCircle, CreditCard } from 'lucide-react';
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Reports: React.FC = () => {
  const { transactions, fixedExpenses } = useFinance();

  const last6Months = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        label: format(date, 'MMM/yy', { locale: ptBR })
      };
    }).reverse();
  }, []);

  const monthlyEvolutionData = useMemo(() => {
    return last6Months.map(m => {
      const income = transactions
        .filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
        .reduce((acc, t) => acc + t.amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === m.month && new Date(t.date).getFullYear() === m.year)
        .reduce((acc, t) => acc + t.amount, 0);

      return { name: m.label, Entradas: income, Saídas: expense };
    });
  }, [transactions, last6Months]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análise de Desempenho</h2>
        <p className="text-gray-500 text-sm">Visualize tendências e saúde financeira.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <ArrowUpCircle size={20} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Fluxo de Caixa (6 meses)</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v) || 0)} />
                <Legend />
                <Area type="monotone" dataKey="Entradas" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area type="monotone" dataKey="Saídas" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <CreditCard size={20} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Gastos Fixos (Estimado vs Real)</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fixedExpenses.map(e => ({
                name: e.description,
                Estimado: e.amount,
                Real: transactions.filter(t => t.description === e.description && new Date(t.date).getMonth() === new Date().getMonth()).reduce((acc, t) => acc + t.amount, 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v) || 0)} />
                <Legend />
                <Bar dataKey="Estimado" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Real" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
