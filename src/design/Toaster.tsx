import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

export type { ToasterProps } from 'sonner';
export { toast };

export const Toaster: React.FC<React.ComponentProps<typeof SonnerToaster>> = (props) => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'w-full max-w-sm rounded-[6px] border border-rule bg-white p-3.5 shadow-sm flex items-start gap-3 font-sans text-xs text-ink select-none',
          title: 'font-semibold text-ink text-xs leading-snug',
          description: 'text-grey text-[11px] mt-0.5 leading-normal',
          actionButton:
            'h-7 px-2.5 rounded-[6px] bg-brand text-white font-medium text-xs hover:bg-[#0c625c] transition-colors',
          cancelButton:
            'h-7 px-2.5 rounded-[6px] bg-paper text-ink border border-rule font-medium text-xs hover:bg-[#e8eeed] transition-colors',
          success: 'border-brand/40 text-brand',
          error: 'border-alert/40 text-alert',
          warning: 'border-accent/40 text-accentink',
          info: 'border-rule text-ink',
        },
      }}
      {...props}
    />
  );
};
