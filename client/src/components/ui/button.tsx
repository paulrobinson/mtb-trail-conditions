import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white rounded-md hover:opacity-90 active:opacity-75',
        ghost:   'bg-surface-offset text-text-muted rounded-md hover:bg-divider hover:text-text',
        icon:    'w-9 h-9 bg-surface-offset text-text-muted rounded-md hover:bg-divider hover:text-text',
        date:    'flex-col items-center gap-0.5 border border-transparent bg-transparent text-text-muted rounded-md hover:bg-surface-offset',
        'date-active': 'flex-col items-center gap-0.5 border border-primary bg-primary-highlight text-primary rounded-md',
      },
      size: {
        sm:   'px-3 py-1.5 text-[var(--text-sm)]',
        md:   'px-4 py-2   text-[var(--text-sm)]',
        icon: '',
        date: 'px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
