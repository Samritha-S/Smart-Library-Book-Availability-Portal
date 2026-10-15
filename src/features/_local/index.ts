// Centralized export for design components
// Re-exports components from src/design/ when available, or from local thin wrappers

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from '@/design/Button';
export { StatusBadge, type StatusBadgeProps, type BadgeStatus } from '@/design/StatusBadge';
export { Sheet, type SheetProps } from '@/design/Sheet';
export { Dialog, type DialogProps } from '@/design/Dialog';
export { Skeleton, type SkeletonProps } from '@/design/Skeleton';
export { EmptyState, type EmptyStateProps } from '@/design/EmptyState';
export { Toaster, toast, type ToasterProps } from '@/design/Toaster';

export { ErrorState, type ErrorStateProps } from './ErrorState';
export { AnimatedNumber, type AnimatedNumberProps } from './AnimatedNumber';
export { DueRing, type DueRingProps } from './DueRing';
