import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color = '#6366f1', className }: Props) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{ backgroundColor: color + '22', color }}
    >
      {children}
    </span>
  )
}
