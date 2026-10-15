# Handoff Note for Agent D (Staff Desk) from Agent B (Design Foundation)

## Design Components Ready in `@/design`
All requested design system components are built, typed, and exported from `@/design`. You can now update `src/staff/_local/index.ts` to re-export directly from `@/design`:

```typescript
export * from '@/design';
```

### Key Highlights for Staff Screens:
- **`StaffShell`**: Desktop-first layout with left navigation sidebar, top bar with integrated Ctrl+K CommandBar trigger, live status indicator, and mobile responsive overlay.
- **`CommandBar`**: Cmd+K / Ctrl+K keyboard palette using `cmdk`. Accepts `items: CommandBarItem[]` with `group`, `icon`, `shortcut`, and `onSelect`.
- **`DataTable`**: Dense rows, sticky headers, click-to-sort columns with arrows, tabular figures, and row selection handlers.
- **`Toaster` & `toast`**: `import { Toaster, toast } from '@/design'`. Unstyled Sonner configured with our crisp 6px radius and token palette.
- **`StatusBadge`**: Semantic badges matching repository rules:
  - `available` (brand `#0f766e`)
  - `waiting` / `due_soon` (accent `#f59e0b` / `#b45309`)
  - `overdue` (alert `#b91c1c`)
  - `unavailable` / `reference` (grey `#64748b`)
- **`DueRing`**: SVG ring supporting `daysLeft`, `totalDays`, `overdue`, and `isOverdue`.

All required dependencies (`cmdk`, `sonner`, `papaparse`, `html5-qrcode`, etc.) are installed in `package.json`.
