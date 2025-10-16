import { Media } from '../../core';
import React from 'react';
export interface MediaRequest {
    directory?: string;
    onSelect?(_media: Media): void;
    close?(): void;
    allowDelete?: boolean;
}
export declare function MediaManager(): React.JSX.Element;
export declare function MediaPicker({ allowDelete, onSelect, close, ...props }: MediaRequest): React.JSX.Element;
