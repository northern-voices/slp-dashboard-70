import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, onWheel, ...props }, ref) => {
    const handleWheel =
      type === 'number'
        ? (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur()
            onWheel?.(e)
          }
        : onWheel

    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 transition-all duration-200',
          className
        )}
        ref={ref}
        onWheel={handleWheel}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
