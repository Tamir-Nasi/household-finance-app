import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { FixedExpense } from '@/types'

export function useFixedExpenses() {
  const profile = useAuthStore((s) => s.profile)
  const householdId = profile?.household_id

  return useQuery<FixedExpense[]>({
    queryKey: ['fixed-expenses', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('household_id', householdId!)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertFixedExpense() {
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  return useMutation({
    mutationFn: async (expense: Partial<FixedExpense> & { label: string; amount: number }) => {
      const payload = { ...expense, household_id: profile!.household_id }
      const { error } = expense.id
        ? await supabase.from('fixed_expenses').update(payload).eq('id', expense.id)
        : await supabase.from('fixed_expenses').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fixed-expenses'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}

export function useDeleteFixedExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fixed-expenses'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}
