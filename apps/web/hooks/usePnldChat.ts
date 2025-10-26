/**
 * usePnldChat Hook
 *
 * Manages chat state, conversation tracking, and message streaming for PNLD Chat
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChatMessage,
  DocumentSource,
  streamChatMessage,
  ChatRequest,
} from "@/lib/api/pnld-chat";
import { getUserFriendlyErrorMessage } from "@/lib/error-handler";

const CONVERSATION_ID_KEY = "pnld_conversation_id";

export interface UsePnldChatOptions {
  editalId?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface UsePnldChatReturn {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: Error | null;
  sources: DocumentSource[];
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
}

/**
 * Custom hook for managing PNLD chat state and interactions
 */
export function usePnldChat(
  options: UsePnldChatOptions = {}
): UsePnldChatReturn {
  const { editalId, maxTokens = 1000, temperature = 0.7 } = options;

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sources, setSources] = useState<DocumentSource[]>([]);

  // Ref to track if we're currently streaming (prevents duplicate requests)
  const isStreamingRef = useRef(false);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);
      if (savedConversationId) {
        setConversationId(savedConversationId);
      }
    }
  }, []);

  // Save conversation ID to localStorage when it changes
  useEffect(() => {
    if (conversationId && typeof window !== "undefined") {
      localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    }
  }, [conversationId]);

  /**
   * Send a message with streaming response
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        return;
      }

      if (isStreamingRef.current) {
        console.warn("Already streaming a message, ignoring request");
        return;
      }

      // Clear previous error
      setError(null);
      setIsLoading(true);
      isStreamingRef.current = true;

      // Add user message immediately (optimistic update)
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Prepare the request
      const request: ChatRequest = {
        message,
        conversation_id: conversationId || undefined,
        edital_id: editalId,
        max_tokens: maxTokens,
        temperature,
      };

      // Accumulate assistant response content
      let assistantContent = "";
      let newConversationId = conversationId;
      let newSources: DocumentSource[] = [];
      const assistantTimestamp = new Date().toISOString();

      try {
        // Stream the response
        for await (const event of streamChatMessage(request)) {
          switch (event.type) {
            case "metadata":
              // Update conversation ID
              newConversationId = event.data.conversation_id;
              setConversationId(newConversationId);
              break;

            case "sources":
              // Update sources
              newSources = event.data;
              setSources(newSources);
              break;

            case "token":
              // Accumulate response content
              assistantContent += event.data.content;

              // Update messages with partial response - update the last message if it's the streaming assistant
              setMessages((prev) => {
                // Check if the last message is our streaming assistant message
                if (
                  prev.length > 0 &&
                  prev[prev.length - 1].role === "assistant"
                ) {
                  // Update the existing assistant message with same timestamp
                  return [
                    ...prev.slice(0, -1),
                    {
                      role: "assistant",
                      content: assistantContent,
                      timestamp: assistantTimestamp,
                    },
                  ];
                } else {
                  // Add new assistant message
                  return [
                    ...prev,
                    {
                      role: "assistant",
                      content: assistantContent,
                      timestamp: assistantTimestamp,
                    },
                  ];
                }
              });
              break;

            case "done":
              // Streaming complete
              console.log(
                "Streaming complete for conversation:",
                event.data.conversation_id
              );
              break;

            case "error":
              // Handle streaming error
              throw new Error(event.data.error);
          }
        }

        // No need for post-processing - the final state is already correct from the last token update
        setIsLoading(false);
        isStreamingRef.current = false;
      } catch (err) {
        console.error("Error streaming chat message:", err);
        const originalError =
          err instanceof Error ? err : new Error("Failed to send message");

        // Get user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(originalError);

        // Create error with user-friendly message
        const errorObj = new Error(userFriendlyMessage);
        setError(errorObj);

        // Remove the assistant message that was being streamed (if any)
        setMessages((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === "assistant" &&
            prev[prev.length - 1].content === ""
          ) {
            return prev.slice(0, -1);
          }
          return prev;
        });

        setIsLoading(false);
        isStreamingRef.current = false;
      }
    },
    [conversationId, editalId, maxTokens, temperature]
  );

  /**
   * Clear conversation and reset state
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setSources([]);
    setError(null);
    setIsLoading(false);
    isStreamingRef.current = false;

    if (typeof window !== "undefined") {
      localStorage.removeItem(CONVERSATION_ID_KEY);
    }
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sources,
    sendMessage,
    clearConversation,
  };
}
