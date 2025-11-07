import { defineConfig, loadEnv, UserConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [
      react({
        babel: {
          plugins: ['@babel/plugin-transform-react-jsx']
        }
      })
    ],
    build: {
      target: 'esnext',
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
              }
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              return 'vendor';
            }
          }
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
              warning.code === 'CIRCULAR_DEPENDENCY' ||
              warning.code === 'THIS_IS_UNDEFINED') return;
          warn(warning);
        },
        maxParallelFileOps: 2
      },
      chunkSizeWarningLimit: 2000,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      reportCompressedSize: false,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@tanstack/react-query'],
      force: true,
      esbuildOptions: {
        target: 'esnext',
        supported: { 
          'top-level-await': true 
        }
      }
    },
    esbuild: {
      jsx: 'automatic',
      loader: 'tsx',
      target: 'esnext',
      platform: 'browser'
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: false,
      hmr: {
        clientPort: 443
      },
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});