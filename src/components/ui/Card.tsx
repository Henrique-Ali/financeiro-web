import React from 'react';
import { cn } from '../../lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 text-gray-900 dark:text-zinc-100", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
