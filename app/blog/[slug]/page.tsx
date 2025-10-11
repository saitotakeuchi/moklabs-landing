import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import {
  getPostBySlug,
  getAllPostSlugs,
  formatDate,
  getAdjacentPosts,
} from "@/lib/blog";
import { seoConfig } from "@/config/seoConfig";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post não encontrado | Mok Labs",
    };
  }

  const ogImage = `${seoConfig.home.url}/og-image.svg`;

  return {
    title: `${post.title} | Blog Mok Labs`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: "Mok Labs", url: seoConfig.home.url }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${seoConfig.home.url}/blog/${params.slug}`,
      siteName: "Mok Labs Blog",
      locale: "pt_BR",
      type: "article",
      publishedTime: post.date,
      authors: ["Mok Labs"],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
      creator: "@moklabs",
    },
    alternates: {
      canonical: `${seoConfig.home.url}/blog/${params.slug}`,
    },
  };
}

// MDX components for custom styling
const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-4xl font-bold text-mok-blue mt-8 mb-4" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-3xl font-bold text-mok-blue mt-8 mb-4" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-2xl font-bold text-mok-blue mt-6 mb-3" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-xl font-bold text-mok-blue mt-6 mb-3" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-mok-blue hover:underline font-medium"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="list-disc list-inside text-gray-700 mb-4 space-y-2"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="list-decimal list-inside text-gray-700 mb-4 space-y-2"
      {...props}
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 border-mok-blue bg-mok-green/10 pl-4 py-2 my-4 italic"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="bg-gray-100 text-mok-blue px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm"
      {...props}
    />
  ),
  img: ({ alt, src, width, height, ...rest }: ComponentPropsWithoutRef<"img">) => (
    <span className="block relative w-full h-auto my-6">
      <Image
        src={src ?? ""}
        alt={alt ?? ""}
        width={typeof width === 'number' ? width : 1200}
        height={typeof height === 'number' ? height : 675}
        className="rounded-lg w-full h-auto"
        {...rest}
      />
    </span>
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-gray-300" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-gray-300" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="px-4 py-2 bg-mok-green/20 text-mok-blue font-bold text-left"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-2 border-b border-gray-200 text-gray-700"
      {...props}
    />
  ),
} satisfies MDXComponents;

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getAdjacentPosts(params.slug);

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${seoConfig.home.url}/og-image.svg`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Mok Labs",
      url: seoConfig.home.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Mok Labs",
      logo: {
        "@type": "ImageObject",
        url: `${seoConfig.home.url}/logo-moklabs.svg`,
      },
    },
    keywords: post.tags.join(", "),
    articleBody: post.content,
    url: `${seoConfig.home.url}/blog/${params.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${seoConfig.home.url}/blog/${params.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-2 text-gray-500">
              <li>
                <Link
                  href="/"
                  className="hover:text-mok-blue transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-mok-blue transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-700 font-medium">{post.title}</li>
            </ol>
          </nav>

          {/* Post Header */}
          <header className="mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-4xl sm:text-5xl font-bold text-mok-blue mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <time dateTime={post.date} className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(post.date)}
              </time>

              <span className="text-gray-400">•</span>

              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {post.readingTime}
              </span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-mok-green/20 text-mok-blue text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [
                      rehypePrettyCode,
                      {
                        theme: "github-dark",
                        keepBackground: true,
                      },
                    ],
                  ],
                },
              }}
            />
          </div>

          {/* Previous/Next Navigation */}
          {(previous || next) && (
            <nav className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous Post */}
                {previous && (
                  <Link
                    href={`/blog/${previous.slug}`}
                    className="group bg-gray-50 hover:bg-mok-green/10 rounded-lg p-6 transition-all duration-300 border border-gray-200 hover:border-mok-blue/30"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Post anterior
                    </div>
                    <h3 className="text-lg font-bold text-mok-blue group-hover:text-mok-blue/80 transition-colors line-clamp-2">
                      {previous.title}
                    </h3>
                  </Link>
                )}

                {/* Next Post */}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group bg-gray-50 hover:bg-mok-green/10 rounded-lg p-6 transition-all duration-300 border border-gray-200 hover:border-mok-blue/30 md:col-start-2 md:text-right"
                  >
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-2">
                      Próximo post
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-mok-blue group-hover:text-mok-blue/80 transition-colors line-clamp-2">
                      {next.title}
                    </h3>
                  </Link>
                )}
              </div>
            </nav>
          )}

          {/* Back to Blog Link */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
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
              Voltar para o blog
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
