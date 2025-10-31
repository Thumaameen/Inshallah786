import { defineConfig, loadEnv, UserConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor';
              if (id.includes('@radix-ui')) return 'ui';
              return 'deps';
            }
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://ultra-queen-ai-raeesa.onrender.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});