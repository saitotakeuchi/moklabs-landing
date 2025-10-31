/**
 * ChatSkeleton Component
 *
 * Loading skeleton for chat messages that matches the actual message shape
 */

import { Skeleton } from "./Skeleton";

interface ChatSkeletonProps {
  /** Number of skeleton messages to show */
  count?: number;
  /** Show as user message (right-aligned) or assistant (left-aligned) */
  role?: "user" | "assistant";
}

export function ChatSkeleton({
  count = 1,
  role = "assistant",
}: ChatSkeletonProps) {
  const isUser = role === "user";

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex ${isUser ? "justify-end" : "justify-start"} w-full mb-4`}
        >
          <div
            className={`max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}
          >
            {/* Message bubble skeleton */}
            <div
              className={`
                ${
                  isUser
                    ? "bg-[#0013ff] bg-opacity-10"
                    : "bg-white border-2 border-gray-200"
                }
                rounded-[24px] px-6 py-4
                min-w-[200px]
              `}
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Timestamp skeleton */}
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * ChatMessageSkeleton - Minimal typing indicator
 *
 * Shows simple bouncing dots while waiting for AI response
 */
export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start w-full px-2 sm:px-0">
      <div className="flex gap-1 py-2">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
    </div>
  );
}
