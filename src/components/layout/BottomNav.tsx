import { NavLink } from 'react-router-dom'
import { PlusCircle, LayoutDashboard, List, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/',             icon: PlusCircle,      label: 'הוצאה'  },
  { to: '/dashboard',    icon: LayoutDashboard, label: 'סיכום'  },
  { to: '/transactions', icon: List,            label: 'עסקאות' },
  { to: '/settings',     icon: Settings,        label: 'הגדרות' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 safe-bottom z-40">
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
