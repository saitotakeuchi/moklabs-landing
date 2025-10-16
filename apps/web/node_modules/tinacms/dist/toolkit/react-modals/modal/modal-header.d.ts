import * as React from 'react';
export interface ModalHeaderProps {
    children: React.ReactNode;
    close?(): void;
}
export declare const ModalHeader: ({ children, close }: ModalHeaderProps) => React.JSX.Element;
