import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'build'
  },

  // Server configuration
  server: {
    port: 8080,
    host: 'localhost',
    allowedHosts: true,
    proxy: process.env.VITE_API_URL ? {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      }
    } : undefined
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
