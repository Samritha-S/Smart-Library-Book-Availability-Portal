# Handoff Note for Agent C (Student / Features) from Agent B (Design Foundation)

## Design Components Ready in `@/design`
All requested design system components are built, typed, and exported from `@/design`:

1. **`Button`**: `variant` ('primary' | 'secondary' | 'ghost' | 'danger'), `size` ('sm' | 'md' | 'lg'), `loading`, `disabled`, `leftIcon`, `rightIcon`.
2. **`Input`**: 6px radius, `label`, `helperText`, `error`, `leftIcon`, `rightIcon`.
3. **`Select`**: 6px radius, `label`, `helperText`, `error`, `options`.
4. **`StatusBadge`**: `status` ('available' | 'waiting' | 'due_soon' | 'overdue' | 'unavailable' | 'reference'), `label`, `dot`, `size`.
5. **`Skeleton`**: `radius` ('control' | 'sheet' | 'full'), `width`, `height`.
6. **`Sheet`**: Bottom sheet on `< 768px`, right panel on `≥ 768px`. Supports both `isOpen`/`onClose` and `open`/`onOpenChange`.
7. **`Dialog`**: Centered 12px radius modal overlay, Esc to close, backdrop dim.
8. **`Toaster` & `toast`**: Preconfigured Sonner toaster with design tokens.
9. **`DataTable`**: Dense, sticky header, sortable columns, tabular numbers.
10. **`CommandBar`**: Global Ctrl+K / Cmd+K search palette using `cmdk`.
11. **`EmptyState`**: Restrained editorial empty state with optional action.
12. **`ErrorState`**: Alert error card supporting `title`, `message` / `description`, and `onRetry` with `retryLabel` / `retryText`.
13. **`UpdatedAgo`**: Humanized relative time badge (e.g. "Updated 12s ago") with stale banner when older than threshold.
14. **`AnimatedNumber`**: Tabular figure counter that ticks and flashes brand highlight on change; respects `prefers-reduced-motion`.
15. **`DueRing`**: Circular SVG due date stamp; supports `daysLeft`, `totalDays`, `overdue`, and `isOverdue`; animates once on mount.
16. **`StudentShell`**: Unwired student layout with mobile bottom tab bar (< 768px) and desktop slim rail + top bar (≥ 768px), max-width 1120px.
17. **`Preview`**: Interactive catalog showing every component at 360px and 1280px viewports.

## Dependencies Available
All variable fonts and utility packages are installed:
- `@fontsource-variable/newsreader`
- `@fontsource-variable/geist`
- `lucide-react`
- `cmdk`
- `sonner`
- `qrcode.react`
- `html5-qrcode`
- `papaparse` & `@types/papaparse`
