import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl bg-white/[0.05] px-4 py-2.5 text-base",
          "border-0 border-b-2 border-white/10",
          "ring-offset-background placeholder:text-muted-foreground/50",
          "focus:border-b-accent focus:bg-white/[0.08] focus:outline-none focus:ring-0",
          "transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
