'use client';

import { useState } from 'react';
import { MessageProps } from './Message';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';

interface ChatInterfaceProps {
  selectedEdital: string | null;
  onEditalSelect: (editalId: string) => void;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInterface({
  selectedEdital,
  onEditalSelect,
  onSendMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: MessageProps = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call the parent's send message handler
      await onSendMessage(content);

      // Note: The parent component should handle adding the assistant's response
      // via the messages prop or a callback

    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage: MessageProps = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

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
          <MessageList messages={messages} isTyping={isTyping} />
        )}
      </div>

      {/* Input Section */}
      <div className="bg-[#0013ff] px-8 md:px-32 py-8">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!selectedEdital || isTyping}
          placeholder={
            selectedEdital
              ? "Digite sua pergunta sobre o PNLD..."
              : "Selecione um edital primeiro..."
          }
        />
      </div>
    </div>
  );
}
