import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary text-white hover:bg-primary-hover',
  secondary: 'border-border-strong bg-white text-primary hover:border-primary',
  ghost: 'border-transparent bg-transparent text-text-muted hover:bg-stone-100 hover:text-primary',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const baseClassName =
  'inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45';

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${baseClassName} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  className = '',
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${baseClassName} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
