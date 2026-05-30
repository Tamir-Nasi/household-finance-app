import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatILS } from '@/lib/utils'
import type { AccountBalance, Invitation, Profile } from '@/types'
import { useNavigate } from 'react-router-dom'

export function HouseholdPage() {
  const navigate   = useNavigate()
  const { toast }  = useToast()
  const qc         = useQueryClient()
  const { profile, setProfile } = useAuthStore()
  const householdId = profile?.household_id

  const [inviteEmail, setInviteEmail] = useState('')
  const [newBalance, setNewBalance]   = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [updatingBalance, setUpdatingBalance] = useState(false)

  const { data: balance } = useQuery<AccountBalance | null>({
    queryKey: ['balance', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('account_balance').select('*').eq('household_id', householdId!).single()
      return data
    },
  })

  const { data: members } = useQuery<Profile[]>({
    queryKey: ['members', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('household_id', householdId!)
      return data ?? []
    },
  })

  const { data: pendingInvites } = useQuery<Invitation[]>({
    queryKey: ['invitations', householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data } = await supabase.from('invitations').select('*').eq('household_id', householdId!).eq('status', 'pending')
      return data ?? []
    },
  })

  // Check if current user has a pending invite to join another household
  const { data: myInvites } = useQuery<Invitation[]>({
    queryKey: ['my-invites', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.email) return []
      const { data } = await supabase
        .from('invitations')
        .select('*')
        .eq('invited_email', userData.user.email)
        .eq('status', 'pending')
      return data ?? []
    },
  })

  const acceptInvite = useMutation({
    mutationFn: async (invite: Invitation) => {
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invite.id)
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ household_id: invite.household_id, role: 'member' })
        .eq('id', profile!.id)
        .select()
        .single()
      return updatedProfile
    },
    onSuccess: (updatedProfile) => {
      if (updatedProfile) setProfile(updatedProfile)
      toast('הצטרפת למשק הבית!')
      qc.invalidateQueries()
      navigate('/')
    },
  })

  async function sendInvite() {
    if (!inviteEmail) return
    setSendingInvite(true)
    const { error } = await supabase.from('invitations').insert({
      household_id: householdId,
      invited_email: inviteEmail,
      invited_by: profile!.id,
    })
    setSendingInvite(false)
    if (error) { toast(error.message, 'error'); return }
    toast('ההזמנה נשלחה!')
    setInviteEmail('')
    qc.invalidateQueries({ queryKey: ['invitations'] })
  }

  async function updateBalance() {
    if (!newBalance) return
    setUpdatingBalance(true)
    const bal = Number(newBalance)
    const { error } = balance
      ? await supabase.from('account_balance').update({ balance: bal, updated_by: profile!.id, updated_at: new Date().toISOString() }).eq('household_id', householdId!)
      : await supabase.from('account_balance').insert({ household_id: householdId!, balance: bal, updated_by: profile!.id })
    setUpdatingBalance(false)
    if (error) { toast(error.message, 'error'); return }
    toast('יתרה עודכנה')
    setNewBalance('')
    qc.invalidateQueries({ queryKey: ['balance'] })
  }

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">משק הבית</h1>

      {/* Balance update */}
      <Card>
        <p className="text-sm font-medium text-slate-700 mb-1">יתרה נוכחית בחשבון</p>
        <p className="text-2xl font-bold text-primary-600 mb-3">{balance ? formatILS(balance.balance) : '—'}</p>
        <div className="flex gap-2">
          <Input
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            type="number"
            placeholder="יתרה חדשה"
            suffix="₪"
            className="flex-1"
          />
          <Button loading={updatingBalance} onClick={updateBalance} size="md">עדכן</Button>
        </div>
      </Card>

      {/* Members */}
      {(members ?? []).length > 0 && (
        <Card>
          <p className="text-sm font-medium text-slate-700 mb-3">חברי משק הבית</p>
          <div className="flex flex-col gap-2">
            {(members ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {m.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.full_name ?? 'משתמש'}</p>
                  <p className="text-xs text-slate-400">{m.role === 'owner' ? 'בעל משק הבית' : 'חבר'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invite */}
      <Card>
        <p className="text-sm font-medium text-slate-700 mb-3">הזמן בן/בת זוג</p>
        <div className="flex gap-2">
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            placeholder="אימייל"
            className="flex-1"
          />
          <Button loading={sendingInvite} onClick={sendInvite}>שלח</Button>
        </div>
        {(pendingInvites ?? []).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">הזמנות שנשלחו</p>
            {(pendingInvites ?? []).map((inv) => (
              <p key={inv.id} className="text-sm text-slate-600">📧 {inv.invited_email}</p>
            ))}
          </div>
        )}
      </Card>

      {/* Incoming invites */}
      {(myInvites ?? []).length > 0 && (
        <Card>
          <p className="text-sm font-medium text-slate-700 mb-3">הזמנות שקיבלת</p>
          {(myInvites ?? []).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between">
              <p className="text-sm text-slate-600">הצטרף למשק בית</p>
              <Button size="sm" onClick={() => acceptInvite.mutate(inv)} loading={acceptInvite.isPending}>
                קבל הזמנה
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
