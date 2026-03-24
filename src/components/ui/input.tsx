import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="form-label mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'form-input w-full',
            icon && 'pl-10',
            error && 'input-error border-danger-500 focus:border-danger-500 focus:ring-danger-500',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="form-error mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
