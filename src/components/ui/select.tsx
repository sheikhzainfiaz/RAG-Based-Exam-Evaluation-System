import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative group">
                <select
                    className={cn(
                        "flex h-10 w-full appearance-none rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/20 transition-colors pr-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-white transition-colors">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
        )
    }
)
Select.displayName = "Select"
