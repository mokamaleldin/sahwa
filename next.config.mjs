/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/api/studio': ['./studio/index.html'] },
  async redirects() {
    return [{ source: '/contact', destination: '/social', permanent: true }];
  },
};
export default nextConfig;
