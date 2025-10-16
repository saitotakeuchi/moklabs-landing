/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@moklabs/ui', '@moklabs/database', '@moklabs/config'],
};

export default nextConfig;
