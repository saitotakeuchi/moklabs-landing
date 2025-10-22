'use client';

import { useState } from 'react';
import { MessageSource } from './Message';

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
        <h4 className="font-['Fira_Mono'] font-bold text-[#0013ff] text-sm">
          📄 Fontes Oficiais ({sources.length})
        </h4>
        {sources.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#0013ff] hover:underline text-xs font-['Fira_Mono']"
          >
            {expanded ? 'Ver menos' : `Ver todas (${sources.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displaySources.map((source, index) => (
          <div
            key={`${source.document_id}-${index}`}
            className="bg-white border border-gray-200 rounded-[12px] p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-['Fira_Mono'] font-semibold text-[#0013ff] text-sm flex-1">
                {source.title}
              </p>
              {source.page_number && (
                <span className="bg-[#0013ff] text-white text-xs px-2 py-1 rounded-full
                                 font-['Fira_Mono'] whitespace-nowrap">
                  Pág. {source.page_number}
                </span>
              )}
            </div>

            <p className="text-gray-700 text-xs line-clamp-2 font-['Inter'] mb-2">
              {source.content_excerpt}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-['Fira_Mono']">
              <span>Relevância: {Math.round(source.relevance_score * 100)}%</span>
              {source.chunk_index !== undefined && (
                <span>• Trecho {source.chunk_index + 1}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
