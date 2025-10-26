"use client";

import { SourceCitation } from "./SourceCitation";

export interface MessageSource {
  document_id: string;
  title: string;
  content_excerpt: string;
  page_number?: number;
  chunk_index?: number;
  relevance_score: number;
}

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: MessageSource[];
  timestamp?: Date;
}

export function Message({ role, content, sources, timestamp }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full px-2 sm:px-0`}>
      <div
        className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}
      >
        {/* Message Bubble */}
        <div
          className={`
            ${
              isUser
                ? "bg-[#0013ff] text-white"
                : "bg-white text-[#0013ff] border-2 border-[#0013ff]"
            }
            rounded-[20px] sm:rounded-[24px]
            px-4 sm:px-5 md:px-6
            py-3 sm:py-3.5 md:py-4
            font-['Inter'] text-sm sm:text-base leading-[1.4]
            break-words
          `}
        >
          <div className="prose prose-sm max-w-none">
            {content.split("\n").map((paragraph, idx) => (
              <p key={idx} className="mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && sources && sources.length > 0 && (
          <div className="w-full">
            <SourceCitation sources={sources} />
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-500 px-2 font-sans">
            {timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
