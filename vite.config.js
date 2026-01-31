import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // same as 0.0.0.0 (required in containers)
    port: 5173,
    strictPort: true,    // fail if 5173 is taken instead of switching ports
    allowedHosts: [
      "bethany-wasteless-shasta.ngrok-free.dev",
      "komodo.tail0c553b.ts.net"
      // "localhost",
    ],
  },
});
