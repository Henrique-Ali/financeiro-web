import React from 'react';
import { Card } from './ui/Card';
import type { Bill, CreditCard } from '../types';
import { formatCurrency, formatMonthYear } from '../utils/format';
import { CreditCard as CardIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface BillCardProps {
  bill: Bill;
  nextBill?: Bill;
  card: CreditCard;
  onPay: (bill: Bill) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, nextBill, card, onPay }) => {
  const isOverLimit = bill.totalAmount > card.limit;
  const availableLimit = card.limit - bill.totalAmount; // Simplified logic

  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <CardIcon size={64} />
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{card.name}</h3>
          <p className="text-sm text-indigo-600 font-medium">
            {formatMonthYear(bill.month, bill.year)}
          </p>
          <p className="text-xs text-gray-500">
            Vence dia {new Date(bill.dueDate).getDate()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Fatura Atual</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(bill.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-indigo-600'}`} 
            style={{ width: `${Math.min((bill.totalAmount / card.limit) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Limite: {formatCurrency(card.limit)}</span>
          <span>Disponível: {formatCurrency(availableLimit)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
         {nextBill && (
           <div className="text-xs text-gray-400">
             Próx: {formatCurrency(nextBill.totalAmount)} ({formatMonthYear(nextBill.month, nextBill.year)})
           </div>
         )}
         
         <Button size="sm" onClick={() => onPay(bill)} disabled={bill.isPaid}>
           {bill.isPaid ? 'Paga' : 'Pagar Fatura'}
         </Button>
      </div>
    </Card>
  );
};
