export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type PaymentMethod = 'CASH' | 'CARD';
export type Frequency = 'MONTHLY' | 'YEARLY' | 'ONCE';

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  monthlyLimit: number;
}

export interface Responsible {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  isCash: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export interface Bill {
  id: string;
  cardId: string;
  month: number;
  year: number;
  totalAmount: number;
  isPaid: boolean;
  dueDate: string;
  closingDate: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  method: PaymentMethod;
  accountId?: string;
  cardId?: string;
  categoryId?: string;
  responsibleId: string;
  installments?: number;
  currentInstallment?: number;
  installmentId?: string;
  isPaid: boolean;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  day: number;
  categoryId?: string;
  responsibleId: string;
  lastPaidDate?: string;
}
