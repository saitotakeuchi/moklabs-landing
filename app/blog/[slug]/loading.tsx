/**
 * Blog post loading UI
 * Shown while loading individual blog post
 */

export default function BlogPostLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-12 animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-8">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="prose prose-lg max-w-none animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mt-8 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </article>
    </div>
  );
}
