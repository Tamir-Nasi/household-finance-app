import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { Income } from '@/types'

export function useIncomes() {
  const profile = useAuthStore((s) => s.profile)
  const householdId = profile?.household_id

  return useQuery<Income[]>({
    queryKey: ['incomes', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('household_id', householdId!)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertIncome() {
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  return useMutation({
    mutationFn: async (income: Partial<Income> & { label: string; amount: number }) => {
      const payload = { ...income, household_id: profile!.household_id, user_id: profile!.id }
      const { error } = income.id
        ? await supabase.from('incomes').update(payload).eq('id', income.id)
        : await supabase.from('incomes').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incomes'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incomes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incomes'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}
