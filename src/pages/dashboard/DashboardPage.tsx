import { useMonthSummary } from '@/hooks/useMonthSummary'
import { useTransactions } from '@/hooks/useTransactions'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { formatILS, formatDate, currentMonthLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { AccountBalance } from '@/types'

export function DashboardPage() {
  const profile   = useAuthStore((s) => s.profile)
  const now       = new Date()
  const year      = now.getFullYear()
  const month     = now.getMonth() + 1
  const { data: summary }      = useMonthSummary(year, month)
  const { data: transactions } = useTransactions(year, month)

  const { data: balanceData } = useQuery<AccountBalance | null>({
    queryKey: ['balance', profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data } = await supabase
        .from('account_balance')
        .select('*')
        .eq('household_id', profile!.household_id)
        .single()
      return data
    },
  })

  const recentTx = (transactions ?? []).slice(0, 8)

  // Build category breakdown for donut chart
  const catMap: Record<string, { name: string; icon: string; color: string; total: number }> = {}
  for (const tx of transactions ?? []) {
    const key = tx.category_id ?? 'other'
    if (!catMap[key]) catMap[key] = { name: tx.category?.name ?? 'אחר', icon: tx.category?.icon ?? '💰', color: tx.category?.color ?? '#94a3b8', total: 0 }
    catMap[key].total += tx.amount
  }
  const chartData = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 6)

  const savingsPct = summary && summary.totalIncome > 0
    ? Math.round((summary.actualSavings / summary.totalIncome) * 100)
    : 0

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">{currentMonthLabel()}</h1>

      {/* Balance */}
      <Card className="bg-gradient-to-l from-primary-500 to-primary-700 text-white border-0">
        <p className="text-primary-200 text-sm">יתרה בחשבון</p>
        <p className="text-3xl font-bold mt-1">{balanceData ? formatILS(balanceData.balance) : '—'}</p>
      </Card>

      {/* Savings meter */}
      {summary && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">חיסכון חודשי</span>
            <span className={`text-sm font-bold ${summary.actualSavings >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatILS(summary.actualSavings)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${savingsPct >= 0 ? 'bg-success-600' : 'bg-danger-600'}`}
              style={{ width: `${Math.min(Math.abs(savingsPct), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>הכנסות: {formatILS(summary.totalIncome)}</span>
            <span>קבועות: {formatILS(summary.totalFixed)}</span>
            <span>משתנות: {formatILS(summary.totalDynamic)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            חיסכון צפוי עד סוף החודש: <strong className="text-slate-600">{formatILS(summary.projectedSavings)}</strong>
          </p>
        </Card>
      )}

      {/* Donut chart */}
      {chartData.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-slate-700 mb-3">פירוט לפי קטגוריה</p>
          <div className="flex gap-4 items-center">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="total" cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={2}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatILS(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              {chartData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    {c.icon} {c.name}
                  </span>
                  <span className="font-medium text-slate-700">{formatILS(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <p className="text-sm font-medium text-slate-700 mb-3">עסקאות אחרונות</p>
        {recentTx.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">אין עסקאות עדיין החודש</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-50">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tx.category?.icon ?? '💰'}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tx.note || tx.category?.name || 'הוצאה'}</p>
                    <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{formatILS(tx.amount)}</span>
                  {tx.category && <Badge color={tx.category.color}>{tx.category.icon}</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
