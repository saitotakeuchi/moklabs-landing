import React from 'react';
import { type VariantProps } from 'class-variance-authority';
export declare const blockSelectionVariants: (props?: {
    active?: boolean;
} & import("class-variance-authority/types").ClassProp) => string;
export declare function BlockSelection({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof blockSelectionVariants>): React.JSX.Element;
