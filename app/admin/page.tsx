export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-mok-blue mb-6">
          Mok Labs Blog Admin
        </h1>

        <div className="bg-mok-green/10 border border-mok-green p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-mok-blue mb-4">
            Tina CMS Setup Required
          </h2>
          <p className="text-gray-700 mb-4">
            To use the visual editor, please configure Tina CMS:
          </p>
          <ol className="text-left text-gray-700 space-y-2 mb-4">
            <li>
              1. Sign up for a free Tina account at{" "}
              <a
                href="https://tina.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mok-blue hover:underline"
              >
                tina.io
              </a>
            </li>
            <li>2. Get your Client ID and Token</li>
            <li>
              3. Add them to <code className="bg-gray-200 px-2 py-1 rounded">
.env.local</code>
            </li>
            <li>
              4. Run <code className="bg-gray-200 px-2 py-1 rounded">
npm run dev:tina</code>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-mok-blue">
            Alternative: Use the Webhook API
          </h3>
          <p className="text-gray-600 mb-4">
            Create blog posts programmatically using the webhook endpoint.
          </p>
          <a
            href="/blog"
            className="inline-block px-6 py-3 bg-mok-blue text-white rounded-lg hover:bg-mok-blue/90 transition-colors mr-4"
          >
            View Blog
          </a>
          <a
            href="https://github.com/saitotakeuchi/moklabs-landing/blob/main/docs/BLOG_MANAGEMENT.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gray-200 text-mok-blue rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
