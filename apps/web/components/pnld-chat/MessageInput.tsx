"use client";

import { useState, FormEvent, KeyboardEvent } from "react";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full">
        {/* Input Field */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
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
                     touch-manipulation"
          aria-label="Digite sua pergunta"
        />

        {/* Send Button - Inside Input */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`absolute right-1 top-1/2 -translate-y-1/2
                     rounded-[8px]
                     w-9 h-9 sm:w-10 sm:h-10
                     flex items-center justify-center
                     font-bold text-lg text-[#0013ff]
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
          &gt;
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
