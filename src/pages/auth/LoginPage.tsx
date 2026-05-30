import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials':  'אימייל או סיסמה שגויים',
  'Email not confirmed':        'נא לאמת את כתובת המייל לפני הכניסה — בדוק את תיבת הדואר שלך',
  'Too many requests':          'יותר מדי ניסיונות — נסה שוב מאוחר יותר',
}

export function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast(ERROR_MAP[error.message] ?? error.message, 'error')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-slate-900">ניהול כספים ביתי</h1>
          <p className="text-slate-500 mt-1">כנס לחשבונך</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <Input
            label="דואר אלקטרוני"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <div className="text-end">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
              שכחתי סיסמה
            </Link>
          </div>
          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            כנס
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            הירשם
          </Link>
        </p>
      </div>
    </div>
  )
}
