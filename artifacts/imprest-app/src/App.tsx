import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from '@/components/auth-gate';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { ApprovalsPage } from '@/pages/approvals-page';
import { BudgetsPage } from '@/pages/budgets-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { ExpenseNewPage } from '@/pages/expense-new-page';
import { ExpensesPage } from '@/pages/expenses-page';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/expenses/new" component={ExpenseNewPage} />
        <Route path="/expenses" component={ExpensesPage} />
        <Route path="/approvals" component={ApprovalsPage} />
        <Route path="/budgets" component={BudgetsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthGate>
          <Router />
        </AuthGate>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
