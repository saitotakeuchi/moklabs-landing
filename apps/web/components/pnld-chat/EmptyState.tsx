"use client";

import Image from "next/image";
import { SuggestedQuestions } from "./SuggestedQuestions";

interface EmptyStateProps {
  selectedEdital: string | null;
  onSuggestedQuestionClick: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "Qual é o prazo de entrega?",
  "Quais são os arquivos digitais exigidos?",
  "Posso enviar o mesmo material para mais de um edital?",
];

export function EmptyState({
  selectedEdital,
  onSuggestedQuestionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 py-8 sm:py-12 px-4">
      {/* Avatar */}
      <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px]">
        <Image
          src="/figma-assets/eefa2557611fd660f2cce9c627ec7249b4224f49.png"
          alt="Copiloto Avatar"
          fill
          className="object-contain"
        />
        <Image
          src="/figma-assets/c7949993cbf057cec7d1d2befb18dbc9246bc768.png"
          alt="Copiloto Avatar Inner"
          width={156}
          height={156}
          className="absolute top-[13px] left-[13px] w-[86%] h-[86%]"
        />
      </div>

      {/* Welcome Message */}
      <div className="flex flex-col gap-3 sm:gap-4 items-center w-full max-w-3xl">
        <div className="font-sans font-bold text-base sm:text-lg md:text-xl leading-[1.3] text-[#0013ff] text-center px-2">
          <p className="mb-0">👋 Oi! Eu sou o Copiloto PNLD da MokLabs.</p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            Escolha um edital no menu superior e faça sua pergunta!
            <br className="hidden sm:inline" />
            <span className="inline sm:hidden"> </span>
            Eu te mostro o trecho oficial com a resposta.
          </p>
        </div>

        {/* Suggested Questions */}
        {selectedEdital && (
          <SuggestedQuestions
            questions={SUGGESTED_QUESTIONS}
            onQuestionClick={onSuggestedQuestionClick}
          />
        )}
      </div>

      {/* Warning when no edital selected */}
      {!selectedEdital && (
        <div
          className="bg-white border-2 border-[#0013ff]
                        rounded-[20px] sm:rounded-[24px]
                        flex gap-2 items-center justify-center
                        px-4 sm:px-4 py-4 sm:py-6
                        min-h-[44px]"
        >
          <Image
            src="/figma-assets/4a4eb96308682e17abfbbc706b848f44fbbbd6ce.svg"
            alt="Warning Icon"
            width={24}
            height={24}
          />
          <p
            className="font-sans font-bold text-base leading-[1.4]
                        text-[#0013ff] text-center whitespace-nowrap"
          >
            Selecione um edital para começar!
          </p>
        </div>
      )}
    </div>
  );
}
