import type { MdxTemplate } from '../../types';
import { PlateEditor } from '@udecode/plate/react';
export declare const ELEMENT_MDX_INLINE = "mdxJsxTextElement";
export declare const ELEMENT_MDX_BLOCK = "mdxJsxFlowElement";
export declare const createMdxInlinePlugin: import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"mdxJsxTextElement", {}, {}, {}, {}>>;
export declare const createMdxBlockPlugin: import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"mdxJsxFlowElement", {}, {}, {}, {}>>;
export declare const insertMDX: (editor: PlateEditor, value: MdxTemplate) => void;
