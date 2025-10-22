'use client';

import { useState } from 'react';
import Image from 'next/image';

interface HeaderProps {
  selectedEdital: string | null;
  onEditalSelect: (editalId: string) => void;
  availableEditais: Array<{ id: string; name: string }>;
}

export function Header({ selectedEdital, onEditalSelect, availableEditais }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedEditalName =
    availableEditais.find(e => e.id === selectedEdital)?.name ||
    'Escolha o edital de interesse...';

  return (
    <div className="bg-[#0013ff] w-full">
      <div className="container mx-auto px-8 md:px-32 py-8">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="relative w-[220px] h-[32px]">
              <Image
                src="/figma-assets/ef0506ed016aa13598712c377a66cc7c5637ea0e.svg"
                alt="Mok Labs Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-['Fira_Mono'] font-bold text-2xl leading-[1.2]
                          text-[#cbff63] whitespace-nowrap">
              | Copiloto PNLD
            </p>
          </div>

          {/* Edital Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border-2 border-[#0013ff] rounded-[16px]
                         flex items-center justify-between gap-4 px-4 py-4 min-w-[300px] md:min-w-[400px]
                         hover:bg-gray-50 transition-colors"
              aria-label="Selecionar edital"
              aria-expanded={isDropdownOpen}
            >
              <span className="font-['Fira_Mono'] text-base leading-[1.4]
                              text-[#0013ff] truncate">
                {selectedEditalName}
              </span>
              <Image
                src="/figma-assets/aba3e76b37cdb597389d69fbbc0f523ccd38b66e.svg"
                alt=""
                width={24}
                height={24}
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
                <div className="absolute top-full left-0 right-0 mt-2 z-20
                                bg-white border-2 border-[#0013ff] rounded-[16px]
                                shadow-lg max-h-[300px] overflow-y-auto">
                  {availableEditais.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500
                                    font-['Fira_Mono'] text-sm">
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
                          w-full px-4 py-3 text-left font-['Fira_Mono'] text-base
                          hover:bg-[#0013ff] hover:text-white transition-colors
                          ${selectedEdital === edital.id
                            ? 'bg-[#cbff63] text-[#0013ff]'
                            : 'text-[#0013ff]'
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
