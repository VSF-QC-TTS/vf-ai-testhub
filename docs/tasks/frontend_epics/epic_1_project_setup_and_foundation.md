# Epic 1: Project Setup & Foundation (Design System)

**Goal:** Initialize the React application, configure Vite, Tailwind v4, routing, and establish the App Shell based on `Frontend_Design_System.md` and `Component_Contracts.md`.

## Tasks

### TASK 1.1: Project Initialization
- [ ] Initialize Vite project with React + TypeScript.
- [ ] Configure `tsconfig.json` for absolute paths (`@/*`).
- [ ] Set up ESLint and Prettier for code consistency.

### TASK 1.2: Styling Engine (Tailwind v4)
- [ ] Install Tailwind CSS v4 and its Vite plugin.
- [ ] Configure `global.css` with semantic CSS variables (`--background`, `--primary`, etc.) for Light and Dark modes.
- [ ] Set up the standard spacing and typography scale.

### TASK 1.3: Component Registry & Primitives
- [ ] Initialize `shadcn/ui` CLI.
- [ ] Add core base components (Button, Input, Card, DropdownMenu).
- [ ] Ensure all installed components adhere to `Component_Contracts.md` (e.g., proper Ref forwarding, Variant patterns).

### TASK 1.4: Routing & App Shell
- [ ] Install React Router.
- [ ] Build the `AppShell` component (Sticky Top Header with Breadcrumbs, Fixed Sidebar).
- [ ] Implement responsive behaviors (Mobile Drawer, Tablet Icon-only sidebar).
- [ ] Implement generic `<Suspense>` Skeletons for route transitions.

## Notes
- Do not build complex features until the base AppShell and routing work flawlessly on both Desktop and Mobile.