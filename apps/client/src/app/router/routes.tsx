import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { PageTransition } from "../../components/layout/PageTransition";
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute";
import { AuthLayout } from "../layouts/AuthLayout";
import { AuthBootstrap } from "../providers/AuthBootstrap";
import { FirstRunProjectGate } from "./FirstRunProjectGate";

// Auth Pages
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "../../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage";

// Project Pages
import { ProjectListPage } from "../../features/projects/pages/ProjectListPage";

// Lazy-loaded placeholder pages
const Home = lazy(() => Promise.resolve({ 
  default: () => (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to VinFast AI TestHub. Select a project to get started.</p>
    </div>
  )
}));

const PlaceholderPage = lazy(() => Promise.resolve({
  default: () => (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Feature Coming Soon</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  )
}));

function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
      <p className="text-muted-foreground">Sorry, an unexpected error has occurred.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthBootstrap>
        <Outlet />
      </AuthBootstrap>
    ),
    children: [
      // Auth routes (Guest only)
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "login", element: <LoginPage /> },
              { path: "register", element: <RegisterPage /> },
              { path: "forgot-password", element: <ForgotPasswordPage /> },
              { path: "reset-password", element: <ResetPasswordPage /> },
            ]
          }
        ]
      },
      // Verify email route (can be accessed by anyone, guest or authenticated)
      {
        element: <AuthLayout />,
        children: [
          { path: "verify-email", element: <VerifyEmailPage /> },
        ]
      },
      // App routes (Protected)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: (
              <AppShell>
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </AppShell>
            ),
            errorElement: (
              <AppShell>
                <ErrorBoundary />
              </AppShell>
            ),
            children: [
              // Dashboard endpoint that backend redirects to after OAuth
              { path: "dashboard", element: <Navigate to="/" replace /> },
              
              // Project Gate for inner pages
              {
                element: <FirstRunProjectGate />,
                children: [
                  { index: true, element: <Suspense fallback={null}><Home /></Suspense> },
                  { path: "targets", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                  { path: "datasets", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                  { path: "test-cases", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                  { path: "runs", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                  { path: "reports", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                  { path: "settings", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                ]
              },
              
              // Project management pages (not guarded by project selection)
              { path: "projects", element: <ProjectListPage /> },
              
              {
                path: "*",
                element: (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-muted-foreground">Page not found</p>
                  </div>
                ),
              },
            ],
          },
        ]
      }
    ]
  }
]);
