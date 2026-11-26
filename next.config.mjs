/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Embedded PostgreSQL is only loaded for local development (SAHWA_LOCAL_DB).
  serverExternalPackages: ['@electric-sql/pglite'],
  outputFileTracingIncludes: { '/api/studio': ['./studio/index.html'], '/**': ['./db/migrations/004-platform.sql', './db/migrations/005-owner-email-login.sql', './db/migrations/006-platform-simplification.sql', './db/migrations/007-team-workspace.sql', './docs/guide/structure.md'] },
  async redirects() {
    return [{ source: '/contact', destination: '/social', permanent: true }];
  },
};
export default nextConfig;
