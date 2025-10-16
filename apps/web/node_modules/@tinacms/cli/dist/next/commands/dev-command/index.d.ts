import { Database } from '@tinacms/graphql';
import { SearchIndexer } from '@tinacms/search';
import AsyncLock from 'async-lock';
import { ConfigManager } from '../../config-manager';
import { BaseCommand } from '../baseCommands';
export declare class DevCommand extends BaseCommand {
    static paths: string[][];
    watchFolders: string;
    noWatch: boolean;
    outputSearchIndexPath: string;
    noServer: boolean;
    indexingLock: AsyncLock;
    static usage: import("clipanion").Usage;
    catch(error: any): Promise<void>;
    logDeprecationWarnings(): void;
    execute(): Promise<number | void>;
    watchContentFiles(configManager: ConfigManager, database: Database, databaseLock: (fn: () => Promise<void>) => Promise<void>, searchIndexer?: SearchIndexer): void;
    watchQueries(configManager: ConfigManager, databaseLock: (fn: () => Promise<void>) => Promise<void>, callback: () => Promise<string>): void;
}
