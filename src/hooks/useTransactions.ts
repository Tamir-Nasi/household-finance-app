import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { daysInMonth } from '@/lib/utils'
import type { Transaction } from '@/types'

export function useTransactions(year: number, month: number) {
  const profile = useAuthStore((s) => s.profile)
  const householdId = profile?.household_id

  return useQuery<Transaction[]>({
    queryKey: ['transactions', householdId, year, month],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(id,name,icon,color), profile:profiles(id,full_name)')
        .eq('household_id', householdId!)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('date', `${year}-${String(month).padStart(2, '0')}-${daysInMonth(year, month)}`)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Transaction[]
    },
  })
}

export function useAddTransaction() {
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  return useMutation({
    mutationFn: async (payload: {
      category_id: string | null
      amount: number
      note: string
      date: string
    }) => {
      const { error } = await supabase.from('transactions').insert({
        ...payload,
        household_id: profile!.household_id,
        user_id: profile!.id,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }).then(() =>
      qc.invalidateQueries({ queryKey: ['month-summary'] })
    ),
  })
}
