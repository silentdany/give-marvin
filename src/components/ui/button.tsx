import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-normal tracking-wide transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-bright/30 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-bg-elevated text-fg-bright shadow-[0_0_0_1px_var(--color-fg-bright)] hover:bg-fg-bright hover:text-bg-elevated",
        ghost: "text-fg-dim hover:text-fg-bright rounded-none px-0",
      },
      size: {
        default: "min-h-12 px-5 py-3 text-sm rounded-md",
        lg: "min-h-14 px-6 py-4 text-base rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
