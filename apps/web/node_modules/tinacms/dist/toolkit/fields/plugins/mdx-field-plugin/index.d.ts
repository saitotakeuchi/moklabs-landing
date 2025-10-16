import React from 'react';
import { type InputFieldType } from '../wrap-field-with-meta';
import type { InputProps } from '../../../fields/components';
import type { ToolbarOverrideType, ToolbarOverrides } from './plate/toolbar/toolbar-overrides';
import type { MdxTemplate } from './plate/types';
export type RichTextType = React.PropsWithChildren<InputFieldType<InputProps, {
    templates: MdxTemplate[];
    toolbarOverride?: ToolbarOverrideType[];
    overrides?: ToolbarOverrides;
}>>;
export declare const MdxFieldPlugin: {
    name: string;
    Component: (props: InputFieldType<InputProps, {
        templates: MdxTemplate[];
        toolbarOverride?: ToolbarOverrideType[];
        overrides?: ToolbarOverrides;
    }>) => React.JSX.Element;
};
export declare const MdxFieldPluginExtendible: {
    name: string;
    validate(value: any): string;
    Component: (props: InputFieldType<InputProps, {
        templates: MdxTemplate[];
        toolbarOverride?: ToolbarOverrideType[];
        overrides?: ToolbarOverrides;
    }>) => React.JSX.Element;
};
