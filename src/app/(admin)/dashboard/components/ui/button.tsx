import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#030308] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#C9A227] to-[#a68520] text-[#030308] font-semibold shadow-[0_0_20px_rgba(201,162,39,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-[#ddb52e] hover:to-[#C9A227] active:scale-[0.97] border border-[#C9A227]/30",
        destructive:
          "bg-gradient-to-r from-[#8B0000] to-[#6d0000] text-[#E8E8F0] font-semibold shadow-[0_0_20px_rgba(139,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(139,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#a20000] hover:to-[#8B0000] active:scale-[0.97] border border-[#8B0000]/30",
        outline:
          "border border-[#C9A227]/20 bg-[#0a0a12]/60 text-[#E8E8F0]/80 shadow-[inset_0_1px_0_rgba(201,162,39,0.05)] hover:bg-[#C9A227]/10 hover:border-[#C9A227]/40 hover:text-[#E8E8F0] hover:shadow-[0_0_15px_rgba(201,162,39,0.1),inset_0_1px_0_rgba(201,162,39,0.08)] active:scale-[0.97]",
        secondary:
          "bg-[#0D9B8A]/15 text-[#0D9B8A] font-semibold border border-[#0D9B8A]/25 shadow-[inset_0_1px_0_rgba(13,155,138,0.08)] hover:bg-[#0D9B8A]/25 hover:border-[#0D9B8A]/40 hover:shadow-[0_0_20px_rgba(13,155,138,0.15)] active:scale-[0.97]",
        ghost:
          "text-[#E8E8F0]/50 hover:bg-[#E8E8F0]/5 hover:text-[#E8E8F0]/80 active:scale-[0.97]",
        link: "text-[#C9A227] underline-offset-4 hover:underline hover:text-[#ddb52e]",
        approve:
          "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.97] border border-emerald-500/30",
        reject:
          "bg-transparent text-[#ff4444] font-semibold border border-[#8B0000]/40 hover:bg-[#8B0000]/15 hover:border-[#8B0000]/60 hover:shadow-[0_0_15px_rgba(139,0,0,0.15)] active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3.5 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
