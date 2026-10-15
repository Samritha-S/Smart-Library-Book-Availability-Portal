# Smart Library Design System (DESIGN.md)

This document specifies the design tokens, typography, component standards, and UX patterns for the Smart Library Book Availability Portal. All agents and screens must adhere strictly to these rules.

---

## 1. Color Palette & Semantics

The system uses a tightly controlled, high-contrast, editorial palette with strict semantic mapping.

| Token | Hex | Role & Usage |
|---|---|---|
| `ink` | `#042f2e` | Primary typography, headers, dark icons, solid borders |
| `brand` | `#0f766e` | Primary interactive elements, active links, **Available** status |
| `accent` | `#f59e0b` | Warnings, **Waiting** or **Due soon** status |
| `accentink` | `#b45309` | High-contrast dark amber text on amber badges or backgrounds |
| `alert` | `#b91c1c` | Destructive actions, error states, **Overdue only** status |
| `paper` | `#f7faf9` | Global canvas/page background, clean matte warm white |
| `rule` | `#d6e2e0` | Subtle hairline borders, divider rules, table rows |

> **Prohibited:** No purple anywhere in the system. No extraneous vibrant decorative hues.

### Status Meaning (Enforced Repository-Wide)
- **`brand` (`#0f766e`)**: Available / ready for pickup / active verified state.
- **`accent` (`#f59e0b` / text `#b45309`)**: Waiting / reserved in queue / due soon (e.g. ≤ 3 days).
- **`alert` (`#b91c1c`)**: Overdue only / critical error / destructive confirmations.
- **`grey` (`#64748b` / border `#d6e2e0`)**: Unavailable / checked out / inactive / reference only.

---

## 2. Typography

We pair an editorial serif with a precise, modern sans-serif:

1. **Headings & Book Titles**: `Newsreader` (variable font, serif).
   - Used for book titles, catalog display titles, screen `h1`/`h2` headings.
   - Font family: `Newsreader, ui-serif, Georgia, serif`.
2. **Body, Controls & Interface Text**: `Geist` (variable font, sans-serif).
   - Used for body copy, buttons, inputs, table cells, metadata, navigation.
   - Font family: `Geist, ui-sans-serif, system-ui, sans-serif`.
3. **Numbers, Counts, Dates & Fines**: Tabular figures enabled (`tabular-nums` / font-variant-numeric: tabular-nums).
   - Required for countdowns, ISBNs, due dates, shelf locations, and currency/fines.
4. **Casing Rule**: **Sentence case everywhere**.
   - No ALL-CAPS buttons, no all-caps tabs, no all-caps eyebrow headers.
   - Example: *"Request book"*, not *"REQUEST BOOK"*. *"Shelf location"*, not *"SHELF LOCATION"*.

---

## 3. Radii & Elevation

Strict border-radius rules enforce clean structural alignment:
- **Controls (`6px`)**: Buttons, text inputs, selects, badges, search bars, tag chips.
- **Overlays & Cards (`12px`)**: Sheets, dialog modals, dropdown menus, major cards.
- **Full (`9999px`)**: User avatars and the SVG circular `DueRing`.
- **Shadows**: Almost no shadows. Use crisp 1px borders (`border border-rule`) instead of muddy drop shadows. Subdued elevation (`0 1px 2px 0 rgba(4, 47, 46, 0.05)`) permitted only on floating dialogs and sheets.
- **Surfaces**: No gradients, no frosted glassmorphism, no emoji icons, no decorative blobs.

---

## 4. Iconography

- **Library**: `lucide-react` exclusively.
- **Stroke Weight**: Uniform `1.75px` or `2px` throughout the application.
- **Sizing**: Standardized to `16px` (controls/badges), `20px` (navigation/actions), or `24px` (prominent headers).

---

## 5. Motion & Accessibility

- **Motion Principles**: Animations are reserved exclusively for action feedback, state transitions, or content change.
- **Reduced Motion**: All animations must respect `@media (prefers-reduced-motion: reduce)` via Tailwind `motion-reduce:transition-none` / `motion-reduce:animate-none`.
- **Keyboard & Focus**: All interactive controls must display a high-contrast focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1`.
- **Contrast**: Every text element meets WCAG AA contrast (minimum 4.5:1 ratio against background).
- **Responsive Guarantee**: Clean fluid scaling with **zero horizontal scroll** between `360px` and `1440px`.

---

## 6. Component Catalog (`src/design/`)

1. **Button**: `primary`, `secondary`, `ghost`, `danger`. Includes disabled & accessible spinner loading state.
2. **Input & Select**: Styled with `6px` radius, clear focus ring, label & error messaging support.
3. **StatusBadge**: Semantic badges for `available` (brand), `waiting` / `due_soon` (accent), `overdue` (alert), and `unavailable` / `reference` (grey).
4. **Skeleton**: Calm shimmer placeholder for asynchronous loading.
5. **Sheet**: Bottom sheet on screens `< 768px`, slide-in right drawer on screens `≥ 768px`.
6. **Dialog**: Centered accessible modal overlay with `12px` radius and backdrop dim.
7. **Toaster**: Preconfigured `sonner` toaster with exact design tokens.
8. **DataTable**: Dense, sticky header, sortable columns, tabular numbers for numeric data.
9. **CommandBar**: Keyboard-first global search palette (`cmdk`, Ctrl+K / Cmd+K).
10. **EmptyState & ErrorState**: Restrained, helpful empty/error views with retry actions.
11. **UpdatedAgo**: Displays humanized relative time (e.g., *"Updated 12s ago"*) with automatic warning banner if data is stale (> 60s).
12. **AnimatedNumber**: Tabular numerical display that ticks and briefly flashes with subtle brand highlight upon value change.
13. **DueRing**: SVG circular progress stamp with `daysLeft`, `totalDays`, and `overdue` status; animates stroke once on initial mount.
14. **StudentShell & StaffShell**: Unwired layout shells optimized for mobile tab bar / desktop rails and staff command bar workflows.
