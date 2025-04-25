import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils"; // Assuming you have a cn utility

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "bg-indigo-600/50 text-white backdrop-blur-md border border-indigo-500/30 shadow-lg shadow-indigo-500/10",
          "hover:bg-indigo-600/70 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20 hover:brightness-110",
        ].join(" "),
        destructive: [
          "bg-red-700/60 text-destructive-foreground backdrop-blur-sm border border-red-600/40 shadow-md shadow-red-500/10",
          "hover:bg-red-700/80 hover:border-red-600/60 hover:shadow-lg hover:shadow-red-500/15 hover:brightness-110",
        ].join(" "),
        outline: [
          "border border-white/30 bg-white/10 backdrop-blur-sm text-white/80",
          "hover:bg-white/20 hover:border-white/50 hover:text-white",
        ].join(" "),
        secondary: [
          "bg-gray-600/40 text-gray-100 backdrop-blur-sm border border-gray-500/30 shadow-md shadow-black/10",
          "hover:bg-gray-600/60 hover:border-gray-500/50 hover:shadow-lg hover:shadow-black/15 hover:brightness-105",
        ].join(" "),
        ghost:
          "text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm",
        link: "text-indigo-400 underline-offset-4 hover:text-indigo-300 hover:underline hover:brightness-110",
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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
