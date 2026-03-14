import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function PremiumButton({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: PremiumButtonProps) {
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 border border-primary/50",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md hover:-translate-y-0.5",
    glass: "bg-transparent hover:bg-white/5 text-white border border-transparent hover:border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 hover:-translate-y-0.5"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "relative flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-out overflow-hidden active:translate-y-0 active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
