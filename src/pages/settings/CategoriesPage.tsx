import { useState } from 'react'
import { useCategories, useUpsertCategory, useDeleteCategory } from '@/hooks/useCategories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types'

const COLORS = ['#22c55e','#f97316','#3b82f6','#ef4444','#a855f7','#ec4899','#06b6d4','#f59e0b','#64748b','#6366f1']
const ICONS  = ['🛒','🍽️','🚗','💊','🎬','👗','📚','🧒','⚡','🏠','🛡️','💰','✈️','🐾','🎮','💻','🏋️','🎁']

const empty = { name: '', icon: '💰', color: '#6366f1', monthly_budget: '', is_fixed: false }

export function CategoriesPage() {
  const { toast } = useToast()
  const { data: categories, isLoading } = useCategories()
  const upsert = useUpsertCategory()
  const remove = useDeleteCategory()
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({ ...empty })
  const [editId, setEditId] = useState<string | null>(null)

  function openAdd() { setForm({ ...empty }); setEditId(null); setOpen(true) }
  function openEdit(cat: Category) {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, monthly_budget: cat.monthly_budget ? String(cat.monthly_budget) : '', is_fixed: cat.is_fixed })
    setEditId(cat.id)
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name) { toast('הכנס שם קטגוריה', 'error'); return }
    await upsert.mutateAsync({
      ...(editId ? { id: editId } : {}),
      name: form.name,
      icon: form.icon,
      color: form.color,
      monthly_budget: form.monthly_budget ? Number(form.monthly_budget) : null,
      is_fixed: form.is_fixed,
    })
    toast(editId ? 'קטגוריה עודכנה' : 'קטגוריה נוספה')
    setOpen(false)
  }

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">קטגוריות</h1>
        <Button size="sm" onClick={openAdd}><Plus size={16} /> הוסף</Button>
      </div>

      {isLoading && <p className="text-center text-slate-400 py-8">טוען...</p>}

      <div className="grid grid-cols-2 gap-3">
        {(categories ?? []).map((cat) => (
          <Card key={cat.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-800 leading-tight">{cat.name}</p>
                <p className="text-xs text-slate-400">{cat.is_fixed ? 'קבועה' : 'משתנה'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil size={14} /></button>
              <button onClick={() => remove.mutateAsync(cat.id).then(() => toast('נמחק'))} className="p-1.5 rounded-lg hover:bg-danger-50 text-slate-300 hover:text-danger-600"><Trash2 size={14} /></button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}>
        <div className="flex flex-col gap-4">
          <Input label="שם קטגוריה" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder='לדוגמה: "מסעדות"' />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">אייקון</p>
            <div className="grid grid-cols-9 gap-1">
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`text-xl p-1 rounded-lg transition-all ${form.icon === ic ? 'bg-primary-100 ring-2 ring-primary-400' : 'hover:bg-slate-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">צבע</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <Input label="תקציב חודשי (₪, אופציונלי)" type="number" value={form.monthly_budget} onChange={(e) => setForm((f) => ({ ...f, monthly_budget: e.target.value }))} suffix="₪" />

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.is_fixed} onChange={(e) => setForm((f) => ({ ...f, is_fixed: e.target.checked }))} className="accent-primary-500 w-4 h-4" />
            הוצאה קבועה
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
