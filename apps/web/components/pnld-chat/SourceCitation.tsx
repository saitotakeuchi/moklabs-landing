"use client";

import { useState } from "react";
import { MessageSource } from "./Message";

interface SourceCitationProps {
  sources: MessageSource[];
}

export function SourceCitation({ sources }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  const topSources = sources.slice(0, 3);
  const displaySources = expanded ? sources : topSources;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-sans font-bold text-[#0013ff] text-sm">
          📄 Fontes Oficiais ({sources.length})
        </h4>
        {sources.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#0013ff] hover:underline text-xs font-sans"
          >
            {expanded ? "Ver menos" : `Ver todas (${sources.length})`}
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {displaySources.map((source, index) => (
          <li
            key={`${source.document_id}-${index}`}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-gray-600">•</span>
            <span className="font-sans text-[#0013ff] flex-1">
              {source.title}
            </span>
            {source.page_number && (
              <span className="text-gray-600 text-xs whitespace-nowrap">
                (Pág. {source.page_number})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
