"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { SourceCitation } from "./SourceCitation";
import { Components } from "react-markdown";

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

// Custom components for professional markdown rendering
const markdownComponents: Components = {
  // Paragraphs with proper spacing
  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-gray-800">{children}</p>
  ),

  // Strong/bold text
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),

  // Emphasis/italic
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,

  // Ordered lists with professional styling
  ol: ({ children }) => (
    <ol className="my-4 ml-6 space-y-2 list-decimal marker:text-blue-600 marker:font-semibold">
      {children}
    </ol>
  ),

  // Unordered lists
  ul: ({ children }) => (
    <ul className="my-4 ml-6 space-y-2 list-disc marker:text-blue-600">
      {children}
    </ul>
  ),

  // List items with clean styling
  li: ({ children }) => (
    <li className="text-gray-800 leading-relaxed pl-2">{children}</li>
  ),

  // Headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-gray-900 mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
      {children}
    </h3>
  ),

  // Code blocks
  pre: ({ children }) => (
    <pre className="my-4 p-4 bg-gray-50 rounded-lg overflow-x-auto border border-gray-200">
      {children}
    </pre>
  ),

  // Inline code
  code: ({ children, className }) => {
    // Check if this is inside a pre (code block) vs inline
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return <code className="text-sm font-mono text-gray-800">{children}</code>;
  },

  // Blockquotes for emphasis
  blockquote: ({ children }) => (
    <blockquote className="my-4 pl-4 border-l-4 border-blue-200 bg-blue-50/50 py-2 pr-4 rounded-r-lg italic text-gray-700">
      {children}
    </blockquote>
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
    >
      {children}
    </a>
  ),

  // Horizontal rule
  hr: () => <hr className="my-6 border-gray-200" />,

  // Tables
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
      {children}
    </td>
  ),
};

export function Message({ role, content, sources, timestamp }: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full px-2 sm:px-0`}
    >
      <div
        className={`max-w-[95%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}
      >
        {/* Message Bubble */}
        <div
          className={`
            ${
              isUser
                ? "bg-[#0013ff] text-white rounded-2xl px-5 py-4 shadow-sm"
                : "bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100"
            }
            font-inter text-[15px] leading-[1.7]
          `}
        >
          {isUser ? (
            // User messages: plain text with preserved whitespace
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            // Assistant messages: professional markdown rendering
            <div className="text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={markdownComponents}
              >
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
          <span className="text-xs text-gray-400 px-2 font-sans">
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
