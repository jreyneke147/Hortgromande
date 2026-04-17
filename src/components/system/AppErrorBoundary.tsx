import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h1 className="text-xl font-semibold">Unable to render this page</h1>
            <p className="mt-2 text-sm text-gray-600">
              A runtime error interrupted rendering. Refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Refresh Page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
