/**
 * Global 404 Not Found page
 * Shown when a page is not found
 */

import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada | Mok Labs",
  description: "A página que você está procurando não foi encontrada.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Large Text */}
        <h1 className="text-9xl font-bold text-[#0013FF] mb-4">404</h1>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h2>

        <p className="text-lg text-gray-600 mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0013FF] hover:bg-[#0010cc] transition-colors"
          >
            Voltar para Home
          </Link>

          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Ver Blog
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Você também pode estar procurando por:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/pnld"
              className="text-[#0013FF] hover:underline"
            >
              PNLD Digital
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/#contact"
              className="text-[#0013FF] hover:underline"
            >
              Contato
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/politica-de-privacidade"
              className="text-[#0013FF] hover:underline"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
