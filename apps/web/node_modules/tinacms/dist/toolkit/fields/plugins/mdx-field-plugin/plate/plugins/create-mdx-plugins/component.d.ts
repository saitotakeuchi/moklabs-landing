import React from 'react';
import { PlateEditor } from '@udecode/plate/react';
interface InlineEmbedProps {
    attributes: any;
    children: any;
    element: any;
    onChange?: (value: any) => void;
    editor: PlateEditor;
}
export declare const InlineEmbed: ({ attributes, children, element, onChange, editor, }: InlineEmbedProps) => React.JSX.Element;
export declare const BlockEmbed: ({ attributes, children, element, editor, onChange, }: {
    attributes: any;
    children: any;
    element: any;
    editor: any;
    onChange: any;
}) => React.JSX.Element;
export {};
