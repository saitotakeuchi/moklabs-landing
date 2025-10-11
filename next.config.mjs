/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for highlighting potential problems
  reactStrictMode: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Image optimization configuration
  images: {
    // Add external image domains if needed
    remotePatterns: [
      // Example: Allow images from external CDN
      // {
      //   protocol: 'https',
      //   hostname: 'images.example.com',
      //   pathname: '/**',
      // },
    ],
    // Image formats to support
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects configuration
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true, // 308 permanent redirect
      // },
    ];
  },

  // Rewrites configuration
  async rewrites() {
    return [
      // Example rewrite
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Target modern browsers - skip unnecessary polyfills
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent core-js polyfills from being bundled
        'core-js/modules': false,
      };
    }
    return config;
  },

  // Compiler options for modern browsers
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features
  experimental: {
    // Enable optimistic client cache
    optimisticClientCache: true,
    // Enable CSS optimization
    optimizeCss: true,
  },

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Compression
  compress: true,

  // Power by header (remove for security)
  poweredByHeader: false,

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || 'https://moklabs.com.br',
  },
};

export default nextConfig;
