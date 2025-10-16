import * as React from 'react';
interface ProgressBarProps {
    /** Progress percentage (0-100) */
    progress: number;
    /** Additional CSS classes */
    className?: string;
    /** Color of the progress bar */
    color?: 'blue' | 'green';
}
export declare const ProgressBar: React.FC<ProgressBarProps>;
export {};
