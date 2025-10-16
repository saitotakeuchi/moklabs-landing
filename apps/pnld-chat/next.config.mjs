/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pnld-chat',
  reactStrictMode: true,
  transpilePackages: ['@moklabs/ui', '@moklabs/database', '@moklabs/config'],
};

export default nextConfig;
