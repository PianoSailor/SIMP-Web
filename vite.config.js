import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function adminIdentityScriptPlugin() {
  const sourcePath = path.resolve(process.cwd(), 'src/admin/identity-init.js')

  const serveIdentityScript = (req, res, next) => {
    const [pathname] = (req.url || '').split('?')
    if (pathname !== '/admin/identity-init.js') {
      next()
      return
    }

    const source = fs.readFileSync(sourcePath, 'utf8')
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.statusCode = 200
    res.end(source)
  }

  return {
    name: 'admin-identity-script',
    configureServer(server) {
      server.middlewares.use(serveIdentityScript)
    },
    generateBundle() {
      const source = fs.readFileSync(sourcePath, 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'admin/identity-init.js',
        source,
      })
    },
  }
}

function adminRewritePlugin() {
  const isDebugRun = process.argv.includes('--debug')

  const rewriteAdmin = (req, _res, next) => {
    const [pathname] = (req.url || '').split('?')
    if (pathname === '/admin' || pathname === '/admin/') {
      req.url = '/admin/index.html'
    }
    next()
  }

  const debugCookieMiddleware = (req, res, next) => {
    const [pathname] = (req.url || '').split('?')
    if (pathname?.startsWith('/admin')) {
      if (isDebugRun) {
        res.setHeader('Set-Cookie', 'simp_debug=1; Path=/; SameSite=Lax')
      } else {
        res.setHeader('Set-Cookie', 'simp_debug=; Path=/; Max-Age=0; SameSite=Lax')
      }
    }
    next()
  }

  const debugConfigMiddleware = (req, res, next) => {
    if (!isDebugRun) {
      next()
      return
    }

    const [pathname] = (req.url || '').split('?')
    if (pathname !== '/admin/config.yml') {
      next()
      return
    }

    const configPath = path.resolve(process.cwd(), 'public/admin/config.yml')
    let raw = fs.readFileSync(configPath, 'utf8')
    raw = raw.replace(/backend:\n[\s\S]*?\n\npublish_mode:/, 'backend:\n  name: test-repo\n\npublish_mode:')

    res.setHeader('Content-Type', 'text/yaml; charset=utf-8')
    res.statusCode = 200
    res.end(raw)
  }

  return {
    name: 'admin-rewrite',
    configureServer(server) {
      server.middlewares.use(debugCookieMiddleware)
      server.middlewares.use(rewriteAdmin)
      server.middlewares.use(debugConfigMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(debugCookieMiddleware)
      server.middlewares.use(rewriteAdmin)
      server.middlewares.use(debugConfigMiddleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), adminIdentityScriptPlugin(), adminRewritePlugin()],
})
