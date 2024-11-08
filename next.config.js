/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/create',
        destination: 'http://localhost:3004/mock/createadr',
      },
    ];
  },
};

module.exports = nextConfig;
