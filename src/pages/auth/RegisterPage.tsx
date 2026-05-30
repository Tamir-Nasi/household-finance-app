import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function RegisterPage() {
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)

    if (error) {
      const msgs: Record<string, string> = {
        'User already registered': 'כתובת המייל כבר רשומה במערכת',
        'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
      }
      toast(msgs[error.message] ?? error.message, 'error')
      return
    }

    // Email confirmation disabled → session created immediately, onAuthStateChange handles redirect
    if (data.session) return

    // Email confirmation required → show "check your email" screen
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6 text-center">
      <div className="text-6xl mb-4">📧</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">בדוק את המייל שלך</h2>
      <p className="text-slate-500 mb-2">שלחנו קישור אימות לכתובת:</p>
      <p className="font-semibold text-slate-800 mb-6">{email}</p>
      <p className="text-sm text-slate-400 mb-8">לאחר לחיצה על הקישור תועבר ישירות לאפליקציה</p>
      <Link to="/login" className="text-primary-600 font-medium hover:underline text-sm">
        חזרה לכניסה
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-slate-900">הרשמה</h1>
          <p className="text-slate-500 mt-1">צור חשבון חדש</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <Input
            label="שם מלא"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ישראל ישראלי"
            required
            autoComplete="name"
          />
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
            placeholder="לפחות 6 תווים"
            minLength={6}
            required
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            הירשם
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            כנס
          </Link>
        </p>
      </div>
    </div>
  )
}
