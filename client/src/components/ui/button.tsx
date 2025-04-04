import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style = {}, ...props }, ref) => {
    // Define inline styles to ensure colors are applied correctly
    const customStyles: React.CSSProperties = {...style};
    
    // Apply explicit styles based on variant
    if (variant === 'primary') {
      customStyles.backgroundColor = '#3b82f6'; // blue-600
      customStyles.color = 'white';
    } else if (variant === 'destructive') {
      customStyles.backgroundColor = '#ef4444'; // red-500
      customStyles.color = 'white';
    } else if (variant === 'outline') {
      customStyles.border = '1px solid #e5e7eb';
      customStyles.backgroundColor = 'transparent';
    }
    
    const Comp = asChild ? "div" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={customStyles}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }