import { Framework, InitEnvironment } from '../';
import { Config, ImportStatement } from './types';
import { ContentFrontmatterFormat } from '@tinacms/schema-tools';
export * from './askTinaCloudSetup';
export * from './types';
export * from './gitProvider';
export * from './databaseAdapter';
export * from './authProvider';
export declare const askCommonSetUp: () => Promise<{
    framework: Framework;
    packageManager: "pnpm" | "yarn" | "npm" | "bun";
}>;
export declare const askForestryMigrate: ({ framework, env, }: {
    framework: Framework;
    env: InitEnvironment;
}) => Promise<{
    forestryMigrate: boolean;
    frontMatterFormat?: ContentFrontmatterFormat;
}>;
export declare const askTinaSetupPrompts: (params: {
    frameworkName: string;
    config: Config;
}) => Promise<{
    typescript: boolean;
    publicFolder?: string;
}>;
export declare const askIfUsingSelfHosted: () => Promise<{
    hosting: "tina-cloud" | "self-host";
}>;
export declare const makeImportString: (imports?: ImportStatement[]) => string;
