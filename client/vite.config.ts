import { defineConfig, loadEnv, UserConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        babel: {
          plugins: ['@babel/plugin-transform-react-jsx']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      force: true
    },
    esbuild: {
      jsx: 'automatic',
      jsxInject: `import React from 'react'`,
      loader: 'tsx'
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          },
        },
        onwarn(warning, warn) {
          // Suppress certain warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: {
        clientPort: 443
      },
      allowedHosts: [
        '.replit.dev',
        '.repl.co'
      ],
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