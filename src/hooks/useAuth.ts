import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export function useAuthInit() {
  const { setUser, setSession, setProfile, setLoading, clear } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { clear(); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      setLoading(false)
      return
    }

    // Trigger may not have run — create the profile row with user metadata
    const { data: { user } } = await supabase.auth.getUser()
    const { data: created } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: user?.user_metadata?.full_name ?? null,
      }, { onConflict: 'id' })
      .select()
      .single()

    setProfile(created)
    setLoading(false)
  }
}
