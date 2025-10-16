import { CMS } from '../core';
/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export declare class GitFile {
    private cms;
    relativePath: string;
    format: (file: any) => string;
    parse: (content: string) => any;
    constructor(cms: CMS, relativePath: string, format: (file: any) => string, parse: (content: string) => any);
    /**
     * Load the contents of this file at HEAD
     *
     * @deprecated
     */
    show: () => Promise<any>;
    /**
     * @deprecated
     */
    commit: () => Promise<void>;
    /**
     * @deprecated
     */
    reset: () => void;
    /**
     * @deprecated
     */
    write: (values: any) => void;
    /**
     * @deprecated
     */
    private get git();
}
