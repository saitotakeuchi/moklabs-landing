/**
 * Analytics Utility
 *
 * Centralized event tracking for PNLD Chat application
 * Integrates with Vercel Analytics and provides error tracking
 */

import { track } from "@vercel/analytics";

// Event names matching MOK-44 requirements
export type AnalyticsEvent =
  | "chat_message_sent"
  | "chat_response_received"
  | "chat_response_error"
  | "document_uploaded"
  | "document_deleted"
  | "document_upload_error"
  | "api_error"
  | "sse_connection_failed"
  | "sse_connection_restored";

// Event properties (non-PII, aggregate data only)
export interface AnalyticsEventProps {
  // Chat events
  conversation_id?: string;
  edital_id?: string;
  response_time_ms?: number;
  message_length?: number;
  sources_count?: number;

  // Document events
  document_id?: string;
  file_size_bytes?: number;
  chunks_count?: number;
  processing_time_ms?: number;

  // Error events
  error_code?: string;
  error_type?: string;
  error_message?: string; // Generic error message, never user content

  // SSE events
  connection_duration_ms?: number;
  retry_count?: number;
}

/**
 * Track an analytics event
 *
 * Note: Never track user message content or PII
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsEventProps
): void {
  try {
    // Only track in browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Filter out undefined values for Vercel Analytics
    const cleanedProperties = properties
      ? Object.entries(properties).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string | number>
        )
      : undefined;

    // Track with Vercel Analytics
    track(event, cleanedProperties);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event, properties);
    }
  } catch (error) {
    // Silently fail - don't let analytics errors break the app
    if (process.env.NODE_ENV === "development") {
      console.error("[Analytics] Failed to track event:", error);
    }
  }
}

/**
 * Track chat message sent
 */
export function trackChatMessageSent(props: {
  conversationId?: string;
  editalId?: string;
  messageLength: number;
}): void {
  trackEvent("chat_message_sent", {
    conversation_id: props.conversationId,
    edital_id: props.editalId,
    message_length: props.messageLength,
  });
}

/**
 * Track chat response received
 */
export function trackChatResponseReceived(props: {
  conversationId: string;
  editalId?: string;
  responseTimeMs: number;
  sourcesCount?: number;
}): void {
  trackEvent("chat_response_received", {
    conversation_id: props.conversationId,
    edital_id: props.editalId,
    response_time_ms: props.responseTimeMs,
    sources_count: props.sourcesCount,
  });
}

/**
 * Track chat response error
 */
export function trackChatResponseError(props: {
  conversationId?: string;
  editalId?: string;
  errorType: string;
  errorMessage: string;
}): void {
  trackEvent("chat_response_error", {
    conversation_id: props.conversationId,
    edital_id: props.editalId,
    error_type: props.errorType,
    error_message: props.errorMessage,
  });
}

/**
 * Track document uploaded
 */
export function trackDocumentUploaded(props: {
  documentId: string;
  editalId: string;
  fileSizeBytes: number;
  chunksCount?: number;
  processingTimeMs: number;
}): void {
  trackEvent("document_uploaded", {
    document_id: props.documentId,
    edital_id: props.editalId,
    file_size_bytes: props.fileSizeBytes,
    chunks_count: props.chunksCount,
    processing_time_ms: props.processingTimeMs,
  });
}

/**
 * Track document upload error
 */
export function trackDocumentUploadError(props: {
  editalId?: string;
  fileSizeBytes?: number;
  errorType: string;
  errorMessage: string;
}): void {
  trackEvent("document_upload_error", {
    edital_id: props.editalId,
    file_size_bytes: props.fileSizeBytes,
    error_type: props.errorType,
    error_message: props.errorMessage,
  });
}

/**
 * Track document deleted
 */
export function trackDocumentDeleted(props: {
  documentId: string;
  editalId?: string;
}): void {
  trackEvent("document_deleted", {
    document_id: props.documentId,
    edital_id: props.editalId,
  });
}

/**
 * Track API error
 */
export function trackApiError(props: {
  endpoint: string;
  errorCode: string;
  errorType: string;
  errorMessage: string;
}): void {
  trackEvent("api_error", {
    error_code: props.errorCode,
    error_type: props.errorType,
    error_message: `${props.endpoint}: ${props.errorMessage}`,
  });
}

/**
 * Track SSE connection failed
 */
export function trackSseConnectionFailed(props: {
  conversationId?: string;
  retryCount: number;
  errorMessage: string;
}): void {
  trackEvent("sse_connection_failed", {
    conversation_id: props.conversationId,
    retry_count: props.retryCount,
    error_message: props.errorMessage,
  });
}

/**
 * Track SSE connection restored
 */
export function trackSseConnectionRestored(props: {
  conversationId: string;
  connectionDurationMs: number;
  retryCount: number;
}): void {
  trackEvent("sse_connection_restored", {
    conversation_id: props.conversationId,
    connection_duration_ms: props.connectionDurationMs,
    retry_count: props.retryCount,
  });
}

/**
 * Error tracking utility
 *
 * Logs errors for monitoring without exposing sensitive data
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", error, context);
  }

  // TODO: Integrate with Sentry or other error tracking service
  // For now, we'll track via analytics
  trackEvent("api_error", {
    error_type: error.name,
    error_message: error.message,
    ...(context as AnalyticsEventProps),
  });
}
