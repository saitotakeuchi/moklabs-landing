import { Field, Form } from '../forms';
import * as React from 'react';
export interface FieldsBuilderProps {
    form: Form;
    activeFieldName?: string;
    fields: Field[];
    padding?: boolean;
}
export declare function FieldsBuilder({ form, fields, activeFieldName, padding, }: FieldsBuilderProps): React.JSX.Element;
export declare const FieldsGroup: ({ padding, children, }: {
    padding?: boolean;
    children?: any | any[];
}) => React.JSX.Element;
