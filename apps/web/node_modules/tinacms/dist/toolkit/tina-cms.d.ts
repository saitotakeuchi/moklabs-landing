import { Alerts, type EventsToAlerts } from './alerts';
import { CMS, type CMSConfig, type PluginType } from './core';
import type { FieldPlugin } from './form-builder';
import type { Form } from './forms';
import type { ScreenPlugin } from './react-screens';
import { SidebarState, type SidebarStateOptions } from './react-sidebar';
import type { Client } from '../internalClient';
import type { TinaAction, TinaState } from './tina-state';
export interface TinaCMSConfig extends CMSConfig {
    sidebar?: SidebarStateOptions | boolean;
    alerts?: EventsToAlerts;
    isLocalClient?: boolean;
    isSelfHosted?: boolean;
    clientId?: string;
}
export declare class TinaCMS extends CMS {
    sidebar?: SidebarState;
    _alerts?: Alerts;
    state: TinaState;
    dispatch: React.Dispatch<TinaAction>;
    api: {
        [key: string]: any;
        tina?: Client;
    };
    constructor({ sidebar, alerts, isLocalClient, isSelfHosted, clientId, ...config }?: TinaCMSConfig);
    get alerts(): Alerts;
    registerApi(name: string, api: any): void;
    get forms(): PluginType<Form>;
    get fields(): PluginType<FieldPlugin>;
    get screens(): PluginType<ScreenPlugin>;
    removeAllForms(): void;
    /**
     * When a form is associated with any queries
     * it's considered orphaned.
     */
    removeOrphanedForms(): void;
}
