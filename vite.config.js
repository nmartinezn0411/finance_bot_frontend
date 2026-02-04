import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Loads .env, .env.local, .env.[mode]...
  const env = loadEnv(mode, process.cwd(), '')

  const frontendUrl = env.VITE_FRONTEND_URL

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: frontendUrl ? [frontendUrl] : true, 
    },
  }
})
