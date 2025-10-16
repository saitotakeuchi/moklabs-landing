import React from 'react';
import { AutoformatRule } from '@udecode/plate-autoformat';
import { ListStyleType } from '@udecode/plate-indent-list';
import { createLowlight } from 'lowlight';
export declare const HANDLES_MDX: ("h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p")[];
export declare const viewPlugins: readonly [import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"basicMarks", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"underline", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"heading", {
    levels?: import("@udecode/plate-heading").HeadingLevel | import("@udecode/plate-heading").HeadingLevel[];
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"p", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"code_block", {
    defaultLanguage?: string | null;
    lowlight?: ReturnType<typeof createLowlight> | null;
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"blockquote", {}, {}, {}, {}>>];
export declare const editorPlugins: readonly [import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"mdxJsxFlowElement", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"mdxJsxTextElement", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"img", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"html", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"html_inline", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"blockquote-enter-break", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"invalid_markdown", {
    isElement: boolean;
    isVoid: boolean;
    isInline: boolean;
}, {}, {}, {}>>, import("@udecode/plate").SlatePlugin<import("@udecode/plate").PluginConfig<"WITH_CORRECT_NODE_BEHAVIOR", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"a", {
    allowedSchemes?: string[];
    dangerouslySkipSanitization?: boolean;
    defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    forceSubmit?: boolean;
    keepSelectedTextOnPaste?: boolean;
    rangeBeforeOptions?: import("@udecode/plate").EditorBeforeOptions;
    triggerFloatingLinkHotkeys?: string[] | string;
    getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
    getUrlHref?: (url: string) => string | undefined;
    isUrl?: (text: string) => boolean;
    transformInput?: (url: string) => string | undefined;
} & {
    isEditing: boolean;
    mode: import("@udecode/plate-link/react").FloatingLinkMode;
    mouseDown: boolean;
    newTab: boolean;
    openEditorId: string | null;
    text: string;
    updated: boolean;
    url: string;
    triggerFloatingLinkHotkeys?: string;
}, {
    floatingLink: {
        hide: () => void;
        reset: () => void;
        show: (mode: import("@udecode/plate-link/react").FloatingLinkMode, editorId: string) => void;
    };
    link: {
        getAttributes: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, link: import("@udecode/plate-link").TLinkElement) => {
            download?: any;
            href?: string | undefined;
            hrefLang?: string | undefined;
            media?: string | undefined;
            ping?: string | undefined;
            target?: React.HTMLAttributeAnchorTarget | undefined;
            type?: string | undefined;
            referrerPolicy?: React.HTMLAttributeReferrerPolicy | undefined;
            defaultChecked?: boolean | undefined;
            defaultValue?: string | number | readonly string[] | undefined;
            suppressContentEditableWarning?: boolean | undefined;
            suppressHydrationWarning?: boolean | undefined;
            accessKey?: string | undefined;
            autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters" | undefined | (string & {});
            autoFocus?: boolean | undefined;
            className?: string | undefined;
            contentEditable?: (boolean | "true" | "false") | "inherit" | "plaintext-only" | undefined;
            contextMenu?: string | undefined;
            dir?: string | undefined;
            draggable?: (boolean | "true" | "false") | undefined;
            enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined;
            hidden?: boolean | undefined;
            id?: string | undefined;
            lang?: string | undefined;
            nonce?: string | undefined;
            slot?: string | undefined;
            spellCheck?: (boolean | "true" | "false") | undefined;
            style?: React.CSSProperties | undefined;
            tabIndex?: number | undefined;
            title?: string | undefined;
            translate?: "yes" | "no" | undefined;
            radioGroup?: string | undefined;
            role?: React.AriaRole | undefined;
            about?: string | undefined;
            content?: string | undefined;
            datatype?: string | undefined;
            inlist?: any;
            prefix?: string | undefined;
            property?: string | undefined;
            rel?: string | undefined;
            resource?: string | undefined;
            rev?: string | undefined;
            typeof?: string | undefined;
            vocab?: string | undefined;
            autoCorrect?: string | undefined;
            autoSave?: string | undefined;
            color?: string | undefined;
            itemProp?: string | undefined;
            itemScope?: boolean | undefined;
            itemType?: string | undefined;
            itemID?: string | undefined;
            itemRef?: string | undefined;
            results?: number | undefined;
            security?: string | undefined;
            unselectable?: "on" | "off" | undefined;
            popover?: "" | "auto" | "manual" | undefined;
            popoverTargetAction?: "toggle" | "show" | "hide" | undefined;
            popoverTarget?: string | undefined;
            inert?: boolean | undefined;
            inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
            is?: string | undefined;
            exportparts?: string | undefined;
            part?: string | undefined;
            "aria-activedescendant"?: string | undefined;
            "aria-atomic"?: (boolean | "true" | "false") | undefined;
            "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
            "aria-braillelabel"?: string | undefined;
            "aria-brailleroledescription"?: string | undefined;
            "aria-busy"?: (boolean | "true" | "false") | undefined;
            "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined;
            "aria-colcount"?: number | undefined;
            "aria-colindex"?: number | undefined;
            "aria-colindextext"?: string | undefined;
            "aria-colspan"?: number | undefined;
            "aria-controls"?: string | undefined;
            "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
            "aria-describedby"?: string | undefined;
            "aria-description"?: string | undefined;
            "aria-details"?: string | undefined;
            "aria-disabled"?: (boolean | "true" | "false") | undefined;
            "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined;
            "aria-errormessage"?: string | undefined;
            "aria-expanded"?: (boolean | "true" | "false") | undefined;
            "aria-flowto"?: string | undefined;
            "aria-grabbed"?: (boolean | "true" | "false") | undefined;
            "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined;
            "aria-hidden"?: (boolean | "true" | "false") | undefined;
            "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
            "aria-keyshortcuts"?: string | undefined;
            "aria-label"?: string | undefined;
            "aria-labelledby"?: string | undefined;
            "aria-level"?: number | undefined;
            "aria-live"?: "off" | "assertive" | "polite" | undefined;
            "aria-modal"?: (boolean | "true" | "false") | undefined;
            "aria-multiline"?: (boolean | "true" | "false") | undefined;
            "aria-multiselectable"?: (boolean | "true" | "false") | undefined;
            "aria-orientation"?: "horizontal" | "vertical" | undefined;
            "aria-owns"?: string | undefined;
            "aria-placeholder"?: string | undefined;
            "aria-posinset"?: number | undefined;
            "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined;
            "aria-readonly"?: (boolean | "true" | "false") | undefined;
            "aria-relevant"?: "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals" | undefined;
            "aria-required"?: (boolean | "true" | "false") | undefined;
            "aria-roledescription"?: string | undefined;
            "aria-rowcount"?: number | undefined;
            "aria-rowindex"?: number | undefined;
            "aria-rowindextext"?: string | undefined;
            "aria-rowspan"?: number | undefined;
            "aria-selected"?: (boolean | "true" | "false") | undefined;
            "aria-setsize"?: number | undefined;
            "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
            "aria-valuemax"?: number | undefined;
            "aria-valuemin"?: number | undefined;
            "aria-valuenow"?: number | undefined;
            "aria-valuetext"?: string | undefined;
            children?: React.ReactNode | undefined;
            dangerouslySetInnerHTML?: {
                __html: string | TrustedHTML;
            } | undefined;
            onCopy?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onCopyCapture?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onCut?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onCutCapture?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onPaste?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onPasteCapture?: React.ClipboardEventHandler<HTMLAnchorElement> | undefined;
            onCompositionEnd?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onCompositionEndCapture?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onCompositionStart?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onCompositionStartCapture?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onCompositionUpdate?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onCompositionUpdateCapture?: React.CompositionEventHandler<HTMLAnchorElement> | undefined;
            onFocus?: React.FocusEventHandler<HTMLAnchorElement> | undefined;
            onFocusCapture?: React.FocusEventHandler<HTMLAnchorElement> | undefined;
            onBlur?: React.FocusEventHandler<HTMLAnchorElement> | undefined;
            onBlurCapture?: React.FocusEventHandler<HTMLAnchorElement> | undefined;
            onChange?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onChangeCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onBeforeInput?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onBeforeInputCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onInput?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onInputCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onReset?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onResetCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onSubmit?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onSubmitCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onInvalid?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onInvalidCapture?: React.FormEventHandler<HTMLAnchorElement> | undefined;
            onLoad?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onError?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onErrorCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onKeyDownCapture?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onKeyPress?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onKeyPressCapture?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onKeyUp?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onKeyUpCapture?: React.KeyboardEventHandler<HTMLAnchorElement> | undefined;
            onAbort?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onAbortCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onCanPlay?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onCanPlayCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onCanPlayThrough?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onCanPlayThroughCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onDurationChange?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onDurationChangeCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEmptied?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEmptiedCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEncrypted?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEncryptedCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEnded?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onEndedCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadedData?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadedDataCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadedMetadata?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadedMetadataCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadStart?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onLoadStartCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPause?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPauseCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPlay?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPlayCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPlaying?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onPlayingCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onProgress?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onProgressCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onRateChange?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onRateChangeCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onResize?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onResizeCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSeeked?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSeekedCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSeeking?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSeekingCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onStalled?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onStalledCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSuspend?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSuspendCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onTimeUpdate?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onTimeUpdateCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onVolumeChange?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onVolumeChangeCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onWaiting?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onWaitingCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onAuxClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onAuxClickCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onClickCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onContextMenu?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onContextMenuCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onDoubleClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onDoubleClickCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onDrag?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragEnd?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragEndCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragEnter?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragEnterCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragExit?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragExitCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragLeave?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragLeaveCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragOver?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragOverCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragStart?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDragStartCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDrop?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onDropCapture?: React.DragEventHandler<HTMLAnchorElement> | undefined;
            onMouseDown?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseDownCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseMove?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseMoveCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseOut?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseOutCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseOver?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseOverCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseUp?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onMouseUpCapture?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
            onSelect?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onSelectCapture?: React.ReactEventHandler<HTMLAnchorElement> | undefined;
            onTouchCancel?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchCancelCapture?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchEnd?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchEndCapture?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchMove?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchMoveCapture?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchStart?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onTouchStartCapture?: React.TouchEventHandler<HTMLAnchorElement> | undefined;
            onPointerDown?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerDownCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerMove?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerMoveCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerUp?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerUpCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerCancel?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerCancelCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerEnter?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerLeave?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerOver?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerOverCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerOut?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onPointerOutCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onGotPointerCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onGotPointerCaptureCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onLostPointerCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onLostPointerCaptureCapture?: React.PointerEventHandler<HTMLAnchorElement> | undefined;
            onScroll?: React.UIEventHandler<HTMLAnchorElement> | undefined;
            onScrollCapture?: React.UIEventHandler<HTMLAnchorElement> | undefined;
            onScrollEnd?: React.UIEventHandler<HTMLAnchorElement> | undefined;
            onScrollEndCapture?: React.UIEventHandler<HTMLAnchorElement> | undefined;
            onWheel?: React.WheelEventHandler<HTMLAnchorElement> | undefined;
            onWheelCapture?: React.WheelEventHandler<HTMLAnchorElement> | undefined;
            onAnimationStart?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onAnimationStartCapture?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onAnimationEnd?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onAnimationEndCapture?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onAnimationIteration?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onAnimationIterationCapture?: React.AnimationEventHandler<HTMLAnchorElement> | undefined;
            onToggle?: React$1.ToggleEventHandler<HTMLAnchorElement> | undefined;
            onBeforeToggle?: React$1.ToggleEventHandler<HTMLAnchorElement> | undefined;
            onTransitionCancel?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionCancelCapture?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionEnd?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionEndCapture?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionRun?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionRunCapture?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionStart?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
            onTransitionStartCapture?: React.TransitionEventHandler<HTMLAnchorElement> | undefined;
        }>;
    };
}, {}, {
    isOpen?: (editorId: string) => boolean;
}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"basicMarks", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"underline", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"heading", {
    levels?: import("@udecode/plate-heading").HeadingLevel | import("@udecode/plate-heading").HeadingLevel[];
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"p", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"code_block", {
    defaultLanguage?: string | null;
    lowlight?: ReturnType<typeof createLowlight> | null;
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"blockquote", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"list", {
    enableResetOnShiftTab?: boolean;
    validLiChildrenTypes?: string[];
}, {}, {
    toggle: {
        bulletedList: (() => boolean) & (() => boolean);
        list: ((args_0: {
            type: string;
        }) => boolean) & ((args_0: {
            type: string;
        }) => boolean);
        numberedList: (() => boolean) & (() => boolean);
    };
}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"listStyleType", {
    getSiblingIndentListOptions?: import("@udecode/plate-indent-list").GetSiblingIndentListOptions<import("@udecode/plate").TElement>;
    listStyleTypes?: Record<string, {
        type: string;
        isOrdered?: boolean;
        liComponent?: React.FC<import("@udecode/plate").SlateRenderElementProps>;
        markerComponent?: React.FC<Omit<import("@udecode/plate").SlateRenderElementProps, "children">>;
    }>;
    getListStyleType?: (element: HTMLElement) => ListStyleType;
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"hr", {}, {}, {}, {}>>, import("@udecode/plate").SlatePlugin<import("@udecode/plate-node-id").NodeIdConfig>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"table", {
    _cellIndices: Record<string, {
        col: number;
        row: number;
    }>;
    selectedCells: import("@udecode/plate").TElement[] | null;
    selectedTables: import("@udecode/plate").TElement[] | null;
    disableExpandOnInsert?: boolean;
    disableMarginLeft?: boolean;
    disableMerge?: boolean;
    enableUnsetSingleColSize?: boolean;
    initialTableWidth?: number;
    minColumnWidth?: number;
}, {
    create: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, header, rowCount, ...cellOptions }?: import("@udecode/plate-table").GetEmptyTableNodeOptions) => import("@udecode/plate-table").TTableElement>;
        tableCell: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { children, header, row }?: import("@udecode/plate-table").CreateCellOptions) => {
            children: import("@udecode/plate").Descendant[];
            type: string;
        }>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, ...cellOptions }?: import("@udecode/plate-table").GetEmptyRowNodeOptions) => {
            children: {
                children: import("@udecode/plate").Descendant[];
                type: string;
            }[];
            type: string;
        }>;
    };
    table: {
        getCellBorders: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { cellIndices, defaultBorder, element, }: {
            element: import("@udecode/plate-table").TTableCellElement;
            cellIndices?: import("@udecode/plate-table").CellIndices;
            defaultBorder?: import("@udecode/plate-table").BorderStyle;
        }) => import("@udecode/plate-table").BorderStylesDefault>;
        getCellSize: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { cellIndices, colSizes, element, rowSize, }: {
            element: import("@udecode/plate-table").TTableCellElement;
            cellIndices?: import("@udecode/plate-table").CellIndices;
            colSizes?: number[];
            rowSize?: number;
        }) => {
            minHeight: number | undefined;
            width: number;
        }>;
        getColSpan: (cellElem: import("@udecode/plate-table").TTableCellElement) => number;
        getRowSpan: (cellElem: import("@udecode/plate-table").TTableCellElement) => number;
        getCellChildren: (cell: import("@udecode/plate-table").TTableCellElement) => import("@udecode/plate").Descendant[];
    };
} & {
    create: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, header, rowCount, ...cellOptions }?: import("@udecode/plate-table").GetEmptyTableNodeOptions) => import("@udecode/plate-table").TTableElement>;
        tableCell: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { children, header, row }?: import("@udecode/plate-table").CreateCellOptions) => {
            children: import("@udecode/plate").Descendant[];
            type: string;
        }>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, ...cellOptions }?: import("@udecode/plate-table").GetEmptyRowNodeOptions) => {
            children: {
                children: import("@udecode/plate").Descendant[];
                type: string;
            }[];
            type: string;
        }>;
    };
    table: {
        getCellBorders: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { cellIndices, defaultBorder, element, }: {
            element: import("@udecode/plate-table").TTableCellElement;
            cellIndices?: import("@udecode/plate-table").CellIndices;
            defaultBorder?: import("@udecode/plate-table").BorderStyle;
        }) => import("@udecode/plate-table").BorderStylesDefault>;
        getCellSize: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { cellIndices, colSizes, element, rowSize, }: {
            element: import("@udecode/plate-table").TTableCellElement;
            cellIndices?: import("@udecode/plate-table").CellIndices;
            colSizes?: number[];
            rowSize?: number;
        }) => {
            minHeight: number | undefined;
            width: number;
        }>;
        getColSpan: (cellElem: import("@udecode/plate-table").TTableCellElement) => number;
        getRowSpan: (cellElem: import("@udecode/plate-table").TTableCellElement) => number;
        getCellChildren: (cell: import("@udecode/plate-table").TTableCellElement) => import("@udecode/plate").Descendant[];
    };
}, {
    insert: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, header, rowCount }?: import("@udecode/plate-table").GetEmptyTableNodeOptions, { select: shouldSelect, ...options }?: import("@udecode/plate").InsertNodesOptions) => void>;
        tableColumn: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, options?: {
            at?: import("@udecode/plate").Path;
            before?: boolean;
            fromCell?: import("@udecode/plate").Path;
            header?: boolean;
            select?: boolean;
        }) => void>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, options?: {
            at?: import("@udecode/plate").Path;
            before?: boolean;
            fromRow?: import("@udecode/plate").Path;
            header?: boolean;
            select?: boolean;
        }) => void>;
    };
    remove: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        tableColumn: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
    };
    table: {
        merge: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        split: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
    };
} & {
    insert: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, { colCount, header, rowCount }?: import("@udecode/plate-table").GetEmptyTableNodeOptions, { select: shouldSelect, ...options }?: import("@udecode/plate").InsertNodesOptions) => void>;
        tableColumn: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, options?: {
            at?: import("@udecode/plate").Path;
            before?: boolean;
            fromCell?: import("@udecode/plate").Path;
            header?: boolean;
            select?: boolean;
        }) => void>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor, options?: {
            at?: import("@udecode/plate").Path;
            before?: boolean;
            fromRow?: import("@udecode/plate").Path;
            header?: boolean;
            select?: boolean;
        }) => void>;
    };
    remove: {
        table: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        tableColumn: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        tableRow: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
    };
    table: {
        merge: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
        split: import("@udecode/plate").OmitFirst<(editor: import("@udecode/plate").SlateEditor) => void>;
    };
}, {
    cellIndices?: (id: string) => import("@udecode/plate-table").CellIndices;
}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"slash_command", import("@udecode/plate-combobox").TriggerComboboxPluginOptions, {}, {}, {}>>, import("@udecode/plate").SlatePlugin<import("@udecode/plate").PluginConfig<"trailingBlock", {
    type: string;
} & {
    level?: number;
    type?: string;
} & import("@udecode/plate").QueryNodeOptions, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"break", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"floating-toolbar", {}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"autoformat", {
    enableUndoOnDelete?: boolean;
    rules?: AutoformatRule[];
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"exitBreak", {
    rules?: import("node_modules/@udecode/plate-break/dist/BaseSoftBreakPlugin-CeLtcSTo").E[];
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"resetNode", {
    disableEditorReset?: boolean;
    disableFirstBlockReset?: boolean;
    rules?: import("@udecode/plate-reset-node").ResetNodePluginRule[];
}, {}, {}, {}>>, import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"softBreak", {
    rules?: import("node_modules/@udecode/plate-break/dist/BaseSoftBreakPlugin-CeLtcSTo").b[];
}, {}, {}, {}>>];
