import Link from "next/link";
import { getAllPosts, getPostsByTag, formatDate } from "@/lib/blog";
import type { BlogPostMetadata } from "@/lib/blog";

interface BlogSectionProps {
  filterTag?: string;
}

const BlogSection = ({ filterTag }: BlogSectionProps) => {
  // Get posts, filtered by tag if provided
  const allPosts = filterTag ? getPostsByTag(filterTag) : getAllPosts();

  // Get only the last 3 posts
  const recentPosts = allPosts.slice(0, 3);

  // Don't render if no posts
  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="bg-white py-16 md:py-24">
      <div className="max-w-[1184px] mx-auto px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-mok-blue text-[32px] font-bold leading-[1.2] mb-4">
            Blog
          </h2>
          <p className="text-gray-600 text-[16px] leading-[1.6] max-w-[600px] mx-auto">
            Fique por dentro das novidades e melhores práticas em acessibilidade
            digital
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {recentPosts.map((post: BlogPostMetadata) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-4 p-6 rounded-lg border border-gray-200 hover:border-mok-blue hover:shadow-lg transition-all duration-300"
            >
              {/* Post Date and Reading Time */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>

              {/* Post Title */}
              <h3 className="text-mok-blue text-[20px] font-bold leading-[1.3] group-hover:text-mok-blue/80 transition-colors">
                {post.title}
              </h3>

              {/* Post Description */}
              <p className="text-gray-600 text-[14px] leading-[1.6] line-clamp-3">
                {post.description}
              </p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-mok-green/20 text-mok-blue rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {allPosts.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-mok-blue text-white font-semibold rounded-full hover:bg-mok-blue/90 transition-colors"
            >
              Ver todos os artigos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
