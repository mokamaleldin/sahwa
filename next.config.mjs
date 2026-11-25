/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Embedded PostgreSQL is only loaded for local development (SAHWA_LOCAL_DB).
  serverExternalPackages: ['@electric-sql/pglite'],
  outputFileTracingIncludes: { '/api/studio': ['./studio/index.html'], '/**': ['./db/migrations/004-platform.sql'] },
  async redirects() {
    return [{ source: '/contact', destination: '/social', permanent: true }];
  },
};
export default nextConfig;
