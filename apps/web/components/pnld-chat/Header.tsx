"use client";

import { useState } from "react";
import Image from "next/image";

interface HeaderProps {
  selectedEdital: string | null;
  onEditalSelect: (editalId: string) => void;
  availableEditais: Array<{ id: string; name: string }>;
}

export function Header({
  selectedEdital,
  onEditalSelect,
  availableEditais,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedEditalName =
    availableEditais.find((e) => e.id === selectedEdital)?.name ||
    "Escolha o edital de interesse...";

  return (
    <div className="bg-[#0013ff] w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-32 py-4 md:py-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Logo + Copiloto PNLD Title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <div className="relative w-[120px] sm:w-[150px] md:w-[180px] h-[20px] sm:h-[24px] md:h-[28px] flex-shrink-0">
              <Image
                src="/logo-moklabs.svg"
                alt="Mok Labs Logo"
                fill
                className="object-contain"
              />
            </div>
            <p
              className="font-sans font-bold text-sm sm:text-base md:text-xl leading-[1.2]
                          text-[#cbff63] whitespace-nowrap hidden sm:block truncate"
            >
              | Copiloto PNLD
            </p>
          </div>

          {/* Edital Selector - replaces menu */}
          <div className="relative flex-shrink-0 max-w-[50%] sm:max-w-none">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border-2 border-[#0013ff] rounded-[16px]
                         flex items-center justify-between gap-2 sm:gap-3 md:gap-4
                         px-3 sm:px-4 py-2.5 sm:py-3
                         min-w-[140px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[350px]
                         min-h-[44px]
                         hover:bg-gray-50 active:bg-gray-100 transition-colors
                         touch-manipulation"
              aria-label="Selecionar edital"
              aria-expanded={isDropdownOpen}
            >
              <span
                className="font-sans text-sm md:text-base leading-[1.4]
                              text-[#0013ff] truncate"
              >
                {selectedEditalName}
              </span>
              <Image
                src="/figma-assets/aba3e76b37cdb597389d69fbbc0f523ccd38b66e.svg"
                alt=""
                width={20}
                height={20}
                className={`transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />

                {/* Dropdown Menu */}
                <div
                  className="absolute top-full right-0 left-0 mt-2 z-20
                                bg-white border-2 border-[#0013ff] rounded-[16px]
                                shadow-lg max-h-[300px] overflow-y-auto"
                >
                  {availableEditais.length === 0 ? (
                    <div
                      className="px-4 py-3 text-center text-gray-500
                                    font-sans text-sm"
                    >
                      Nenhum edital disponível
                    </div>
                  ) : (
                    availableEditais.map((edital) => (
                      <button
                        key={edital.id}
                        onClick={() => {
                          onEditalSelect(edital.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full px-4 py-3 text-left font-sans text-sm md:text-base
                          min-h-[44px] flex items-center
                          hover:bg-[#0013ff] hover:text-white transition-colors
                          active:bg-[#0013cc] touch-manipulation
                          ${
                            selectedEdital === edital.id
                              ? "bg-[#cbff63] text-[#0013ff]"
                              : "text-[#0013ff]"
                          }
                        `}
                      >
                        {edital.name}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
