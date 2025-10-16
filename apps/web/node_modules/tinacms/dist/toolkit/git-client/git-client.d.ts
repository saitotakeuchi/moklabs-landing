/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export declare class GitClient {
    private baseUrl;
    constructor(baseUrl: string);
    /**
     * An alias to `commit`
     *
     * @deprecated
     */
    onSubmit(data: any): Promise<any>;
    /**
     * An alias to `writeToDisk`
     *
     * @deprecated
     */
    onChange(data: any): Promise<any>;
    /**
     * An alias to `writeMediaToDisk`
     *
     * @deprecated
     */
    onUploadMedia(data: any): Promise<any>;
    /**
     * An alias to `deleteFromDisk`
     *
     * @deprecated
     */
    onDelete(data: any): Promise<any>;
    /**
     * @deprecated
     */
    isAuthenticated(): boolean;
    /**
     * @deprecated
     */
    commit(data: {
        files: string[];
        message?: string;
        name?: string;
        email?: string;
    }): Promise<Response>;
    /**
     * TODO: Add return type.
     * TODO: Remove `catch`
     *
     * @deprecated
     */
    push(): Promise<any>;
    /**
     * TODO: Add return type.
     * TODO: Remove `catch`
     *
     * @deprecated
     */
    writeToDisk(data: {
        fileRelativePath: string;
        content: string;
    }): Promise<any>;
    /**
     * Uploads a File to disk
     * TODO: Remove `catch`
     *
     * @deprecated
     */
    writeMediaToDisk(data: {
        directory: string;
        content: File;
    }): Promise<any>;
    /**
     * TODO: rename `data.relPath` to `data.fileRelativePath`
     * TODO: Add return type.
     * TODO: Remove `catch`
     *
     * @deprecated
     */
    deleteFromDisk(data: {
        relPath: string;
    }): Promise<any>;
    /**
     * Resets the given files.
     *
     * @deprecated
     */
    reset(data: {
        files: string[];
    }): Promise<Response>;
    /**
     * Get the contents of a file or directory on disk.
     *
     * @deprecated
     */
    getFile(fileRelativePath: string): Promise<any>;
    /**
     * Get the contents of a file for the most recent commit.
     *
     * @deprecated
     */
    show(fileRelativePath: string): Promise<any>;
    /**
     * Get information about a local branch by name, or the current branch if no
     * name is specified.
     *
     * @deprecated
     */
    branch(name?: string): Promise<any>;
    /**
     * Get a list of the names of all local branches.
     *
     * @deprecated
     */
    branches(): Promise<any>;
}
