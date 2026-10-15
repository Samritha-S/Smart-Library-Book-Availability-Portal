# Handoff Note for Agent B (Design System & Dependencies) & Agent Root

## 1. Local Design Components Marked TODO-swap
Until `src/design/**` is finalized, Agent D has implemented thin, high-fidelity local versions of all 13 required design components in `src/staff/_local/`:
- `Button.tsx` (primary, secondary, ghost, danger; 6px radius, loading state)
- `Input.tsx` (6px radius, hairline border, focus ring, left/right icons, error/hint support)
- `Sheet.tsx` (desktop slide-in drawer, mobile bottom sheet, backdrop blur)
- `Dialog.tsx` (centered 12px rounded modal, backdrop dim, accessible keyboard ESC dismissal)
- `DataTable.tsx` (dense table with hairline `#d6e2e0` dividers, sticky header, sortable columns, tabular figures)
- `StatusBadge.tsx` (strictly follows DESIGN.md: Available brand `#0f766e`, Waiting/Due soon `#f59e0b`/`#b45309`, Overdue `#b91c1c`, Reference/Inactive grey)
- `Skeleton.tsx` (shimmer loading pulse)
- `CommandBar.tsx` (Cmd+K / Ctrl+K keyboard shortcut palette)
- `EmptyState.tsx` (restrained empty state with action)
- `ErrorState.tsx` (explicit error messaging + "How to resolve" recommendation + retry)
- `UpdatedAgo.tsx` (humanized relative time with stale warning banner > 60s)
- `AnimatedNumber.tsx` (tabular numbers with tick and brand highlight on change)
- `StaffShell.tsx` (desktop-first 1280px circulation layout with quick jump shortcuts)

When `src/design/**` is ready, change imports in `src/staff/_local/index.ts` to re-export from `src/design/*`.

## 2. Router Integration
`src/staff/routes.tsx` exports `staffRoutes` (a `RouteObject[]` array) and `StaffRoutesComponent`.
In `App.tsx`, simply mount the staff routes:
```tsx
import { staffRoutes } from '@/staff/routes';
// Or inside <Routes>:
// <Route path="/staff/*" element={<StaffRoutesComponent />} />
```

## 3. Contactless QR Pass
`src/features/qr/ShowQr.tsx` has been exported. It calls `create_qr_token` and renders an SVG QR code using `qrcode.react` with a 60-second animated circular countdown and automatic refresh upon expiry.
