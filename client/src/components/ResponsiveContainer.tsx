import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile"; // Assuming useMobile hook is defined elsewhere

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "lg"
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full"
  };

  const isMobile = useMobile();

  return (
    <div className={cn(
      "mx-auto transition-all duration-300",
      isMobile ? "px-2 py-2" : "px-4 sm:px-6 lg:px-8 py-4",
      maxWidthClasses[maxWidth],
      "w-full overflow-x-hidden",
      className
    )}>
      <div className={cn(
        "w-full",
        isMobile && "touch-pan-y"
      )}>
        {children}
      </div>
    </div>
  );
}