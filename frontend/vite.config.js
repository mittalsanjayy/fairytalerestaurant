import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * Replaces %SITE_URL% in index.html and emits robots.txt + sitemap.xml at build
 * time, so the real domain only has to be set once (VITE_SITE_URL).
 */
function siteMeta(siteUrl) {
  const routes = ['/'] // public, indexable routes. /admin is intentionally excluded.
  return {
    name: 'fairytale-site-meta',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      const urls = routes
        .map((r) => `  <url><loc>${siteUrl}${r}</loc></url>`)
        .join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://your-domain.example').replace(/\/$/, '')

  return {
    plugins: [react(), siteMeta(siteUrl)],
    // Strip console.* and debugger from production bundles.
    esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Flask backend (Phase 4+). Lets the frontend call /api/... without CORS during development.
      proxy: {
        '/api': 'http://127.0.0.1:5000',
        '/uploads': 'http://127.0.0.1:5000',
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            gsap: ['gsap', '@gsap/react'],
          },
        },
      },
    },
  }
})
