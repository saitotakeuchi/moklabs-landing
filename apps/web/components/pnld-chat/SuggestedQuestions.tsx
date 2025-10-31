"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  onQuestionClick,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center justify-center w-full mt-2 sm:mt-4">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(question)}
          className="bg-white border-2 border-[#0013ff]
                     rounded-[12px]
                     px-4 sm:px-4 py-3 sm:py-4
                     min-h-[44px]
                     hover:bg-[#0013ff] hover:text-white
                     active:bg-[#0013cc]
                     transition-colors
                     font-inter text-sm sm:text-base leading-[1.4] text-[#0013ff]
                     touch-manipulation
                     text-center"
        >
          &quot;{question}&quot;
        </button>
      ))}
    </div>
  );
}
