import { useFloatingToolbarState } from '@udecode/plate-floating';
import React from 'react';
export declare const useCustomFloatingToolbar: ({ editorId, floating, focusedEditorId, hideToolbar, mousedown, open, readOnly, selectionExpanded, selectionText, setMousedown, setOpen, setWaitForCollapsedSelection, showWhenReadOnly, waitForCollapsedSelection, }: ReturnType<typeof useFloatingToolbarState>) => {
    clickOutsideRef: import("@udecode/plate/react").UseOnClickOutsideReturn;
    hidden: boolean;
    props: {
        style: React.CSSProperties;
    };
    ref: ((node: HTMLElement | null) => void) & ((node: HTMLElement | null) => void);
};
