import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl bg-muted/50 px-4 py-2.5 text-base",
          "border border-border",
          "ring-offset-background placeholder:text-muted-foreground/60",
          "focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
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
