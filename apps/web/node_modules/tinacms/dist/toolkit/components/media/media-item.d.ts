import { Media } from '../../core';
import React from 'react';
interface MediaItemProps {
    item: Media & {
        new?: boolean;
    };
    onClick(_item: Media | false): void;
    active: boolean;
}
export declare const checkerboardStyle: {
    backgroundImage: string;
    backgroundSize: string;
    backgroundPosition: string;
};
export declare const smallCheckerboardStyle: {
    backgroundImage: string;
    backgroundSize: string;
    backgroundPosition: string;
};
export declare function ListMediaItem({ item, onClick, active }: MediaItemProps): React.JSX.Element;
export declare function GridMediaItem({ item, active, onClick }: MediaItemProps): React.JSX.Element;
export {};
