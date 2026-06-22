import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { PageTransition } from "../../components/layout/PageTransition";
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute";
import { AuthLayout } from "../layouts/AuthLayout";
import { AuthBootstrap } from "../providers/AuthBootstrap";
import { FirstRunProjectGate } from "./FirstRunProjectGate";
import { ErrorBoundary, PlaceholderPage } from "./RouteFallbacks";

// Auth Pages
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "../../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage";

// Project Pages
import { ProjectListPage } from "../../features/projects/pages/ProjectListPage";
import { ProjectCreatePage } from "../../features/projects/pages/ProjectCreatePage";
import { ProjectOverviewPage } from "../../features/projects/pages/ProjectOverviewPage";

// Target Pages
import { TargetListPage } from "../../features/targets/pages/TargetListPage";
import { TargetConfigurationWorkbench } from "../../features/targets/pages/TargetConfigurationWorkbench";

// Dataset Pages
import { DatasetListPage } from "../../features/datasets/pages/DatasetListPage";

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
                  { index: true, element: null },
                  {
                    path: "projects/:projectId",
                    children: [
                      { index: true, element: <ProjectOverviewPage /> },
                      { path: "targets", element: <TargetListPage /> },
                      { path: "targets/new", element: <TargetConfigurationWorkbench /> },
                      { path: "targets/:targetId", element: <TargetConfigurationWorkbench /> },
                      { path: "datasets", element: <DatasetListPage /> },
                      { path: "test-cases", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                      { path: "runs", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                      { path: "reports", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                      { path: "settings", element: <Suspense fallback={null}><PlaceholderPage /></Suspense> },
                    ],
                  },
                ]
              },
              
              // Project management pages (not guarded by project selection)
              { path: "projects", element: <ProjectListPage /> },
              { path: "projects/new", element: <ProjectCreatePage /> },
              
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
