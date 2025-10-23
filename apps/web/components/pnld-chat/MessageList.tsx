'use client';

import { useEffect, useRef } from 'react';
import { Message, MessageProps } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: MessageProps[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-label="Histórico de mensagens"
    >
      {messages.map((message, index) => (
        <Message
          key={index}
          role={message.role}
          content={message.content}
          sources={message.sources}
          timestamp={message.timestamp}
        />
      ))}

      {isTyping && <TypingIndicator />}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
