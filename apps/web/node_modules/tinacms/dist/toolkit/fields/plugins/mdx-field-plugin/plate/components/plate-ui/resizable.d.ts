import React from 'react';
export declare const mediaResizeHandleVariants: (props?: {
    direction?: "left" | "right";
} & import("class-variance-authority/types").ClassProp) => string;
export declare const ResizeHandle: React.ForwardRefExoticComponent<Omit<{
    as?: React.ElementType;
    asChild?: boolean;
    className?: string;
    options?: import("@udecode/plate-resizable").ResizeHandleOptions | undefined;
    state?: {
        direction: import("@udecode/plate-resizable").ResizeDirection;
        initialPosition: number;
        initialSize: number;
        isHorizontal: boolean;
        isResizing: boolean;
        readOnly: boolean;
        setInitialPosition: React.Dispatch<React.SetStateAction<number>>;
        setInitialSize: React.Dispatch<React.SetStateAction<number>>;
        setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
        onHover: (() => void) | undefined;
        onHoverEnd: (() => void) | undefined;
        onMouseDown: React.MouseEventHandler<Element> | undefined;
        onResize: (event: import("@udecode/plate-resizable").ResizeEvent) => void;
        onTouchStart: React.TouchEventHandler<Element> | undefined;
    } | undefined;
    style?: React.CSSProperties;
    setProps?: ((hookProps: {
        onMouseDown: React.MouseEventHandler<Element>;
        onMouseOut: () => void;
        onMouseOver: () => void;
        onTouchEnd: () => void;
        onTouchMove: () => void;
        onTouchStart: React.TouchEventHandler<Element>;
    }) => Omit<React.HTMLAttributes<HTMLDivElement>, "onResize">) | undefined;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onResize"> & React.RefAttributes<any>, "ref"> & React.RefAttributes<any>>;
export declare const Resizable: React.ForwardRefExoticComponent<Omit<Omit<{
    options: import("@udecode/plate-resizable").ResizableOptions;
} & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>, "ref"> & Omit<{
    options: import("@udecode/plate-resizable").ResizableOptions;
} & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>, "align"> & import("class-variance-authority").VariantProps<(props?: {
    align?: "center" | "left" | "right";
} & import("class-variance-authority/types").ClassProp) => string>, "ref"> & React.RefAttributes<HTMLDivElement>>;
