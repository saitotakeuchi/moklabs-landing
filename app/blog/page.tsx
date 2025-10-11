import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";
import { seoConfig } from "@/config/seoConfig";

export const metadata: Metadata = {
  title: "Blog | Mok Labs - Artigos sobre Desenvolvimento e Acessibilidade",
  description:
    "Artigos e insights sobre desenvolvimento de software, acessibilidade digital, PNLD e tecnologias educacionais.",
  keywords: [
    "blog",
    "desenvolvimento",
    "acessibilidade",
    "PNLD",
    "educação digital",
    "tecnologia",
  ],
  openGraph: {
    title: "Blog | Mok Labs",
    description:
      "Artigos e insights sobre desenvolvimento de software, acessibilidade digital e tecnologias educacionais.",
    url: `${seoConfig.home.url}/blog`,
    type: "website",
  },
  alternates: {
    canonical: `${seoConfig.home.url}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-mok-green/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-mok-blue mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Artigos, insights e novidades sobre desenvolvimento de software,
            acessibilidade digital, PNLD e tecnologias educacionais.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-mok-blue/30"
              >
                <div className="p-6">
                  {/* Date and Reading Time */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-mok-blue mb-3 group-hover:text-mok-blue/80 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-mok-green/20 text-mok-blue text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More Arrow */}
                  <div className="mt-4 flex items-center text-mok-blue font-medium group-hover:translate-x-2 transition-transform">
                    Ler mais
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-mok-green/20 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-mok-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Nenhum post publicado ainda
            </h3>
            <p className="text-gray-500">
              Em breve teremos conteúdo incrível por aqui!
            </p>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-mok-blue hover:text-mok-blue/80 font-medium transition-colors"
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
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
