import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  suffix?: ReactNode
  prefix?: ReactNode
}

export function Input({ label, error, suffix, prefix, className, id, ...rest }: Props) {
  const inputId = id ?? label
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute start-3 text-slate-400 pointer-events-none">{prefix}</span>}
        <input
          id={inputId}
          className={cn(
            'w-full h-11 border border-slate-300 rounded-xl bg-white px-4 text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
            'placeholder:text-slate-400 transition',
            prefix ? 'ps-10' : undefined,
            suffix ? 'pe-10' : undefined,
            error && 'border-danger-600 focus:ring-danger-400',
            className,
          )}
          {...rest}
        />
        {suffix && <span className="absolute end-3 text-slate-400 pointer-events-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  )
}
