import type { Framework } from '../';
import type { Config, PromptAuthProvider } from './types';
export declare const chooseAuthProvider: ({ framework, config, }: {
    config: Config;
    framework: Framework;
}) => Promise<PromptAuthProvider>;
