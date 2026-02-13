import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        outline: "border-input bg-background text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
      },
      size: {
        default: "h-6 min-w-6",
        sm: "h-5 min-w-5 px-1 text-[10px]",
        lg: "h-7 min-w-7 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  children: React.ReactNode
}

function Kbd({ className, variant, size, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(kbdVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </kbd>
  )
}

export { Kbd, kbdVariants }
