import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    setSent(true)
  }

  if (sent) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">קישור נשלח!</h2>
      <p className="text-slate-500 mb-6">בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.</p>
      <Link to="/login" className="text-primary-600 font-medium hover:underline">חזרה לכניסה</Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900">שכחתי סיסמה</h1>
          <p className="text-slate-500 mt-1">שלח לי קישור לאיפוס</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <Input
            label="דואר אלקטרוני"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" loading={loading} size="lg" className="w-full">
            שלח קישור לאיפוס
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-primary-600 hover:underline">חזרה לכניסה</Link>
        </p>
      </div>
    </div>
  )
}
