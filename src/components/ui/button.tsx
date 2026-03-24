import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
        ghost: 'hover:bg-slate-100 text-slate-900 dark:hover:bg-slate-800 dark:text-slate-100',
        destructive: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
