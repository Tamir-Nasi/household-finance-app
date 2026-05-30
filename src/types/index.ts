export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  household_id: string | null
  role: 'owner' | 'member'
  onboarding_completed: boolean
  created_at: string
}

export interface Household {
  id: string
  name: string
  created_at: string
}

export interface Invitation {
  id: string
  household_id: string
  invited_email: string
  invited_by: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Category {
  id: string
  household_id: string
  name: string
  icon: string
  color: string
  monthly_budget: number | null
  is_fixed: boolean
  created_at: string
}

export interface Income {
  id: string
  household_id: string
  user_id: string
  label: string
  amount: number
  day_of_month: number
  is_active: boolean
  created_at: string
}

export interface FixedExpense {
  id: string
  household_id: string
  category_id: string | null
  label: string
  amount: number
  day_of_month: number
  is_active: boolean
  created_at: string
}

export interface Transaction {
  id: string
  household_id: string
  user_id: string
  category_id: string | null
  amount: number
  note: string | null
  date: string
  created_at: string
  category?: Category
  profile?: Pick<Profile, 'id' | 'full_name'>
}

export interface AccountBalance {
  id: string
  household_id: string
  balance: number
  updated_at: string
  updated_by: string | null
}

export interface MonthlySummary {
  id: string
  household_id: string
  year: number
  month: number
  opening_balance: number | null
  closing_balance: number | null
  total_income: number
  total_fixed_expenses: number
  total_dynamic_expenses: number
  actual_savings: number | null
  created_at: string
}

export interface MonthCalc {
  totalIncome: number
  totalFixed: number
  totalDynamic: number
  expectedSavings: number
  actualSavings: number
  daysRemaining: number
  projectedSavings: number
}
