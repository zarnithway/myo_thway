import { createHash } from 'node:crypto';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawSlug = (env.ADMIN_SECRET_SLUG || env.VITE_ADMIN_SLUG || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');

  // Neverallow "/admin" as the secret slug; hash with domain salt so plaintext slug never enters JS bundle
  const adminRouteHash =
    rawSlug.length > 0 && rawSlug.toLowerCase() !== 'admin'
      ? createHash('sha256').update(`umt-route-v1:${rawSlug}`).digest('hex')
      : '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ADMIN_ROUTE_HASH__: JSON.stringify(adminRouteHash),
    },
  };
});
