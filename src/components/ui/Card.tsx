import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...rest }: Props) {
  return (
    <div
      className={cn('bg-white rounded-2xl shadow-sm border border-slate-100 p-4', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
