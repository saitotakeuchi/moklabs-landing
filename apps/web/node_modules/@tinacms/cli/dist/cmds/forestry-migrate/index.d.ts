import type { Collection, TinaField, ContentFrontmatterFormat } from '@tinacms/schema-tools';
export declare const stringifyLabel: (label: string) => string;
export declare const stringifyLabelWithField: (label: string) => string;
export declare const generateAllTemplates: ({ pathToForestryConfig, }: {
    pathToForestryConfig: string;
}) => Promise<Map<string, {
    fields: TinaField[];
    templateObj: any;
}>>;
export declare const generateCollections: ({ pathToForestryConfig, usingTypescript, frontMatterFormat, }: {
    frontMatterFormat?: ContentFrontmatterFormat;
    pathToForestryConfig: string;
    usingTypescript: boolean;
}) => Promise<{
    collections: Collection[];
    importStatements: string;
    templateCode: string;
}>;
