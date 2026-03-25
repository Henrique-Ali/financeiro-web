import { createContext } from 'react';
import type {
  Transaction,
  Account,
  Category,
  CreditCard,
  Responsible,
  FixedExpense,
  Bill,
} from "../types";

export interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  creditCards: CreditCard[];
  responsibles: Responsible[];
  fixedExpenses: FixedExpense[];
  isLoading: boolean;

  // Actions
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addAccount: (account: Omit<Account, "id">) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccountBalance: (id: string, newBalance: number) => void;

  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addCreditCard: (card: Omit<CreditCard, "id">) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;

  addResponsible: (responsible: Omit<Responsible, "id">) => Promise<void>;
  deleteResponsible: (id: string) => Promise<void>;

  addFixedExpense: (expense: Omit<FixedExpense, "id">) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  payFixedExpense: (
    expenseId: string,
    amountPaid: number,
    date: string,
  ) => Promise<void>;

  // Helpers
  getAccountBalance: (accountId: string) => number;
  getBill: (cardId: string, month: number, year: number) => Bill;
  payBill: (bill: Bill, accountId: string) => Promise<void>;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => Promise<void>;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);
