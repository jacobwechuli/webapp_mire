"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  className,
  size = 'lg',
  icon
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14', 
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'flex items-center justify-center',
        'hover:scale-110 active:scale-95',
        sizeClasses[size],
        className
      )}
      aria-label="Add transaction"
    >
      {icon ? icon : <Plus size={iconSizes[size]} />}
    </Button>
  );
};

export default FloatingActionButton; 