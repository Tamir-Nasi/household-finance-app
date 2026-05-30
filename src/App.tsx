import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthInit } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'

import { LoginPage }          from '@/pages/auth/LoginPage'
import { RegisterPage }       from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { OnboardingPage }     from '@/pages/onboarding/OnboardingPage'
import { QuickExpensePage }   from '@/pages/home/QuickExpensePage'
import { DashboardPage }      from '@/pages/dashboard/DashboardPage'
import { TransactionsPage }   from '@/pages/transactions/TransactionsPage'
import { SettingsPage }       from '@/pages/settings/SettingsPage'
import { IncomePage }         from '@/pages/settings/IncomePage'
import { FixedExpensesPage }  from '@/pages/settings/FixedExpensesPage'
import { CategoriesPage }     from '@/pages/settings/CategoriesPage'
import { HouseholdPage }      from '@/pages/settings/HouseholdPage'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })

function AuthGate() {
  useAuthInit()
  const { user, profile, loading } = useAuthStore()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={!user ? <LoginPage />          : <Navigate to="/" replace />} />
      <Route path="/register"        element={!user ? <RegisterPage />        : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        !user ? <Navigate to="/login" replace /> : <OnboardingPage />
      } />

      {/* Protected */}
      <Route element={
        !user ? <Navigate to="/login" replace />
              : !profile?.household_id ? <Navigate to="/onboarding" replace />
              : <AppShell />
      }>
        <Route index                       element={<QuickExpensePage />}  />
        <Route path="dashboard"            element={<DashboardPage />}     />
        <Route path="transactions"         element={<TransactionsPage />}  />
        <Route path="settings"             element={<SettingsPage />}      />
        <Route path="settings/income"      element={<IncomePage />}        />
        <Route path="settings/fixed"       element={<FixedExpensesPage />} />
        <Route path="settings/categories"  element={<CategoriesPage />}   />
        <Route path="settings/household"   element={<HouseholdPage />}    />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
