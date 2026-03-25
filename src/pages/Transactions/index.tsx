import React, { useState, useMemo } from "react";
import { useFinance } from "../../contexts/useFinance";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  Trash2,
  History,
  Table as TableIcon,
  CreditCard as CardIcon,
  Wallet,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../../lib/utils";

export const Transactions: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    categories,
    responsibles,
    creditCards,
    fixedExpenses,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCard, setFilterCard] = useState("");
  const [filterRes, setFilterRes] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterMonth, setFilterMonth] = useState(`${new Date().getMonth()}-${new Date().getFullYear()}`);

  const months = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        value: `${date.getMonth()}-${date.getFullYear()}`,
        label: format(date, "MMM/yy", { locale: ptBR }),
      };
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        const [m, y] = filterMonth.split('-').map(Number);
        const matchesMonth = !filterMonth || (tDate.getMonth() === m && tDate.getFullYear() === y);
        
        const matchesCard = !filterCard || t.cardId === filterCard;
        const matchesRes = !filterRes || t.responsibleId === filterRes;
        const matchesCat = !filterCat || t.categoryId === filterCat;
        const matchesSearch =
          !searchTerm ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMonth && matchesCard && matchesRes && matchesCat && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCard, filterRes, filterCat, searchTerm, filterMonth]);

  const getCategoryName = (id?: string) =>
    id ? categories.find((c) => c.id === id)?.name || "Sem cat." : "-";

  return (
    <div className="space-y-8 md:space-y-12">
      {/* SEÇÃO 1: COMPARATIVO MENSAL */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
          <TableIcon size={20} />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">
            Comparativo Mensal
          </h2>
        </div>

        <Card className="overflow-hidden p-0 border-zinc-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase text-zinc-500 sticky left-0 bg-zinc-50 dark:bg-zinc-800 z-10 border-r border-zinc-200">
                    Item / Categoria
                  </th>
                  {months.map((m, index) => (
                    <th
                      key={m.label}
                      className={cn(
                        "px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-center text-zinc-500 uppercase",
                        index >= 4 && "hidden md:table-cell" // Esconde os meses 5 e 6 no mobile
                      )}
                    >
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* Categorias */}
                <tr className="bg-indigo-50/30 dark:bg-indigo-900/10 text-[10px] uppercase font-bold text-indigo-600 tracking-widest">
                  <td colSpan={months.length + 1} className="px-4 md:px-6 py-2">Categorias de Gastos</td>
                </tr>
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-zinc-700 dark:text-zinc-200 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-zinc-100 dark:border-zinc-800">
                      {cat.name}
                    </td>
                    {months.map((m, index) => {
                      const total = transactions
                        .filter(
                          (t) =>
                            t.categoryId === cat.id &&
                            t.type === "EXPENSE" &&
                            new Date(t.date).getMonth() === m.month &&
                            new Date(t.date).getFullYear() === m.year,
                        )
                        .reduce((acc, t) => acc + t.amount, 0);
                      return (
                        <td 
                          key={m.label} 
                          className={cn(
                            "px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-zinc-600 dark:text-zinc-400",
                            index >= 4 && "hidden md:table-cell" // Esconde os meses 5 e 6 no mobile
                          )}
                        >
                          {total > 0 ? formatCurrency(total) : <span className="text-zinc-300">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Despesas Fixas */}
                <tr className="bg-indigo-50/30 dark:bg-indigo-900/10 text-[10px] uppercase font-bold text-indigo-600 tracking-widest">
                  <td colSpan={months.length + 1} className="px-4 md:px-6 py-2">Despesas Fixas</td>
                </tr>
                {fixedExpenses.map((fixed) => (
                  <tr key={fixed.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-zinc-700 dark:text-zinc-200 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-zinc-100 dark:border-zinc-800">
                      {fixed.description}
                    </td>
                    {months.map((m, index) => {
                      const total = transactions
                        .filter(
                          (t) =>
                            t.description === fixed.description &&
                            t.type === "EXPENSE" &&
                            new Date(t.date).getMonth() === m.month &&
                            new Date(t.date).getFullYear() === m.year,
                        )
                        .reduce((acc, t) => acc + t.amount, 0);
                      return (
                        <td 
                          key={m.label} 
                          className={cn(
                            "px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400",
                            index >= 4 && "hidden md:table-cell" // Esconde os meses 5 e 6 no mobile
                          )}
                        >
                          {total > 0 ? formatCurrency(total) : <span className="text-zinc-300">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* SEÇÃO 2: HISTÓRICO */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
          <History size={20} />
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">
            Histórico de Lançamentos
          </h2>
        </div>

        <Card className="p-3 md:p-4 bg-zinc-50/50 border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 items-end">
            <Input
              label="Pesquisar"
              placeholder="Ex: Mercado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Período</label>
              <select
                className="w-full h-9 md:h-10 px-3 text-sm border border-zinc-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-medium"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">Todos os meses</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Cartão</label>
              <select
                className="w-full h-9 md:h-10 px-3 text-sm border border-zinc-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
                value={filterCard}
                onChange={(e) => setFilterCard(e.target.value)}
              >
                <option value="">Todos os cartões</option>
                {creditCards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Responsável</label>
              <select
                className="w-full h-9 md:h-10 px-3 text-sm border border-zinc-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
                value={filterRes}
                onChange={(e) => setFilterRes(e.target.value)}
              >
                <option value="">Todos</option>
                {responsibles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Categoria</label>
              <select
                className="w-full h-9 md:h-10 px-3 text-sm border border-zinc-300 rounded-md bg-white dark:bg-zinc-950 dark:border-zinc-800 text-gray-900 dark:text-zinc-100"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0 border-zinc-200">
          {/* Versão Desktop da Tabela */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Valor</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors group text-sm">
                    <td className="px-6 py-4 text-zinc-500 text-center whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white">{t.description}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                          {t.method === "CARD" ? <CardIcon size={10} /> : <Wallet size={10} />}
                          {t.method === "CARD" ? creditCards.find((c) => c.id === t.cardId)?.name : "Caixa"}
                          {t.installments && t.installments > 1 && ` • ${t.currentInstallment || 1}/${t.installments}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{getCategoryName(t.categoryId)}</td>
                    <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => confirm("Tem certeza?") && deleteTransaction(t.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão Mobile (Cards) */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="p-4 flex flex-col gap-2 bg-white dark:bg-zinc-900">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{formatDate(t.date)}</span>
                  <button 
                    onClick={() => confirm("Tem certeza?") && deleteTransaction(t.id)}
                    className="p-1 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col max-w-[65%]">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{t.description}</span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">{getCategoryName(t.categoryId)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-tight">
                      {t.method === "CARD" ? creditCards.find((c) => c.id === t.cardId)?.name : "Caixa"}
                      {t.installments && t.installments > 1 && ` (${t.currentInstallment || 1}/${t.installments})`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 italic">Nenhuma transação encontrada.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};
