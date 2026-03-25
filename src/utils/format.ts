import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date | undefined | null, pattern: string = 'dd/MM/yyyy'): string => {
  if (!date) return '-';
  
  try {
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
      // Se a data for meia-noite UTC (como costuma vir do banco),
      // adicionar 3 horas garante que caia no dia correto em fusos UTC-3
      if (date.includes('T00:00:00')) {
        d.setHours(d.getHours() + 3);
      }
    } else {
      d = date;
    }
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      return '-';
    }

    return format(d, pattern, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return '-';
  }
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month, 1);
  return format(date, 'MMMM yyyy', { locale: ptBR });
};
