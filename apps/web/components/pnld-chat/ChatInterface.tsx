"use client";

import { useEffect } from "react";
import { usePnldChat } from "@/hooks/usePnldChat";
import { MessageProps } from "./Message";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

interface ChatInterfaceProps {
  selectedEdital: string | null;
  onEditalSelect?: (editalId: string) => void;
}

export function ChatInterface({ selectedEdital }: ChatInterfaceProps) {
  // Use the PNLD chat hook with the selected edital
  const {
    messages: chatMessages,
    isLoading,
    error,
    sources,
    sendMessage,
    clearConversation,
  } = usePnldChat({
    editalId: selectedEdital || undefined,
  });

  // Clear conversation when edital changes
  useEffect(() => {
    clearConversation();
  }, [selectedEdital, clearConversation]);

  const handleSendMessage = async (content: string) => {
    if (!selectedEdital) {
      console.warn("No edital selected");
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
      msg.role === "assistant" && index === chatMessages.length - 1;

    return {
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      // Only show sources on the last assistant message
      sources:
        isLastAssistantMessage && msg.role === "assistant"
          ? sources
          : undefined,
    };
  });

  const hasMessages = messages.length > 0;

  // Only show typing indicator if loading AND no assistant message is streaming yet
  const isTyping =
    isLoading &&
    (chatMessages.length === 0 ||
      chatMessages[chatMessages.length - 1]?.role !== "assistant");

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Chat Content - Centered with max width on large screens */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-[1280px] flex flex-col overflow-hidden">
            {!hasMessages ? (
              <EmptyState
                selectedEdital={selectedEdital}
                onSuggestedQuestionClick={handleSuggestedQuestion}
              />
            ) : (
              <MessageList messages={messages} isTyping={isTyping} />
            )}
          </div>
        </div>
      </div>

      {/* Input Section - Centered with max width on large screens */}
      <div className="bg-[#0013ff] px-4 sm:px-6 md:px-8 lg:px-32 py-6 sm:py-7 md:py-8 flex justify-center">
        <div className="w-full max-w-[1280px]">
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
      </div>

      {/* Error display with retry */}
      {error && (
        <div className="mx-4 sm:mx-6 md:mx-8 mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Erro ao processar mensagem
                </p>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
                <button
                  onClick={() => {
                    const lastUserMessage = messages
                      .filter((m) => m.role === "user")
                      .pop();
                    if (lastUserMessage) {
                      sendMessage(lastUserMessage.content);
                    }
                  }}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
                >
                  Tentar novamente
                </button>
              </div>
              <button
                onClick={() => clearConversation()}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label="Fechar erro"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
