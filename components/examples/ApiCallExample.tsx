/**
 * Example component demonstrating proper error handling and loading states
 * This serves as a reference for implementing API calls throughout the app
 */
import { useEffect } from 'react';
import { useApi, useFormSubmit } from '@/hooks/useApi';
import { Alert } from '@/components/ui/alert';
import { Loading, LoadingButton } from '@/components/ui/loading';

/**
 * Example 1: Fetching data with automatic error/loading handling
 */
export function DataFetchExample() {
  const { data, error, loading, execute } = useApi<{ message: string }>('/api/health');

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) {
    return <Loading size="lg" text="Loading server status..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" title="Failed to load">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Alert variant="success" title="Server is healthy">
      Status: {data.message}
    </Alert>
  );
}

/**
 * Example 2: Form submission with error handling
 */
export function FormSubmitExample() {
  const { loading, error, success, submit } = useFormSubmit('/api/auth/login', {
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Redirect or update UI
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await submit({
        email: formData.get('email'),
        password: formData.get('password'),
      });
    } catch (err) {
      // Error is already handled by the hook
      console.error('Login failed');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" title="Login failed">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" title="Success">
          Login successful! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          disabled={loading}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          disabled={loading}
          className="w-full p-2 border rounded"
        />

        <LoadingButton
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full p-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </LoadingButton>
      </form>
    </div>
  );
}

/**
 * Example 3: Manual retry with error state
 */
export function RetryableRequestExample() {
  const { data, error, loading, execute } = useApi('/api/data', {
    onError: (err) => {
      console.error('Failed to fetch data:', err);
    },
  });

  return (
    <div className="space-y-4">
      {loading && <Loading text="Fetching data..." />}

      {error && (
        <Alert variant="destructive" title="Error loading data">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => execute()}
            className="text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </Alert>
      )}

      {data && (
        <Alert variant="success">
          Data loaded successfully
        </Alert>
      )}

      {!loading && !error && !data && (
        <button
          onClick={() => execute()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Load Data
        </button>
      )}
    </div>
  );
}
