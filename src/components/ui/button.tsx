import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-surface-elevated text-foreground hover:bg-surface-border border border-surface-border",
      primary: "bg-primary hover:bg-primary-hover text-surface-muted font-bold shadow-lg shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-surface-border bg-transparent hover:bg-surface-elevated text-foreground",
      ghost: "hover:bg-surface-elevated text-muted-foreground hover:text-foreground",
      gold: "bg-gradient-to-r from-primary to-primary-dark text-surface-muted font-bold hover:opacity-90 shadow-lg shadow-primary/25",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-8 rounded-md px-3 text-[11px]",
      lg: "h-11 rounded-lg px-8 text-sm",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-btn font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
