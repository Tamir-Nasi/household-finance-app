import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { useAddTransaction } from '@/hooks/useTransactions'
import { useMonthSummary } from '@/hooks/useMonthSummary'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatILS, today } from '@/lib/utils'
import { Delete } from 'lucide-react'

const NUMPAD = ['7','8','9','4','5','6','1','2','3','','0','⌫']

export function QuickExpensePage() {
  const navigate    = useNavigate()
  const { toast }   = useToast()
  const { data: categories } = useCategories()
  const addTx       = useAddTransaction()
  const now         = new Date()
  const { data: summary } = useMonthSummary(now.getFullYear(), now.getMonth() + 1)

  const [amount, setAmount]         = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [note, setNote]             = useState('')

  function pressNumpad(key: string) {
    if (key === '⌫') { setAmount((a) => a.slice(0, -1)); return }
    if (key === '') return
    if (key === '.' && amount.includes('.')) return
    if (amount === '0' && key !== '.') { setAmount(key); return }
    if (amount.length >= 8) return
    setAmount((a) => a + key)
  }

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) { toast('הכנס סכום תקין', 'error'); return }
    if (!categoryId) { toast('בחר קטגוריה', 'error'); return }
    await addTx.mutateAsync({ amount: Number(amount), category_id: categoryId, note, date: today() })
    toast('ההוצאה נוספה בהצלחה ✓')
    setAmount('')
    setNote('')
    setCategoryId(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header bar */}
      <div className="bg-primary-600 text-white px-5 pt-12 pb-6 safe-top">
        <p className="text-primary-200 text-sm mb-1">חיסכון חודשי עד כה</p>
        <p className="text-3xl font-bold">
          {summary ? formatILS(summary.actualSavings) : '…'}
        </p>
        <p className="text-primary-200 text-xs mt-1">
          צפוי עד סוף החודש: {summary ? formatILS(summary.projectedSavings) : '…'}
        </p>
      </div>

      <div className="flex-1 px-4 pt-4 flex flex-col gap-3">
        {/* Amount display */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-slate-400 text-sm mb-1">סכום הוצאה</p>
          <p className="text-4xl font-bold text-slate-900 min-h-[3rem] flex items-center justify-center gap-1">
            {amount || <span className="text-slate-300">0</span>}
            <span className="text-2xl text-slate-400">₪</span>
          </p>
        </div>

        {/* Category grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
          <p className="text-xs font-medium text-slate-500 mb-2 px-1">קטגוריה</p>
          <div className="grid grid-cols-4 gap-2">
            {(categories ?? []).filter((c) => !c.is_fixed).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all ${
                  categoryId === cat.id
                    ? 'ring-2 ring-primary-400 bg-primary-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-slate-600 text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <input
          className="w-full h-11 border border-slate-200 rounded-xl bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="הערה (אופציונלי)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Numpad */}
      <div className="bg-white border-t border-slate-100 px-4 pt-2 pb-2">
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {NUMPAD.map((key, i) => (
            <button
              key={i}
              onClick={() => pressNumpad(key)}
              className={`h-14 rounded-xl text-xl font-medium transition-colors flex items-center justify-center ${
                key === '⌫'
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : key === ''
                  ? ''
                  : 'bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900'
              }`}
            >
              {key === '⌫' ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/transactions')} className="flex-1">
            ביטול
          </Button>
          <Button
            loading={addTx.isPending}
            onClick={handleSubmit}
            className="flex-2 flex-grow-[2]"
            size="lg"
          >
            הוסף הוצאה
          </Button>
        </div>
      </div>
    </div>
  )
}
