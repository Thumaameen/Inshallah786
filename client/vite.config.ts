import { defineConfig, loadEnv, UserConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { LoadingProvider } from '@/contexts/loading-context';
import { useGlobalLoading } from '@/contexts/loading-context';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
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

function App() {
  return (
    <LoadingProvider>
      {/* Your app content */}
    </LoadingProvider>
  );
}

// Using the global loading
function YourComponent() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const handleAction = async () => {
    showLoading('Processing...');
    try {
      await someAsyncOperation();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}

// Using the inline loader
import { InlineLoader } from '@/components/ui/loading-screen';

function LoadingSection() {
  return <InlineLoader size="md" />;
}

// Using the button loader
import { ButtonLoader } from '@/components/ui/loading-screen';

function SubmitButton({ isLoading }) {
  return (
    <button disabled={isLoading}>
      {isLoading ? <ButtonLoader /> : 'Submit'}
    </button>
  );
}

function UserProfile() {
  const api = useApi({
    useGlobalLoader: true,
    loadingMessage: 'Loading profile...'
  });

  useEffect(() => {
    api.get('/api/profile');
  }, []);

  return /* your JSX */;
}

function SubmitForm() {
  const api = useApi({
    useGlobalLoader: false,
    showSuccessToast: true,
    successMessage: 'Form submitted successfully'
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await api.post('/api/submit', data);
      // Handle success
    } catch (error) {
      // Error is automatically shown in toast
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Button type="submit" disabled={api.isLoading}>
        {api.isLoading ? <ButtonLoader /> : 'Submit'}
      </Button>
    </form>
  );
}

function Dashboard() {
  const profileApi = useApi({
    useGlobalLoader: false
  });

  const documentsApi = useApi({
    useGlobalLoader: true,
    loadingMessage: 'Loading documents...'
  });

  useEffect(() => {
    // These will run in parallel
    profileApi.get('/api/profile');
    documentsApi.get('/api/documents');
  }, []);

  if (profileApi.isLoading) {
    return <InlineLoader size="sm" />;
  }

  return /* your JSX */;
}