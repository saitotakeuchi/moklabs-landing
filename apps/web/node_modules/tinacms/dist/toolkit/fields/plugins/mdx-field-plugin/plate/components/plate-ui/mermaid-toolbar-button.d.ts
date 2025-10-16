import React from 'react';
export declare const MermaidToolbarButton: React.ForwardRefExoticComponent<Omit<{
    tooltip?: React.ReactNode;
    tooltipContentProps?: Omit<React.ComponentPropsWithoutRef<React.ForwardRefExoticComponent<import("@radix-ui/react-tooltip").TooltipContentProps & React.RefAttributes<HTMLDivElement>>>, "children">;
    tooltipProps?: Omit<React.ComponentPropsWithoutRef<React.FC<import("@radix-ui/react-tooltip").TooltipProps>>, "children">;
} & Omit<{
    isDropdown?: boolean;
    pressed?: boolean;
    showArrow?: boolean;
} & Omit<Omit<Omit<Omit<import("@radix-ui/react-toolbar").ToolbarToggleItemProps & React.RefAttributes<HTMLButtonElement>, "ref"> & Omit<import("@radix-ui/react-toolbar").ToolbarToggleItemProps & React.RefAttributes<HTMLButtonElement>, "size" | "variant"> & import("class-variance-authority").VariantProps<(props?: {
    size?: "default" | "sm" | "lg";
    variant?: "default" | "outline";
} & import("class-variance-authority/types").ClassProp) => string>, "ref"> & React.RefAttributes<HTMLButtonElement>, "ref">, "value" | "asChild"> & import("class-variance-authority").VariantProps<(props?: {
    size?: "default" | "sm" | "lg";
    variant?: "default" | "outline";
} & import("class-variance-authority/types").ClassProp) => string> & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>, "ref"> & {
    clear?: string | string[];
} & React.RefAttributes<HTMLButtonElement>>;
