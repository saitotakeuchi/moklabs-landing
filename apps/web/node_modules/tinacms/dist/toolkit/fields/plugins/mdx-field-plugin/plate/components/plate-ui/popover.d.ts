import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { type VariantProps } from 'class-variance-authority';
export declare const Popover: React.FC<PopoverPrimitive.PopoverProps>;
export declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export declare const PopoverAnchor: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>>;
export declare const popoverVariants: (props?: {
    animate?: boolean;
} & import("class-variance-authority/types").ClassProp) => string;
export declare const PopoverContent: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & VariantProps<(props?: {
    animate?: boolean;
} & import("class-variance-authority/types").ClassProp) => string> & React.RefAttributes<HTMLDivElement>>;
