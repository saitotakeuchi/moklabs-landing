"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full px-2 sm:px-0`}
    >
      <div
        className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}
      >
        {/* Message Bubble */}
        <div
          className={`
            ${
              isUser
                ? "bg-[#0013ff] text-white rounded-[12px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white"
                : "text-gray-800"
            }
            font-inter text-sm sm:text-base leading-[1.6]
            break-words
          `}
        >
          {isUser ? (
            // User messages: plain text with preserved whitespace
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            // Assistant messages: full markdown rendering
            <div className="prose prose-sm max-w-none
              prose-p:my-2 prose-p:leading-relaxed
              prose-headings:my-3 prose-headings:font-semibold
              prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
              prose-pre:my-2 prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg
              prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-code:before:content-none prose-code:after:content-none
              prose-a:text-blue-600 prose-a:underline
              prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
              prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-50
              prose-td:border prose-td:border-gray-300 prose-td:p-2
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
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
