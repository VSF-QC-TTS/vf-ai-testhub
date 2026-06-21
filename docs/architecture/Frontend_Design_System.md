# Frontend Design System & UI/UX Guidelines

This document outlines the comprehensive design system, UI/UX guidelines, and component specifications for the EvalDesk frontend application. It serves as the single source of truth for developers to maintain visual consistency, responsive behavior, and accessibility across the entire platform.

## 1. Design Philosophy
- **Dual-Theme Support (Light & Dark):** Semantic design tokens (CSS variables) ensure seamless switching between themes.
- **High Information Density:** Spaces are utilized efficiently without feeling cluttered.
- **Fluid & Meaningful Motion:** State changes and interactions use smooth, physics-based animations to guide user attention.
- **Consistent Layouts:** Reusable layout patterns for sidebars, headers, and content areas.

## 2. Accessibility (a11y) Baseline (CRITICAL)
EvalDesk is a professional tool. It must be fully navigable and operable by all users, including those relying on keyboards or screen readers.

- **Keyboard Navigation First:** Every interactive element MUST be reachable via the `Tab` key.
- **Visible Focus States:** When an element receives keyboard focus, it must display a highly visible focus ring (`focus-visible:ring-2`).
- **Semantic HTML:** Use appropriate semantic tags (`<button>`, `<a>`).
- **ARIA Attributes:** Use `aria-label` for icon-only buttons. Use `aria-expanded`/`aria-invalid`.
- **Contrast Ratios:** Text must meet WCAG AA standards (minimum 4.5:1).

## 3. Motion & Choreography System
Motion is not decorative; it is functional. It explains changes in state, establishes spatial relationships, and provides tactile feedback.

### 3.1 Core Motion Patterns
- **Shared Axis:** Navigating between sibling views (sliding X/Y).
- **Elevation (Scale & Pop):** For overlays (Modals/Dropdowns) `scale: 0.95 -> 1`.
- **Morph (Layout):** Interpolating bounds and positions using `layoutId`.
- **Staggered List:** Cascading entrance for lists and table rows.

### 3.2 Physics over Durations (Framer Motion)
- **Spring Physics:** *Standard UI Pop:* `type: "spring", stiffness: 300, damping: 25, mass: 0.5`.

### 3.3 Timing & Easing (CSS)
- *Micro-interactions:* `150ms ease-out`.
- *Page Transitions:* `300ms ease-in-out`.

## 4. State Management Patterns (Loading, Empty, Error)
A premium UI must degrade gracefully.

### 4.1 Loading States & Skeleton Rules
- **Page/Route Loading:** Use React `<Suspense>` paired with **Skeleton components**. Never show a blank white screen. 
- **Skeleton Design Rules:**
  - **Shape Mapping:** Skeletons must mimic the exact layout of the impending data.
  - **Randomized Text Widths:** Skeleton line widths should vary (e.g., `w-full`, `w-4/5`).
  - **Motion:** Use a smooth breathing animation (`animate-pulse`). Use `--elevated` background.
  - **Avoid Skeleton Overload:** Render only enough rows to fill the immediate viewport (5-7 rows).

### 4.2 Empty States
- **Visuals:** Centered, subtle illustration or prominent faded icon.
- **Messaging & CTA:** Short headline and a primary action button.

### 4.3 Error & Fallback States
- **API/Data Fetch Errors:** Use **React Error Boundaries**. Display a localized error card with a "Retry" button instead of crashing the page.
- **Global/Critical Errors:** Use Toast Notifications or Modal Dialogs.

## 5. Color Palette & Semantic Tokens

### Backgrounds & Surfaces
- **`--background`:** Light: `zinc-50` | Dark: `zinc-950`
- **`--surface`:** Light: `white` | Dark: `zinc-900`
- **`--popover`:** Light: `white` | Dark: `zinc-900`
- **`--elevated`:** Light: `zinc-100` | Dark: `zinc-800`

### Borders, Rings & Shadows
- **`--border`:** Light: `zinc-200` | Dark: `zinc-800`
- **`--ring` (Focus):** Light: `zinc-400` | Dark: `zinc-600`
- **Border Radius:** `rounded-md` (inputs), `rounded-lg` (cards), `rounded-xl` (modals), `rounded-full` (pills).
- **Shadows:** `shadow-sm` (cards), `shadow-md` (dropdowns), `shadow-xl` (modals).

### Typography Colors
- **`--foreground`:** Light: `zinc-900` | Dark: `zinc-50`
- **`--muted-foreground`:** Light: `zinc-500` | Dark: `zinc-400`

### Brand, Actions & Status
- **`--primary`:** `blue-600`
- **`--secondary`:** `emerald-600`
- **`--destructive`:** `red-600`
- **Status:** PASSED (Emerald), FAILED (Red), UNCERTAIN (Amber), PENDING (Blue).

## 6. Spacing & Layout Architecture

### 6.1 Spacing Scale (8pt Grid System)
- **Micro (`4px`):** Between icons and text.
- **Tiny (`8px`):** Inside buttons/badges, or between a Field Label and its Input.
- **Small (`16px`):** Card padding, gaps between different Form Fields.
- **Medium (`24px`):** Column gaps.
- **Large (`32px`):** Section dividers.

### 6.2 App Shell & Navigation Placement
- **Global Sidebar (Primary Navigation):** Fixed width (`w-64`), full height (`h-screen`). 
- **Top Header (Contextual Navigation):** Fixed height (`h-14` or `h-16`). Sticky (`sticky top-0 z-10`) with a frosted glass effect (`bg-background/80 backdrop-blur-md`). Must always display **Breadcrumbs** on the left.
- **Main Content Area:** Takes remaining width (`flex-1`). Constrained to `max-w-7xl mx-auto`.

## 7. Typography & Localization Rules (CRITICAL)
EvalDesk must be built for internationalization (i18n), specifically addressing the quirks of Vietnamese diacritics and European language lengths.

- **Font Family:** Inter (UI), JetBrains Mono (Code/Logs). Must support full Latin Extended character sets.
- **Weights:** Regular (400), Medium (500), SemiBold (600).
- **Line Height & Clipping Prevention:** 
  - NEVER use `leading-none` (line-height: 1) on Vietnamese text. It will instantly clip upper/lower diacritics.
  - Default line-height must be generous (`leading-normal` or `leading-relaxed`).
- **The "German" Test (Flexible Widths):** Text length varies wildly by language (e.g., "Save" in English is "Speichern" in German, or "Lưu thay đổi" in Vietnamese). 
  - **Rule:** Never set fixed widths (e.g., `w-32`) on buttons, labels, or text containers. 
  - **Implementation:** Design components to use intrinsic sizing (`w-fit`, `flex-1`) with comfortable padding (`px-4`) so the container expands to fit the translated text naturally. Where space is strictly constrained (like Sidebar links), use `truncate` explicitly.

## 8. Iconography
Inconsistent icons instantly degrade perceived quality. 
- **Single Library:** Strictly use **Lucide React**. 
- **Stroke Width:** Maintain a consistent `strokeWidth={2}`.
- **Contextual Sizing:** `w-4 h-4` (Inline), `w-5 h-5` (Menu), `w-12 h-12` (Empty States). Align using Flexbox (`items-center`), not exact height matching.
- **Accessibility:** Icon-only buttons MUST include an `aria-label`.

## 9. Component Specifications

### 9.1 Forms & Validation Architecture (CRITICAL)
Forms dictate the core experience of EvalDesk. We enforce strict spatial and behavioral rules.

- **Floating Inputs vs. Standard Inputs:**
  - **Auth Screens (Login/Register):** Use the `<FloatingInput>` component (animated placeholder that shrinks to a top label on focus). This provides a spacious, premium, consumer-like feel.
  - **Dashboard/Data-Entry (Internal App):** NEVER use `<FloatingInput>`. Dense forms (Target Config, Assertion Builder) MUST use the standard `<Input>` with a statically positioned `<Label>` directly above it (`gap-2`). Floating labels in dense forms create visual fatigue and make scanning difficult.
- **Validation UX:** Do NOT yell early. Validate on `onBlur` or `onSubmit`. Once errored, switch to `onChange` for instant recovery.
- **Complex Forms:** Use Progressive Disclosure (Accordions, Tabs, or Steppers).

### 9.2 Data Tables & Data Density (CRITICAL)
- **Compact Density:** Table cells should use compact padding (e.g., `py-2 px-3`) and standard text (`text-sm`). 
- **Sticky Headers:** The table header (`thead`) MUST remain pinned (`sticky top-0`).
- **Hover Highlights:** Table rows must change background (`hover:bg-elevated`) on mouse hover.
- **Overflowing Text:** Extremely long strings must NOT wrap. Use CSS `truncate` and provide a Tooltip for the full text.
- **Row Actions & Touch Support:** 
  - On Desktop (mouse): Hide action buttons until hover.
  - On Mobile/Tablet (touch devices): Use `@media (pointer: coarse)` to **always display** the actions or use an Ellipsis (`...`) Dropdown Menu.

### 9.3 JSON & Code Display Rules
- **Typography:** Must strictly use a Monospace font (`JetBrains Mono`). Font size should be smaller (`text-sm` or `text-xs`) to prevent excessive wrapping.
- **Container Styling:** Code blocks must reside in a darker/lighter container (e.g., `bg-zinc-950` within a `bg-zinc-900` card) with `rounded-md` corners and a subtle border.
- **Syntax Highlighting:** Raw JSON or Code must be syntax-highlighted.
- **Essential Utilities:** Every code block MUST have a "Copy to Clipboard" button firmly anchored at the top-right. Large JSON blobs (> 10 lines) MUST support Expand/Collapse.

### 9.4 Data Display & Feedback
- **Buttons:** `<motion.button whileTap={{ scale: 0.95 }} />`. Minimum width should allow for the "German" test expansion.
- **Dialogs:** Elevation Pattern. Backdrop uses `bg-black/50 backdrop-blur-sm`.
- **Toasts:** Slide in (`x: 100` -> `0`).

## 10. Responsive Layout Behaviors (CRITICAL)
- **Global App Shell:**
  - **Desktop (>1024px):** Sidebar is fully expanded (`w-64`) and pinned.
  - **Tablet (768px - 1023px):** Sidebar auto-collapses to an icon-only state (`w-16`).
  - **Mobile (< 768px):** Sidebar is hidden. A Hamburger Menu opens a sliding Drawer.
- **Complex Components on Mobile:**
  - **Data Tables:** Wrap the table in a container with `overflow-x-auto`. Ensure the first column (e.g., Name/ID) is sticky `sticky left-0 bg-surface`.
  - **Tabs:** The tab container must be scrollable horizontally (`overflow-x-auto scrollbar-hide`) with edge fading.
  - **Dialogs/Modals:** On mobile screens, Modals should convert from a centered floating box into a Bottom Sheet (Drawer) that slides up from the bottom of the screen.

## 11. Implementation Strategy
1. Configure Tailwind CSS v4 variables (`:root` and `.dark`).
2. Install `framer-motion`, `clsx`, `tailwind-merge`.
3. Implement `React.lazy()` with `<Suspense>` Skeletons.
4. Adopt a form library like `React Hook Form` paired with `zod`.
5. Use a robust headless table library (e.g., `@tanstack/react-table`).
6. Establish a set of accessible base components using Radix UI primitives to enforce the a11y baseline automatically.