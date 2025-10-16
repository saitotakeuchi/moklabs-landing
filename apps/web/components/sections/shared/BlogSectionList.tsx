import Link from "next/link";
import { getAllPosts, getPostsByTag, formatDate } from "@/lib/blog";
import type { BlogPostMetadata } from "@/lib/blog";

interface BlogSectionListProps {
  filterTag?: string;
}

const BlogSectionList = ({ filterTag }: BlogSectionListProps) => {
  // Get posts, filtered by tag if provided
  const allPosts = filterTag ? getPostsByTag(filterTag) : getAllPosts();

  // Get only the last 3 posts
  const recentPosts = allPosts.slice(0, 3);

  // Don't render if no posts
  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="bg-white py-12 md:py-16">
      <div className="max-w-[1184px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="text-mok-blue text-[24px] md:text-[28px] font-bold leading-[1.2] mb-6">
          Últimas do Blog
        </h2>

        {/* Blog Posts List */}
        <div className="space-y-4">
          {recentPosts.map((post: BlogPostMetadata) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-start gap-4 py-3 hover:translate-x-2 transition-transform duration-200"
            >
              {/* Post Date */}
              <time
                dateTime={post.date}
                className="text-gray-500 text-[14px] shrink-0 min-w-[100px]"
              >
                {formatDate(post.date)}
              </time>

              {/* Post Title */}
              <h3 className="text-mok-blue text-[16px] font-semibold leading-[1.4] group-hover:text-mok-blue/70 transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* See More Link */}
        <div className="mt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-mok-blue text-[14px] font-semibold hover:text-mok-blue/70 transition-colors"
          >
            Ver mais artigos
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSectionList;
