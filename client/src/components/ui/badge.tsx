import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full font-bold whitespace-nowrap text-[var(--text-sm)]',
  {
    variants: {
      variant: {
        good:  'bg-good-bg  text-good  px-4 py-1.5',
        tacky: 'bg-tacky-bg text-tacky px-4 py-1.5',
        boggy: 'bg-boggy-bg text-boggy px-4 py-1.5',
        avoid: 'bg-avoid-bg text-avoid px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'good',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
