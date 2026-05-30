import { useState } from 'react'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatILS, formatDate, monthLabel } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react'

export function TransactionsPage() {
  const profile   = useAuthStore((s) => s.profile)
  const { toast } = useToast()
  const now     = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [filter, setFilter] = useState<'all' | 'mine' | 'partner'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: transactions, isLoading } = useTransactions(year, month)
  const { data: categories } = useCategories()
  const deleteTx = useDeleteTransaction()

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const filtered = (transactions ?? []).filter((tx) => {
    if (filter === 'mine')    return tx.user_id === profile?.id
    if (filter === 'partner') return tx.user_id !== profile?.id
    return true
  })

  async function confirmDelete() {
    if (!deleteId) return
    await deleteTx.mutateAsync(deleteId)
    toast('ההוצאה נמחקה')
    setDeleteId(null)
  }

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]))

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
          <ChevronRight size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">{monthLabel(year, month)}</h1>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {(['all', 'mine', 'partner'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'הכל' : f === 'mine' ? 'שלי' : 'בן/בת זוג'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-center text-slate-400 py-8">טוען...</p>}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8">אין עסקאות בחודש זה</p>
      )}

      {filtered.length > 0 && (
        <Card className="p-0">
          {filtered.map((tx, i) => {
            const cat = tx.category ?? (tx.category_id ? catMap[tx.category_id] : null)
            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < filtered.length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat?.icon ?? '💰'}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-tight">
                      {tx.note || cat?.name || 'הוצאה'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(tx.date)}
                      {tx.profile && tx.user_id !== profile?.id && (
                        <> · {tx.profile.full_name}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{formatILS(tx.amount)}</span>
                  {cat && <Badge color={cat.color}>{cat.icon}</Badge>}
                  <button
                    onClick={() => setDeleteId(tx.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Total row */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center px-1 text-sm">
          <span className="text-slate-500">{filtered.length} עסקאות</span>
          <span className="font-bold text-slate-800">
            סה״כ: {formatILS(filtered.reduce((s, t) => s + t.amount, 0))}
          </span>
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="מחיקת הוצאה">
        <p className="text-slate-600 mb-5">האם אתה בטוח שברצונך למחוק הוצאה זו?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">ביטול</Button>
          <Button variant="danger" loading={deleteTx.isPending} onClick={confirmDelete} className="flex-1">מחק</Button>
        </div>
      </Modal>
    </div>
  )
}
