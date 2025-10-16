export declare function useTina<T extends object>(props: {
    query: string;
    variables: object;
    data: T;
    experimental___selectFormByFormId?: () => string | false | undefined;
}): {
    data: T;
    isClient: boolean;
};
export declare function useEditState(): {
    edit: boolean;
};
/**
 * Grab the field name for the given attribute
 * to signal to Tina which DOM element the field
 * is working with.
 */
/**
 * Generate a field identifier for Tina to associate DOM elements with form fields.
 * Format: "queryId---path.to.field" or "queryId---path.to.array.index"
 */
export declare const tinaField: <T extends {
    _content_source?: {
        queryId: string;
        path: (number | string)[];
    };
} | Record<string, unknown> | null | undefined>(object: T, property?: keyof Omit<NonNullable<T>, "__typename" | "_sys">, index?: number) => string;
/**
 * FIX: This function is updated to be more robust. It explicitly checks for
 * `null` and `String` objects to prevent them from being processed as
 * iterable objects, which is the root cause of the "Objects are not valid
 * as a React child" error.
 */
export declare const addMetadata: <T extends object>(id: string, obj: T, path?: (string | number)[]) => T;
/**
 * This is a pretty rudimentary approach to hashing the query and variables to
 * ensure we treat multiple queries on the page uniquely. It's possible
 * that we would have collisions, and I'm not sure of the likeliness but seems
 * like it'd be rare.
 */
export declare const hashFromQuery: (input: string) => string;
