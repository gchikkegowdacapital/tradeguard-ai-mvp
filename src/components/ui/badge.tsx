import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
        success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200',
        warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-200',
        danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
