import { MediaStore, MediaUploadOptions, Media, MediaListOptions, MediaList } from '../core';
import { GitClient } from './git-client';
/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export declare class GitMediaStore implements MediaStore {
    private client;
    accept: string;
    constructor(client: GitClient);
    /**
     * @deprecated
     */
    persist(files: MediaUploadOptions[]): Promise<Media[]>;
    /**
     * @deprecated
     */
    list(options?: MediaListOptions): Promise<MediaList>;
    /**
     * @deprecated
     */
    delete(media: Media): Promise<void>;
}
export declare const nextOffset: (offset: number, limit: number, count: number) => number;
