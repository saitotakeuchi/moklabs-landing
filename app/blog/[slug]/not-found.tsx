import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-mok-green/20 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-mok-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-mok-blue mb-4">
          Post não encontrado
        </h1>

        <p className="text-gray-600 mb-8">
          Desculpe, o post que você está procurando não existe ou foi removido.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-mok-blue text-white font-medium rounded-lg hover:bg-mok-blue/90 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar ao Blog
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-mok-blue text-mok-blue font-medium rounded-lg hover:bg-mok-blue hover:text-white transition-colors"
          >
            Ir para Home
          </Link>
        </div>
      </div>
    </div>
  );
}
