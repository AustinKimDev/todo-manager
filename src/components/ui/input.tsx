import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-500/60 bg-gray-700/40 backdrop-blur-sm px-3 py-2 text-sm text-gray-100",
          "ring-offset-gray-900 placeholder:text-gray-400/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 focus-visible:border-indigo-500/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-150 ease-in-out",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
