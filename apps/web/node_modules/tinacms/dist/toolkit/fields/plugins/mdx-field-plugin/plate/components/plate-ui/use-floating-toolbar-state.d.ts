import { FloatingToolbarState } from '@udecode/plate-floating';
import React from 'react';
export declare const useCustomFloatingToolbarState: ({ editorId, floatingOptions, focusedEditorId, hideToolbar, showWhenReadOnly, }: {
    editorId: string;
    focusedEditorId: string | null;
} & FloatingToolbarState) => {
    editorId: string;
    floating: import("@udecode/plate-floating").UseVirtualFloatingReturn<import("@udecode/plate-floating").ReferenceType>;
    focused: boolean;
    focusedEditorId: string;
    hideToolbar: boolean;
    mousedown: boolean;
    open: boolean;
    readOnly: boolean;
    selectionExpanded: boolean;
    selectionText: string;
    setMousedown: React.Dispatch<React.SetStateAction<boolean>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setWaitForCollapsedSelection: React.Dispatch<React.SetStateAction<boolean>>;
    showWhenReadOnly: boolean;
    waitForCollapsedSelection: boolean;
};
