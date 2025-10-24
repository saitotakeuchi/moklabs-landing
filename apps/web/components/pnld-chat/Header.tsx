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
      <div className="container mx-auto px-8 md:px-32 py-6">
        <div className="flex items-center justify-between gap-6">
          {/* Logo + Copiloto PNLD Title */}
          <div className="flex items-center gap-4">
            <div className="relative w-[180px] h-[28px]">
              <Image
                src="/logo-moklabs.svg"
                alt="Mok Labs Logo"
                fill
                className="object-contain"
              />
            </div>
            <p
              className="font-sans font-bold text-xl leading-[1.2]
                          text-[#cbff63] whitespace-nowrap hidden md:block"
            >
              | Copiloto PNLD
            </p>
          </div>

          {/* Edital Selector - replaces menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border-2 border-[#0013ff] rounded-[16px]
                         flex items-center justify-between gap-4 px-4 py-3 min-w-[250px] md:min-w-[350px]
                         hover:bg-gray-50 transition-colors"
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
                          hover:bg-[#0013ff] hover:text-white transition-colors
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
