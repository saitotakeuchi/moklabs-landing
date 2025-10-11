import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

/**
 * Container component for consistent max-width and padding across the app
 *
 * @param children - Content to be wrapped
 * @param className - Additional CSS classes
 * @param maxWidth - Maximum width preset (default: "xl")
 * @param padding - Whether to apply horizontal padding (default: true)
 */
const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  maxWidth = "xl",
  padding = true,
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm", // 640px
    md: "max-w-screen-md", // 768px
    lg: "max-w-screen-lg", // 1024px
    xl: "max-w-[1184px]",  // Custom Mok Labs standard
    "2xl": "max-w-screen-2xl", // 1536px
    full: "max-w-full",
  };

  const paddingClasses = padding ? "px-4 sm:px-6 lg:px-8" : "";

  return (
    <div
      className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
