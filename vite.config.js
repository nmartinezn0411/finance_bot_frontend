import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Loads .env, .env.local, .env.[mode]...
  const env = loadEnv(mode, process.cwd(), '')

  const frontendUrl = env.VITE_FRONTEND_URL
  const port = env.VITE_FRONTEND_PORT

  return {
    plugins: [react()],
    server: {
      host: true,
      port: port,
      strictPort: true,
      allowedHosts: frontendUrl ? [frontendUrl] : true, 
    },
  }
})
