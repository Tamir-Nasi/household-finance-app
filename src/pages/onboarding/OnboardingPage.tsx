import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { DEFAULT_CATEGORIES } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function OnboardingPage() {
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { user, setProfile } = useAuthStore()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [householdName, setHouseholdName] = useState('')
  const [balance, setBalance] = useState('')

  async function finish() {
    if (!user) return
    setLoading(true)
    try {
      // 1. Create household
      const { data: hh, error: hhErr } = await supabase
        .from('households')
        .insert({ name: householdName.trim() || `משפחת ${user.user_metadata?.full_name ?? ''}` })
        .select()
        .single()
      if (hhErr) throw new Error(`יצירת משק בית נכשלה: ${hhErr.message}`)

      // 2. Link profile → household
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .update({ household_id: hh.id, onboarding_completed: true, full_name: user.user_metadata?.full_name ?? null })
        .eq('id', user.id)
        .select()
        .single()
      if (profErr) throw new Error(`עדכון פרופיל נכשל: ${profErr.message}`)

      // 3. Seed default categories
      const { error: catErr } = await supabase
        .from('categories')
        .insert(DEFAULT_CATEGORIES.map((c) => ({ ...c, household_id: hh.id })))
      if (catErr) throw new Error(`יצירת קטגוריות נכשלה: ${catErr.message}`)

      // 4. Opening balance (optional)
      if (balance.trim()) {
        const { error: balErr } = await supabase
          .from('account_balance')
          .insert({ household_id: hh.id, balance: Number(balance), updated_by: user.id })
        if (balErr) throw new Error(`שמירת יתרה נכשלה: ${balErr.message}`)
      }

      setProfile(prof)
      navigate('/')
    } catch (err: unknown) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6">
      <div className="w-full max-w-sm">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all ${
              s === step ? 'w-8 bg-primary-500' : s < step ? 'w-2 bg-primary-300' : 'w-2 bg-slate-200'
            }`} />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <h2 className="text-xl font-bold text-slate-900">ברוך הבא!</h2>
              <p className="text-slate-500 text-sm mt-1">בוא נגדיר את משק הבית שלך</p>
            </div>
            <Input
              label="שם משק הבית (אופציונלי)"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder='לדוגמה: "משפחת כהן"'
            />
            <Input
              label="יתרה נוכחית בחשבון (₪)"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="15000"
              suffix="₪"
            />
            <Button size="lg" className="w-full" onClick={() => setStep(2)}>
              הבא
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-slate-900">הכל מוכן!</h2>
              <p className="text-slate-500 text-sm mt-1">
                הקטגוריות הבאות יתווספו אוטומטית — תוכל לערוך אותן בהגדרות
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
              {DEFAULT_CATEGORIES.map((c) => (
                <div key={c.name} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-sm text-slate-700">{c.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                חזרה
              </Button>
              <Button loading={loading} onClick={finish} className="flex-1">
                התחל!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
