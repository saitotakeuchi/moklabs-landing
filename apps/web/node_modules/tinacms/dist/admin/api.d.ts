import type { TinaCMS } from '@tinacms/toolkit';
import type { Collection, TinaSchema } from '@tinacms/schema-tools';
import type { Client } from '../internalClient';
import type { CollectionResponse, DocumentForm } from './types';
import { SearchClient } from '@tinacms/search/dist/index-client';
export declare const CREATE_DOCUMENT_GQL = "#graphql\nmutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {\n  createDocument(\n    collection: $collection,\n    relativePath: $relativePath,\n    params: $params\n  ){__typename}\n}";
export declare const UPDATE_DOCUMENT_GQL = "#graphql\nmutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {\n  updateDocument(\n    collection: $collection,\n    relativePath: $relativePath,\n    params: $params\n  ){__typename}\n}";
export declare const DELETE_DOCUMENT_GQL = "#graphql\nmutation DeleteDocument($collection: String!, $relativePath: String!){\n  deleteDocument(collection: $collection, relativePath: $relativePath){\n    __typename\n  }\n}";
export interface FilterArgs {
    filterField: string;
    collection?: string;
    relativePath?: string;
    relativePathWithoutExtension?: string;
    newRelativePath?: string;
    startsWith?: string;
    endsWith?: string;
    before?: string;
    after?: string;
    booleanEquals?: boolean;
}
export declare class TinaAdminApi {
    api: Client;
    useDataLayer: boolean;
    schema: TinaSchema;
    searchClient?: SearchClient;
    maxSearchIndexFieldLength: number;
    constructor(cms: TinaCMS);
    isAuthenticated(): Promise<boolean>;
    checkGraphqlSchema({ localSchema }: {
        localSchema: any;
    }): Promise<boolean>;
    fetchCollections(): Collection<true>[];
    renameDocument({ collection, relativePath, newRelativePath }: {
        collection: any;
        relativePath: any;
        newRelativePath: any;
    }): Promise<void>;
    deleteDocument({ collection, relativePath, }: {
        collection: string;
        relativePath: string;
    }): Promise<void>;
    fetchCollection(collectionName: string, includeDocuments: boolean, folder?: string, after?: string, sortKey?: string, order?: 'asc' | 'desc', filterArgs?: FilterArgs): Promise<CollectionResponse | Collection>;
    fetchDocument(collectionName: string, relativePath: string, values?: boolean): Promise<{
        document: DocumentForm;
    }>;
    createDocument(collection: Collection, relativePath: string, params: Object): Promise<unknown>;
    updateDocument(collection: Collection, relativePath: string, params: Object): Promise<unknown>;
    createFolder(collection: any, folderName: any): Promise<unknown>;
}
