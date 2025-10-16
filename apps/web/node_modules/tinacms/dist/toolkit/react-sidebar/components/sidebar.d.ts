import * as React from 'react';
import type { SidebarState, SidebarStateOptions } from '../sidebar';
export declare const SidebarContext: React.Context<any>;
export declare const minPreviewWidth = 440;
export declare const minSidebarWidth = 360;
export interface SidebarProviderProps {
    sidebar: SidebarState;
    resizingSidebar: boolean;
    setResizingSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    defaultWidth?: SidebarStateOptions['defaultWidth'];
    position?: SidebarStateOptions['position'];
    defaultState?: SidebarStateOptions['defaultState'];
}
export declare function SidebarProvider({ position, resizingSidebar, setResizingSidebar, defaultWidth, sidebar, }: SidebarProviderProps): React.JSX.Element;
