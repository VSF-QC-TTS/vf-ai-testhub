import { createBrowserRouter, RouterProvider, Outlet, useRouteError } from "react-router-dom";
import { lazy } from "react";
import { AppShell } from "./components/layout/AppShell";
import { PageTransition } from "./components/layout/PageTransition";

// Lazy-loaded placeholder pages
const Home = lazy(() => Promise.resolve({ 
  default: () => (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to EvalDesk. Select a project to get started.</p>
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
  const error = useRouteError();
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
      <p className="text-muted-foreground">Sorry, an unexpected error has occurred.</p>
    </div>
  );
}

const router = createBrowserRouter([
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
      { index: true, element: <Home /> },
      { path: "projects", element: <PlaceholderPage /> },
      { path: "targets", element: <PlaceholderPage /> },
      { path: "datasets", element: <PlaceholderPage /> },
      { path: "test-cases", element: <PlaceholderPage /> },
      { path: "runs", element: <PlaceholderPage /> },
      { path: "reports", element: <PlaceholderPage /> },
      { path: "settings", element: <PlaceholderPage /> },
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
