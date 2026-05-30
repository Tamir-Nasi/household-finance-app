import { useState } from 'react'
import { useFixedExpenses, useUpsertFixedExpense, useDeleteFixedExpense } from '@/hooks/useFixedExpenses'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatILS } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { FixedExpense } from '@/types'

const empty = { label: '', amount: '', day_of_month: '1', is_active: true }

export function FixedExpensesPage() {
  const { toast } = useToast()
  const { data: expenses, isLoading } = useFixedExpenses()
  const upsert = useUpsertFixedExpense()
  const remove = useDeleteFixedExpense()
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({ ...empty })
  const [editId, setEditId] = useState<string | null>(null)

  function openAdd() { setForm({ ...empty }); setEditId(null); setOpen(true) }
  function openEdit(exp: FixedExpense) {
    setForm({ label: exp.label, amount: String(exp.amount), day_of_month: String(exp.day_of_month), is_active: exp.is_active })
    setEditId(exp.id)
    setOpen(true)
  }

  async function handleSave() {
    if (!form.label || !form.amount) { toast('מלא שם וסכום', 'error'); return }
    await upsert.mutateAsync({
      ...(editId ? { id: editId } : {}),
      label: form.label,
      amount: Number(form.amount),
      day_of_month: Number(form.day_of_month),
      is_active: form.is_active,
    })
    toast(editId ? 'הוצאה קבועה עודכנה' : 'הוצאה קבועה נוספה')
    setOpen(false)
  }

  const total = (expenses ?? []).filter((e) => e.is_active).reduce((s, e) => s + e.amount, 0)

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">הוצאות קבועות</h1>
        <Button size="sm" onClick={openAdd}><Plus size={16} /> הוסף</Button>
      </div>

      {total > 0 && (
        <Card className="bg-warning-100 border-warning-600/20">
          <p className="text-xs text-warning-600">סה״כ הוצאות קבועות חודשיות</p>
          <p className="text-2xl font-bold text-warning-600">{formatILS(total)}</p>
        </Card>
      )}

      {isLoading && <p className="text-center text-slate-400 py-8">טוען...</p>}
      {!isLoading && (expenses ?? []).length === 0 && (
        <p className="text-center text-slate-400 py-8">לא הוגדרו הוצאות קבועות עדיין</p>
      )}

      {(expenses ?? []).map((exp) => (
        <Card key={exp.id} className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-slate-800">{exp.label}</p>
            <p className="text-xs text-slate-400">יום {exp.day_of_month} בחודש · {exp.is_active ? 'פעיל' : 'לא פעיל'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{formatILS(exp.amount)}</span>
            <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil size={15} /></button>
            <button onClick={() => remove.mutateAsync(exp.id).then(() => toast('נמחק'))} className="p-1.5 rounded-lg hover:bg-danger-50 text-slate-300 hover:text-danger-600"><Trash2 size={15} /></button>
          </div>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'עריכת הוצאה קבועה' : 'הוספת הוצאה קבועה'}>
        <div className="flex flex-col gap-4">
          <Input label="שם / תיאור" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder='לדוגמה: "שכירות"' />
          <Input label="סכום (₪)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} suffix="₪" />
          <Input label="יום חיוב בחודש" type="number" min={1} max={31} value={form.day_of_month} onChange={(e) => setForm((f) => ({ ...f, day_of_month: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-primary-500 w-4 h-4" />
            פעיל
          </label>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">ביטול</Button>
            <Button loading={upsert.isPending} onClick={handleSave} className="flex-1">שמור</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
