'use client';

import { useEffect } from 'react';
import { usePnldChat } from '@/hooks/usePnldChat';
import { MessageProps } from './Message';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';

interface ChatInterfaceProps {
  selectedEdital: string | null;
  onEditalSelect: (editalId: string) => void;
}

export function ChatInterface({
  selectedEdital,
  onEditalSelect
}: ChatInterfaceProps) {
  // Use the PNLD chat hook with the selected edital
  const {
    messages: chatMessages,
    isLoading,
    error,
    sources,
    sendMessage,
    clearConversation
  } = usePnldChat({
    editalId: selectedEdital || undefined,
  });

  // Clear conversation when edital changes
  useEffect(() => {
    clearConversation();
  }, [selectedEdital, clearConversation]);

  const handleSendMessage = async (content: string) => {
    if (!selectedEdital) {
      console.warn('No edital selected');
      return;
    }

    await sendMessage(content);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Convert chat messages to component message format
  const messages: MessageProps[] = chatMessages.map((msg, index) => {
    const isLastAssistantMessage =
      msg.role === 'assistant' &&
      index === chatMessages.length - 1;

    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      // Only show sources on the last assistant message
      sources: isLastAssistantMessage && msg.role === 'assistant' ? sources : undefined,
    };
  });

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasMessages ? (
          <EmptyState
            selectedEdital={selectedEdital}
            onSuggestedQuestionClick={handleSuggestedQuestion}
          />
        ) : (
          <MessageList messages={messages} isTyping={isLoading} />
        )}
      </div>

      {/* Input Section */}
      <div className="bg-[#0013ff] px-8 md:px-32 py-8">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!selectedEdital || isLoading}
          placeholder={
            selectedEdital
              ? "Digite sua pergunta sobre o PNLD..."
              : "Selecione um edital primeiro..."
          }
        />
      </div>

      {/* Error display (optional) */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-8 mb-4">
          <p className="text-sm text-red-700">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );
}
