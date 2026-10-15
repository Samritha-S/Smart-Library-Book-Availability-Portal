// TODO-swap with src/design/Toaster once Agent B merges
import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export const Toaster: React.FC = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          '!bg-paper !text-ink !border !border-rule !rounded-[6px] !shadow-dialog !font-sans !text-xs',
        style: {
          backgroundColor: '#f7faf9',
          color: '#042f2e',
          borderColor: '#d6e2e0',
        },
      }}
    />
  );
};

export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) =>
    sonnerToast.success(message, {
      ...options,
      className: '!border-brand/40 !bg-[#f0fdfa] !text-ink',
    }),
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) =>
    sonnerToast.error(message, {
      ...options,
      className: '!border-alert/40 !bg-[#fef2f2] !text-ink',
    }),
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) =>
    sonnerToast(message, options),
  custom: sonnerToast,
  dismiss: sonnerToast.dismiss,
};
