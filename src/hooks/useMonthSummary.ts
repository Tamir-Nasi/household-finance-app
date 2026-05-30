import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { daysInMonth, daysRemainingInMonth } from '@/lib/utils'
import type { MonthCalc } from '@/types'

export function useMonthSummary(year: number, month: number) {
  const profile = useAuthStore((s) => s.profile)
  const householdId = profile?.household_id

  return useQuery<MonthCalc>({
    queryKey: ['month-summary', householdId, year, month],
    enabled: !!householdId,
    queryFn: async () => {
      const [incomeRes, fixedRes, txRes] = await Promise.all([
        supabase.from('incomes').select('amount').eq('household_id', householdId!).eq('is_active', true),
        supabase.from('fixed_expenses').select('amount').eq('household_id', householdId!).eq('is_active', true),
        supabase
          .from('transactions')
          .select('amount')
          .eq('household_id', householdId!)
          .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
          .lte('date', `${year}-${String(month).padStart(2, '0')}-${daysInMonth(year, month)}`),
      ])

      const totalIncome  = (incomeRes.data ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const totalFixed   = (fixedRes.data ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const totalDynamic = (txRes.data   ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const actualSavings   = totalIncome - totalFixed - totalDynamic
      const expectedSavings = totalIncome - totalFixed

      const daysDone      = daysInMonth(year, month) - daysRemainingInMonth()
      const dailySpend    = daysDone > 0 ? totalDynamic / daysDone : 0
      const projectedDynamic = dailySpend * daysInMonth(year, month)
      const projectedSavings = totalIncome - totalFixed - projectedDynamic

      return {
        totalIncome,
        totalFixed,
        totalDynamic,
        expectedSavings,
        actualSavings,
        daysRemaining: daysRemainingInMonth(),
        projectedSavings,
      }
    },
  })
}
