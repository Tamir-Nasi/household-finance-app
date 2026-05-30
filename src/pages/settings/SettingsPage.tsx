import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Wallet, BarChart2, Tag, Home, User } from 'lucide-react'

const links = [
  { to: '/settings/income',    icon: Wallet,   label: 'הכנסות ומשכורות' },
  { to: '/settings/fixed',     icon: BarChart2, label: 'הוצאות קבועות' },
  { to: '/settings/categories',icon: Tag,       label: 'קטגוריות' },
  { to: '/settings/household', icon: Home,      label: 'משק הבית ובן/בת זוג' },
  { to: '/settings/profile',   icon: User,      label: 'פרופיל' },
]

export function SettingsPage() {
  const { clear } = useAuthStore()
  async function logout() { await supabase.auth.signOut(); clear() }

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">הגדרות</h1>
      <Card className="p-0">
        {links.map(({ to, icon: Icon, label }, i) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors ${
              i < links.length - 1 ? 'border-b border-slate-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-primary-500" />
              <span className="text-sm font-medium text-slate-800">{label}</span>
            </div>
            <ChevronLeft size={16} className="text-slate-300" />
          </Link>
        ))}
      </Card>
      <Button variant="ghost" onClick={logout} className="text-danger-600 hover:bg-danger-50 w-full">
        יציאה
      </Button>
    </div>
  )
}
