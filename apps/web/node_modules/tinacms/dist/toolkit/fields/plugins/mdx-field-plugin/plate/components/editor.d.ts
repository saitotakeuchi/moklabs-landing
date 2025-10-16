import * as React from 'react';
import type { PlateContentProps } from '@udecode/plate/react';
import type { VariantProps } from 'class-variance-authority';
declare const editorContainerVariants: (props?: {
    variant?: "default" | "select" | "comment" | "demo";
} & import("class-variance-authority/types").ClassProp) => string;
export declare const EditorContainer: {
    ({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof editorContainerVariants>): React.JSX.Element;
    displayName: string;
};
declare const editorVariants: (props?: {
    disabled?: boolean;
    focused?: boolean;
    variant?: "default" | "select" | "none" | "comment" | "demo" | "ai" | "aiChat" | "fullWidth";
} & import("class-variance-authority/types").ClassProp) => string;
export type EditorProps = PlateContentProps & VariantProps<typeof editorVariants>;
export declare const Editor: React.ForwardRefExoticComponent<Omit<import("@udecode/plate").EditableProps, "decorate"> & {
    autoFocusOnEditable?: boolean;
    decorate?: import("@udecode/plate/react").PlateStoreState["decorate"];
    disabled?: boolean;
    renderEditable?: (editable: React.ReactElement<any>) => React.ReactNode;
} & VariantProps<(props?: {
    disabled?: boolean;
    focused?: boolean;
    variant?: "default" | "select" | "none" | "comment" | "demo" | "ai" | "aiChat" | "fullWidth";
} & import("class-variance-authority/types").ClassProp) => string> & React.RefAttributes<HTMLDivElement>>;
export {};
