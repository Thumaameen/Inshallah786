import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class IntegrationErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

public static getDerivedStateFromError(error: Error): State {
  return {
    hasError: true,
    error,
    errorInfo: null,
    retryCount: 0
  };
}
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to backend
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Integration Error</h2>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
            <div className="flex gap-2">
              <button onClick={this.handleRetry} className="btn btn-primary">
                Retry ({this.maxRetries - this.state.retryCount} attempts left)
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            onClick={() => {
              // Attempt recovery
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}