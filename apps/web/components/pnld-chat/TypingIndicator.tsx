'use client';

export function TypingIndicator() {
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[70%] flex flex-col gap-2">
        <div className="bg-white border-2 border-[#0013ff] rounded-[24px] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-[#0013ff] rounded-full animate-bounce"
                style={{ animationDelay: '0ms', animationDuration: '1s' }}
              />
              <div
                className="w-2 h-2 bg-[#0013ff] rounded-full animate-bounce"
                style={{ animationDelay: '150ms', animationDuration: '1s' }}
              />
              <div
                className="w-2 h-2 bg-[#0013ff] rounded-full animate-bounce"
                style={{ animationDelay: '300ms', animationDuration: '1s' }}
              />
            </div>
            <span className="text-[#0013ff] text-sm font-['Fira_Mono'] ml-2">
              Copiloto está digitando...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
