import { TinaCMS } from '../../tina-cms';
import * as React from 'react';
export declare const useGetEvents: (cms: TinaCMS, cursor?: string, existingEvents?: {
    message: string;
    id: string;
    timestamp: number;
    isError: boolean;
    isGlobal: boolean;
}[]) => {
    events: {
        message: string;
        id: string;
        timestamp: number;
        isError: boolean;
        isGlobal: boolean;
    }[];
    cursor: string;
    loading: boolean;
    error: Error;
};
export declare const SyncStatusModal: ({ closeEventsModal, cms }: {
    closeEventsModal: any;
    cms: any;
}) => React.JSX.Element;
export declare const SyncStatusButton: ({ cms, setEventsOpen, ...buttonProps }: {
    cms: TinaCMS;
    setEventsOpen: (open: boolean) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => React.JSX.Element;
