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
      <div className="flex gap-2 sm:gap-3 md:gap-4 items-start justify-center w-full">
        {/* Input Field */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-white border-2 border-[#0013ff]
                     rounded-[20px] sm:rounded-[24px]
                     px-3 sm:px-4 md:px-4
                     py-3 sm:py-3.5 md:py-4
                     font-['Inter'] text-sm sm:text-base leading-[1.4] text-[#0013ff]
                     placeholder:text-[#0013ff] placeholder:opacity-50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#0013ff] focus:ring-offset-2
                     min-h-[44px]
                     touch-manipulation"
          aria-label="Digite sua pergunta"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-[#ccff73] rounded-[20px] sm:rounded-[24px]
                     px-4 sm:px-5 md:px-6
                     py-3 sm:py-3.5 md:py-[15px]
                     min-h-[44px] sm:h-[50px] md:h-[54px]
                     font-sans font-bold text-sm sm:text-base leading-[1.2] text-[#0013ff]
                     whitespace-nowrap
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-[#b8e860] active:bg-[#a4d54d] transition-colors
                     focus:outline-none focus:ring-2 focus:ring-[#ccff73] focus:ring-offset-2
                     touch-manipulation"
          aria-label="Enviar mensagem"
        >
          Enviar
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
