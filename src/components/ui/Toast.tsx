import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error'
interface ToastItem { id: number; message: string; type: ToastType }

interface ToastCtx { toast: (message: string, type?: ToastType) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId.current
    setItems((prev) => [...prev, { id, message, type }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id))

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 inset-x-4 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-2xl shadow-lg pointer-events-auto',
              item.type === 'success' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700',
            )}
          >
            {item.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="flex-1 text-sm font-medium">{item.message}</span>
            <button onClick={() => remove(item.id)} className="p-0.5 rounded hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
