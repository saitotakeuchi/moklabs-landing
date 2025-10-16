import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bgColor?: "white" | "blue" | "green" | "transparent";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
}

/**
 * Section component for consistent vertical spacing and background colors
 *
 * @param children - Content to be wrapped
 * @param className - Additional CSS classes
 * @param id - Section ID for anchor links
 * @param bgColor - Background color preset (default: "transparent")
 * @param spacing - Vertical padding preset (default: "lg")
 */
const Section: React.FC<SectionProps> = ({
  children,
  className = "",
  id,
  bgColor = "transparent",
  spacing = "lg",
}) => {
  const bgColorClasses = {
    white: "bg-white",
    blue: "bg-mok-blue",
    green: "bg-mok-green",
    transparent: "bg-transparent",
  };

  const spacingClasses = {
    none: "",
    sm: "py-6 sm:py-8",
    md: "py-8 sm:py-12",
    lg: "py-12 sm:py-16 md:py-24",
    xl: "py-16 sm:py-24 md:py-32",
  };

  return (
    <section
      id={id}
      className={`${bgColorClasses[bgColor]} ${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </section>
  );
};

export default Section;
