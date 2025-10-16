import type { Form } from '../../forms';
import * as React from 'react';
export interface FormsViewProps {
    loadingPlaceholder?: React.FC;
}
export declare const FormsView: ({ loadingPlaceholder }?: FormsViewProps) => React.JSX.Element;
export interface FormHeaderProps {
    activeForm: {
        activeFieldName?: string;
        tinaForm: Form;
    };
}
export declare const FormHeader: ({ activeForm }: FormHeaderProps) => React.JSX.Element;
export declare const FormBreadcrumbs: ({ rootBreadcrumbName, ...props }: {
    rootBreadcrumbName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element;
