import { GitFile } from './git-file';
/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export declare function useGitFile(relativePath: string, format: (file: any) => string, parse: (content: string) => any): GitFile;
