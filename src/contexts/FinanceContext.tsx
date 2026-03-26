import React, { useEffect, useState, useCallback } from "react";
import type {
  Transaction,
  Account,
  Category,
  CreditCard,
  Responsible,
  FixedExpense,
  Bill,
} from "../types";
import { useAuth } from "./useAuth";
import { FinanceContext } from "./FinanceContextObject";

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();

  // --- States ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- API Fetchers ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const requestWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!user || !user.token) return null;

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${user.token}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 503) {
        console.error(`Service Unavailable (503) at ${endpoint}. Check backend status.`);
        return null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.warn("Sessão expirada ou não autorizada. Deslogando...");
          logout();
        }
        let errorMessage = `API Error (${response.status}) at ${endpoint}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Fallback if response is not JSON
        }
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      // For DELETE or 204 No Content, response.json() might fail
      if (response.status === 204) return true;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return true;
    } catch (error) {
      console.error(`Request error at ${endpoint}:`, error);
      throw error;
    }
  }, [user, logout]);

  const fetchWithAuth = useCallback(async (endpoint: string) => {
    try {
      return await requestWithAuth(endpoint);
    } catch {
      return null;
    }
  }, [requestWithAuth]);

  const fetchAccounts = useCallback(async () => {
    const data = await fetchWithAuth("/accounts");
    const sanitized = Array.isArray(data)
      ? data.map((acc: Account) => ({ ...acc, balance: Number(acc.balance) || 0 }))
      : [];
    setAccounts(sanitized);
  }, [fetchWithAuth]);

  const fetchCreditCards = useCallback(async () => {
    const data = await fetchWithAuth("/cards");
    const sanitized = Array.isArray(data)
      ? data.map((card: CreditCard) => ({ ...card, limit: Number(card.limit) || 0 }))
      : [];
    setCreditCards(sanitized);
  }, [fetchWithAuth]);

  const fetchResponsibles = useCallback(async () => {
    const data = await fetchWithAuth("/responsibles");
    setResponsibles(Array.isArray(data) ? data : []);
  }, [fetchWithAuth]);

  const fetchCategories = useCallback(async () => {
    const data = await fetchWithAuth("/categories");
    const sanitized = Array.isArray(data)
      ? data.map((cat: Category) => ({ ...cat, monthlyLimit: Number(cat.monthlyLimit) || 0 }))
      : [];
    setCategories(sanitized);
  }, [fetchWithAuth]);

  const fetchFixedExpenses = useCallback(async () => {
    const data = await fetchWithAuth("/fixed-expenses");
    const sanitized = Array.isArray(data)
      ? data.map((exp: FixedExpense) => ({ ...exp, amount: Number(exp.amount) || 0 }))
      : [];
    setFixedExpenses(sanitized);
  }, [fetchWithAuth]);

  const fetchTransactions = useCallback(async () => {
    const data = await fetchWithAuth("/transactions");
    console.log("Transações recebidas do Backend:", data);
    const sanitized = Array.isArray(data)
      ? data.map((t: Transaction) => ({ ...t, amount: Number(t.amount) || 0 }))
      : [];
    setTransactions(sanitized);
  }, [fetchWithAuth]);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await fetchAccounts();
      await fetchCreditCards();
      await fetchResponsibles();
      await fetchCategories();
      await fetchFixedExpenses();
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao carregar dados sequencialmente:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchAccounts, fetchCreditCards, fetchResponsibles, fetchCategories, fetchFixedExpenses, fetchTransactions]);

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
      setCreditCards([]);
      setResponsibles([]);
      setFixedExpenses([]);
    }
  }, [user, loadAllData]);

  // --- Actions ---

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    try {
      await requestWithAuth("/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Atualização sequencial após o POST
      await fetchTransactions();
      await fetchAccounts();
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await requestWithAuth(`/transactions?id=${id}`, {
        method: "DELETE",
      });
      await fetchTransactions();
      await fetchAccounts();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  };

  const addAccount = async (data: Omit<Account, "id">) => {
    try {
      await requestWithAuth("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchAccounts();
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await requestWithAuth(`/accounts?id=${id}`, {
        method: "DELETE",
      });
      await fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const updateAccountBalance = (id: string, amountToAdd: number) => {
    console.log("Ação: updateAccountBalance", { id, amountToAdd });
  };

  const addCategory = async (data: Omit<Category, "id">) => {
    try {
      await requestWithAuth("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await requestWithAuth(`/categories?id=${id}`, {
        method: "DELETE",
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const addCreditCard = async (data: Omit<CreditCard, "id">) => {
    try {
      await requestWithAuth("/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchCreditCards();
    } catch (error) {
      console.error("Error adding credit card:", error);
    }
  };

  const deleteCreditCard = async (id: string) => {
    try {
      await requestWithAuth(`/cards?id=${id}`, {
        method: "DELETE",
      });
      await fetchCreditCards();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const addResponsible = async (data: Omit<Responsible, "id">) => {
    try {
      await requestWithAuth("/responsibles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchResponsibles();
    } catch (error) {
      console.error("Error adding responsible:", error);
    }
  };

  const deleteResponsible = async (id: string) => {
    try {
      await requestWithAuth(`/responsibles?id=${id}`, {
        method: "DELETE",
      });
      await fetchResponsibles();
    } catch (error) {
      console.error("Error deleting responsible:", error);
    }
  };

  const addFixedExpense = async (data: Omit<FixedExpense, "id">) => {
    try {
      await requestWithAuth("/fixed-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchFixedExpenses();
    } catch (error) {
      console.error("Error adding fixed expense:", error);
    }
  };

  const deleteFixedExpense = async (id: string) => {
    try {
      await requestWithAuth(`/fixed-expenses?id=${id}`, {
        method: "DELETE",
      });
      await fetchFixedExpenses();
    } catch (error) {
      console.error("Error deleting fixed expense:", error);
    }
  };

  const payFixedExpense = async (
    expenseId: string,
    amountPaid: number,
    date: string,
  ) => {
    try {
      // 1. Localizar a conta do tipo Caixa
      const cashAccount = accounts.find(a => a.isCash);
      if (!cashAccount) {
        throw new Error("Conta do tipo 'Caixa' não encontrada para realizar o pagamento.");
      }

      // 2. Localizar os detalhes do gasto fixo para a transação
      const expense = fixedExpenses.find(e => e.id === expenseId);
      if (!expense) {
        throw new Error("Gasto fixo não encontrado.");
      }

      // 3. Registrar o pagamento do gasto fixo no backend
      await requestWithAuth("/fixed-expenses/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, amountPaid, date }),
      });

      // 4. Criar a transação correspondente para abater do Caixa
      await addTransaction({
        description: `Pagamento: ${expense.description}`,
        amount: amountPaid,
        date: date,
        type: 'EXPENSE',
        method: 'CASH',
        accountId: cashAccount.id,
        categoryId: expense.categoryId,
        responsibleId: expense.responsibleId,
        isPaid: true
      });

      // 5. Atualizar os dados locais
      await fetchFixedExpenses();
      // fetchAccounts e fetchTransactions já são chamados dentro do addTransaction
    } catch (error) {
      console.error("Error paying fixed expense:", error);
      throw error;
    }
  };

  const transferBetweenAccounts = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => {
    try {
      await requestWithAuth("/accounts/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromAccountId, toAccountId, amount }),
      });
      await fetchAccounts();
    } catch (error) {
      console.error("Error transferring funds:", error);
    }
  };

  const getAccountBalance = (id: string) => {
    return accounts.find((a) => a.id === id)?.balance || 0;
  };

  const getBill = (cardId: string, month: number, year: number): Bill => {
    const card = creditCards.find((c) => c.id === cardId);
    if (!card)
      return {
        id: "temp",
        cardId,
        month,
        year,
        totalAmount: 0,
        isPaid: false,
        dueDate: "",
        closingDate: "",
      };

    // Lógica de Ciclo: 
    // O dia do fechamento (closingDay) marca o início do PRÓXIMO ciclo.
    // Portanto, a fatura atual termina no dia anterior ao fechamento (00:00:00).
    const closingDateCurrent = new Date(year, month, card.closingDay, 0, 0, 0);
    const closingDatePrevious = new Date(year, month - 1, card.closingDay, 0, 0, 0);

    const billTransactions = transactions.filter((t) => {
      if (t.cardId !== cardId) return false;
      const tDate = new Date(t.date);
      // Entra na fatura se for >= fechamento anterior E < fechamento atual
      return tDate >= closingDatePrevious && tDate < closingDateCurrent && !t.isPaid;
    });

    const total = billTransactions.reduce((acc, t) => acc + t.amount, 0);
    const billId = `${cardId}-${month}-${year}`;

    // Verificamos se existe uma transação que representa o pagamento desta fatura específica
    // O padrão da descrição é importante aqui
    const isPaid = transactions.some(
      (t) =>
        t.description === `Pagamento Fatura: ${card.name} - ${month + 1}/${year}` ||
        (t.type === 'EXPENSE' && t.description.includes(`Fatura ${card.name}`) && t.date.includes(`${year}-${String(month + 1).padStart(2, '0')}`))
    );

    return {
      id: billId,
      cardId,
      month,
      year,
      totalAmount: total,
      isPaid,
      dueDate: new Date(year, month, card.dueDay).toISOString(),
      closingDate: closingDateCurrent.toISOString(),
    };
  };

  const payBill = async (bill: Bill, accountId: string) => {
    try {
      // 1. Tentar localizar o responsável padrão
      // 2. Fallback: pegar o primeiro responsável da lista caso não exista um default
      const responsible = responsibles.find(r => r.isDefault) || responsibles[0];

      if (!responsible) {
        alert("Nenhum responsável encontrado. Cadastre um responsável antes de pagar a fatura.");
        return;
      }

      if (!accountId) {
        alert("Conta de origem não selecionada ou não encontrada.");
        return;
      }

      await requestWithAuth("/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: bill.cardId,
          month: bill.month,
          year: bill.year,
          accountId: accountId,
          responsibleId: responsible.id
        }),
      });

      await fetchTransactions();
      await fetchAccounts();
      alert("Fatura paga com sucesso!");
    } catch (error) {
      console.error("Error paying bill:", error);
      const message = error instanceof Error ? error.message : "Erro ao processar pagamento da fatura.";
      alert(message);
      throw error;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        creditCards,
        responsibles,
        fixedExpenses,
        isLoading,
        addTransaction,
        deleteTransaction,
        addAccount,
        deleteAccount,
        updateAccountBalance,
        addCategory,
        deleteCategory,
        addCreditCard,
        deleteCreditCard,
        addResponsible,
        deleteResponsible,
        addFixedExpense,
        deleteFixedExpense,
        payFixedExpense,
        getAccountBalance,
        getBill,
        payBill,
        transferBetweenAccounts,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
