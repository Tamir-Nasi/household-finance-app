import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import type { Category } from '@/types'

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'household_id' | 'created_at'>[] = [
  { name: 'מזון וסופר', icon: '🛒', color: '#22c55e', monthly_budget: null, is_fixed: false },
  { name: 'מסעדות', icon: '🍽️', color: '#f97316', monthly_budget: null, is_fixed: false },
  { name: 'תחבורה', icon: '🚗', color: '#3b82f6', monthly_budget: null, is_fixed: false },
  { name: 'בריאות', icon: '💊', color: '#ef4444', monthly_budget: null, is_fixed: false },
  { name: 'בידור', icon: '🎬', color: '#a855f7', monthly_budget: null, is_fixed: false },
  { name: 'ביגוד', icon: '👗', color: '#ec4899', monthly_budget: null, is_fixed: false },
  { name: 'חינוך', icon: '📚', color: '#06b6d4', monthly_budget: null, is_fixed: false },
  { name: 'ילדים', icon: '🧒', color: '#f59e0b', monthly_budget: null, is_fixed: false },
  { name: 'חשמל', icon: '⚡', color: '#eab308', monthly_budget: null, is_fixed: true },
  { name: 'שכירות', icon: '🏠', color: '#64748b', monthly_budget: null, is_fixed: true },
  { name: 'ביטוח', icon: '🛡️', color: '#0ea5e9', monthly_budget: null, is_fixed: true },
  { name: 'אחר', icon: '💰', color: '#94a3b8', monthly_budget: null, is_fixed: false },
]

export function useCategories() {
  const profile = useAuthStore((s) => s.profile)
  const householdId = profile?.household_id

  return useQuery<Category[]>({
    queryKey: ['categories', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('household_id', householdId!)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertCategory() {
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  return useMutation({
    mutationFn: async (cat: Partial<Category> & { name: string }) => {
      const payload = { ...cat, household_id: profile!.household_id }
      const { error } = cat.id
        ? await supabase.from('categories').update(payload).eq('id', cat.id)
        : await supabase.from('categories').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
