/**
 * Editorial Workflow Status Constants
 * These match the server-side constants in tinacloud/js/content-api/src/editorial-workflow.ts
 */
export declare const EDITORIAL_WORKFLOW_STATUS: {
    readonly QUEUED: "queued";
    readonly PROCESSING: "processing";
    readonly SETTING_UP: "setting_up";
    readonly CREATING_BRANCH: "creating_branch";
    readonly INDEXING: "indexing";
    readonly CONTENT_GENERATION: "content_generation";
    readonly CREATING_PR: "creating_pr";
    readonly COMPLETE: "complete";
    readonly ERROR: "error";
    readonly TIMEOUT: "timeout";
};
export type EditorialWorkflowStatus = (typeof EDITORIAL_WORKFLOW_STATUS)[keyof typeof EDITORIAL_WORKFLOW_STATUS];
