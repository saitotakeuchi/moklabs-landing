import * as React from 'react';
export declare const Callout: ({ children, calloutStyle, className, ...props }: {
    children?: React.ReactNode;
    calloutStyle?: "warning" | "info" | "success" | "error";
} & React.HTMLProps<HTMLDivElement>) => React.JSX.Element;
