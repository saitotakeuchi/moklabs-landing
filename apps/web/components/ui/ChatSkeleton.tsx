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
 * ChatMessageSkeleton - Typing indicator alternative
 *
 * Shows a pulsing message bubble while waiting for AI response
 */
export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[70%] items-start flex flex-col gap-2">
        {/* Pulsing message bubble */}
        <div
          className="
            bg-white border-2 border-[#0013ff]
            rounded-[24px] px-6 py-4
            min-w-[120px]
          "
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Skeleton
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              />
              <Skeleton
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <Skeleton
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
