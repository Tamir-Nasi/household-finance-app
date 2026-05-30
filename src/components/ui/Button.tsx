import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-200',
  secondary: 'bg-white text-primary-600 border border-primary-300 hover:bg-primary-50 disabled:opacity-50',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 disabled:bg-danger-100',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-base rounded-xl',
  lg: 'h-14 px-6 text-lg rounded-2xl',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer',
        variants[variant],
        sizes[size],
        (loading || disabled) && 'opacity-60 cursor-not-allowed',
        className,
      )}
      disabled={loading || disabled}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
