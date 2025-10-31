"use client";

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled,
  placeholder = "Digite sua pergunta sobre o PNLD...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full">
        {/* Textarea Field */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{ scrollbarWidth: "none" }}
          className="w-full bg-white border-2 border-gray-300
                     rounded-[12px]
                     pl-3 sm:pl-4 md:pl-4
                     pr-12 sm:pr-14
                     py-3 sm:py-3.5 md:py-4
                     font-inter text-sm sm:text-base leading-[1.4] text-gray-900
                     placeholder:text-gray-400
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:border-gray-400
                     min-h-[44px]
                     max-h-[120px]
                     resize-none
                     overflow-y-auto
                     overflow-x-hidden
                     touch-manipulation
                     [&::-webkit-scrollbar]:hidden"
          aria-label="Digite sua pergunta"
        />

        {/* Send Button - Inside, Bottom-Aligned */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`absolute right-3 sm:right-4 bottom-3 sm:bottom-3.5 md:bottom-4
                     rounded-full
                     w-8 h-8 sm:w-9 sm:h-9
                     flex items-center justify-center
                     transition-colors
                     focus:outline-none
                     touch-manipulation
                     ${
                       disabled || !message.trim()
                         ? "bg-gray-300 cursor-not-allowed opacity-50"
                         : "bg-[#cbff63] hover:bg-[#b8e860] active:bg-[#a4d54d]"
                     }`}
          aria-label="Enviar mensagem"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#0013ff]"
          >
            <path
              d="M8 3L13 8L8 13M13 8H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="font-sans text-xs sm:text-xs leading-[1.4] text-white text-center mt-3 sm:mt-4 px-2">
        As respostas são baseadas em documentos oficiais do FNDE. Nenhum
        conteúdo é gerado fora das fontes do edital.
      </p>
    </form>
  );
}
