import { type PlateEditor } from '@udecode/plate/react';
export declare const unsupportedItemsInTable: Set<string>;
export declare const insertInlineElement: (editor: PlateEditor, inlineElement: any) => void;
export declare const insertBlockElement: (editor: PlateEditor, blockElement: any) => void;
/**
 * Recursively removes link nodes (type: 'a') from inside code blocks,
 * replacing them with their text children.
 */
export declare function normalizeLinksInCodeBlocks(node: any): any;
export declare const helpers: {
    isNodeActive: (editor: any, type: any) => any;
    isListActive: (editor: any, type: any) => boolean;
    currentNodeSupportsMDX: (editor: PlateEditor) => import("@udecode/plate").NodeEntry<import("@udecode/plate").TElement | import("@udecode/plate").TText>;
    normalize: (node: any) => any;
    normalizeLinksInCodeBlocks: typeof normalizeLinksInCodeBlocks;
};
