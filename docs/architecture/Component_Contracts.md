# Component Contracts & UI Architecture (React 19 Standards)

This document defines the architectural rules for building, consuming, and structuring React 19 components in the EvalDesk frontend. A "Component Contract" defines how a component exposes its API (props) to the outside world. Strict contracts prevent spaghetti code, ensure reusability, and make components predictable.

*Note: EvalDesk uses React 19, Vite, Tailwind v4, Zod v4, and modern shadcn/ui. All contracts must adhere to these modern paradigms.*

## 1. Core Principles of Component Design

### 1.1 Predictability in Naming
Prop names must instantly communicate their purpose and type.
- **Event Handlers:** Must always start with `on` and describe the event, not the action.
  - *Good:* `onClick`, `onValueChange`, `onToggle`.
- **Booleans:** Must always start with `is`, `has`, `can`, or `should`.
  - *Good:* `isLoading`, `hasError`, `canEdit`.
- **Render Props / Slots:** If a prop accepts a React Node to be rendered in a specific slot, use the `Slot` suffix or standard naming.

### 1.2 HTML Standard Compliance (React 19 Types)
Every foundational UI component (Button, Input, Card) MUST extend standard HTML attributes. 

**React 19 Update:** Because `ref` is now a standard prop, you no longer need the confusing `ComponentPropsWithoutRef` or `ComponentPropsWithRef`. Simply use `ComponentProps<"tag">`.

```tsx
import type { ComponentProps } from "react";

// ❌ BAD: Restrictive contract
interface ButtonProps { label: string; onClick: () => void; disabled?: boolean; }

// ✅ GOOD: Standard HTML contract via ComponentProps
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
}
```

### 1.3 Strict Encapsulation (No "Smart" Primitives)
UI primitive components (e.g., `<Button>`, `<Dropdown>`, `<Table>`) must be **Dumb Components**. 
- They must NEVER import global state (Zustand) or call APIs directly.
- All data and actions must be passed in via props.

## 2. React 19 Component Syntax & Deprecations
React 19 deprecates several old patterns in favor of cleaner code.

### 2.1 Ref Handling (No `forwardRef`)
`forwardRef` is deprecated. `ref` is now just a regular prop passed directly into the function component.

```tsx
// ✅ GOOD: React 19 Plain Ref Prop
function Input({ className, ref, ...props }: ComponentProps<'input'>) {
  return <input ref={ref} className={clsx("base", className)} {...props} />
}
```
*Bonus React 19 Feature:* Ref callbacks can now return a cleanup function, identical to `useEffect`.

### 2.2 Clean Imports (No `import * as React`)
Do not use `import * as React from "react"`. Due to the modern JSX transform, this is unnecessary bloat.
Use named imports specifically for what you need: `import { useId, type ComponentProps } from "react";`

### 2.3 Context Providers (No `.Provider`)
You can now render Context as a provider directly.
`❌ <ThemeContext.Provider>` → `✅ <ThemeContext>`

### 2.4 Document Metadata (No `react-helmet`)
EvalDesk components MUST NOT use third-party libraries like `react-helmet` to set page titles. React 19 natively hoists `<title>`, `<meta>`, and `<link>` tags rendered anywhere in your component tree directly to the `<head>`.

### 2.5 React Compiler (Memoization)
EvalDesk relies on the React Compiler. 
- **Rule:** Do NOT manually wrap functions in `useCallback` or components in `React.memo` unless specifically required by an external un-compiled library. The compiler automatically handles granular memoization.

### 2.6 Banned Legacy Patterns (React 19 Deprecations)
The following React 18 (or older) patterns are **STRICTLY BANNED** as they are removed or heavily deprecated in React 19:
- **`defaultProps` for Function Components:** BANNED. Use ES6 default parameters instead (e.g., `function Button({ variant = "primary" })`).
- **`propTypes`:** BANNED. We use TypeScript for static typing; runtime propTypes are bloated and deprecated.
- **String Refs (`ref="myInput"`):** BANNED. Always use the `useRef` hook.
- **`findDOMNode`:** BANNED. Use refs to access DOM nodes directly.

## 3. The "Variant" Pattern (No Boolean Soups)
Never use boolean props to handle visual styling variants. 

```tsx
// ❌ BAD: Boolean Soup
<Button isPrimary isDestructive isSmall>Delete</Button>

// ✅ GOOD: The Variant Pattern using `cva`
<Button variant="destructive" size="sm">Delete</Button>
```

## 4. Forms, Actions & Zod v4 (The Modern Standard)
Forms in EvalDesk are powered by **React 19 Actions**, **React Hook Form**, and **Zod v4**.

### 4.1 Form Status Management (`useFormStatus`)
Child components (like a Submit Button) must use `useFormStatus` to automatically detect if their parent `<form action={...}>` is pending. Do not pass `isLoading` as a prop.

### 4.2 Zod v4 Schema Validation
Zod v4 introduces streamlined syntax and strict validation.
- **Shorthand Syntax:** Embrace Zod v4's modern shorthand syntax where applicable.
- **Error Mapping:** Always define custom error messages directly in the schema (or via i18n integration).

## 5. Inversion of Control & Composition
Complex components should not take a massive configuration object. They should use **Composition** (passing `children`) so the consumer controls the layout.

```tsx
// ❌ BAD: Configuration Object
<Dialog title="Delete" primaryButtonText="Yes" onPrimaryClick={handleDelete} />

// ✅ GOOD: Composition
<Dialog>
  <DialogHeader><DialogTitle>Delete</DialogTitle></DialogHeader>
  <DialogFooter><Button onClick={handleDelete}>Yes</Button></DialogFooter>
</Dialog>
```

## 6. Component Library Strategy (shadcn/ui Latest)
EvalDesk leverages the latest **shadcn/ui** CLI and registry.
- **CLI First:** Add components using `npx shadcn@latest add <component>`.
- **Ownership:** Once added, the component code lives in our codebase (`@/components/ui`). We OWN it and must refactor it to meet React 19 standards.
- **Polymorphism (`asChild` Pattern):** Use `asChild` (via Radix UI `@radix-ui/react-slot`) to avoid breaking semantic HTML when you need the styles of one component but the tag of another.

## 7. Internationalization (i18n) Contracts (CRITICAL)
EvalDesk must be multi-language ready from Day 1.
- **No Hardcoded Strings:** Every human-readable string must be routed through `t('key')`.
- **Variable Interpolation:** Never concatenate strings (`t('hello') + userName`). Use `t('greeting', { name: userName })`.
- **Zod & i18n Integration:** Use `zod-i18n-map` to globally intercept Zod errors.
- **Flexible Widths:** Never set fixed widths (`w-24`) on buttons. Use intrinsic sizing (`w-fit`) to allow the container to expand for longer translations (e.g., German/Vietnamese).

## 8. State Management Contracts

### 8.1 URL State (The Ultimate Source of Truth)
Anything that can be shared via a link MUST be stored in the URL search parameters (`?page=2`, `?tab=settings`). Do NOT store this in Zustand or `useState`.

### 8.2 Server State (React Query)
Anything that comes from an API is Server State. Use `@tanstack/react-query`. Never `useEffect` + `fetch` + `useState`.

### 8.3 Global Client State (Zustand)
Only use Zustand for state that MUST be accessed globally and doesn't belong in the URL (e.g., Auth tokens, globally Active Project ID).

### 8.4 Local State (useState)
Use `useState` exclusively for ephemeral UI state (e.g., Is a dropdown open?).

## 9. TypeScript, Vite & Tailwind v4 Ecosystem Rules

### 9.1 Strict TypeScript (No `any`)
- **Ban `any`:** Use `unknown` and validate via Zod.
- **Implicit Inference:** Let TS infer simple types. Explicitly type Component Props and hook returns.

### 9.2 Tailwind CSS v4 Paradigm
- **CSS-First Configuration:** All semantic tokens must be defined in `global.css` via `@theme`. No legacy `tailwind.config.js`.
- **Dynamic Class Merging:** NEVER concatenate Tailwind classes manually. Always use the `cn()` utility (`clsx` + `tailwind-merge`).

### 9.3 Vite & Imports
- **Absolute Imports:** Components must use path aliases (`@/components/ui/Button`).
- **Environment Variables:** All `VITE_` prefixed variables must be validated via a Zod schema at runtime startup.