'use client';

import { Phone, Mail, Instagram } from "iconoir-react";
import Link from "next/link";
import Image from "next/image";

export function CompactFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-8 md:px-32">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + Contact Icons */}
          <div className="flex items-center gap-6">
            <div className="relative w-[140px] h-[22px]">
              <Image
                src="/logo-moklabs.svg"
                alt="Mok Labs"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-gray-300">|</span>
            <a
              href="https://wa.me/5541936182622"
              className="text-[#0013ff] hover:text-[#cbff63] transition-colors"
              aria-label="WhatsApp"
              title="WhatsApp: +55 (41) 93618-2622"
            >
              <Phone className="w-5 h-5" />
            </a>

            <a
              href="mailto:contato@moklabs.com.br"
              className="text-[#0013ff] hover:text-[#cbff63] transition-colors"
              aria-label="E-mail"
              title="E-mail: contato@moklabs.com.br"
            >
              <Mail className="w-5 h-5" />
            </a>

            <a
              href="https://instagram.com/moklabs"
              className="text-[#0013ff] hover:text-[#cbff63] transition-colors"
              aria-label="Instagram"
              title="Instagram: @moklabs"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Privacy Policy Link */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link
              href="/politica-de-privacidade"
              className="font-sans hover:text-[#0013ff] transition-colors"
            >
              Política de Privacidade
            </Link>
            <span className="hidden sm:inline">•</span>
            <span className="font-sans">
              © {currentYear} Mok Labs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
