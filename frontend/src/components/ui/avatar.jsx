import React from "react";
import { cn } from "../../lib/utils";

function Avatar({ className, children, size = "md", ...props }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-primary-500 text-white font-bold items-center justify-center",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt, className, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square w-full h-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "flex w-full h-full items-center justify-center text-sm font-bold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
