export declare const HANDLES_MDX: ("h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p")[];
export declare const plugins: (import("@udecode/plate").SlatePlugin<import("@udecode/plate").PluginConfig<"trailingBlock", {
    type: string;
} & {
    level?: number;
    type?: string;
} & import("@udecode/plate").QueryNodeOptions, {}, {}, {}>> | import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"autoformat", {
    enableUndoOnDelete?: boolean;
    rules?: import("@udecode/plate-autoformat").AutoformatRule[];
}, {}, {}, {}>> | import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"exitBreak", {
    rules?: import("node_modules/@udecode/plate-break/dist/BaseSoftBreakPlugin-CeLtcSTo").E[];
}, {}, {}, {}>> | import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"resetNode", {
    disableEditorReset?: boolean;
    disableFirstBlockReset?: boolean;
    rules?: import("@udecode/plate-reset-node").ResetNodePluginRule[];
}, {}, {}, {}>> | import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"softBreak", {
    rules?: import("node_modules/@udecode/plate-break/dist/BaseSoftBreakPlugin-CeLtcSTo").b[];
}, {}, {}, {}>>)[];
