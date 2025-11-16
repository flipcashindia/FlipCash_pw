// src/components/common/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  requirePartner?: boolean; // ✅ New prop to check partner access
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // ✅ Check if error is partner-related
      const isPartnerAccessError = 
        this.state.error?.message?.toLowerCase().includes('partner') ||
        this.state.error?.message?.toLowerCase().includes('unauthorized') ||
        this.props.requirePartner;

      // Show partner login only if it's an access error
      if (isPartnerAccessError) {
        return this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <h2 className="text-2xl font-bold mb-4">Partner Access Required</h2>
            <p className="text-gray-600 mb-6 text-center">
              You need to be logged in as a partner to view this page.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/partner/login" 
                className="bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Partner Login
              </Link>
              <Link 
                to="/partner-signup" 
                className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        );
      }

      // ✅ For other errors, show generic error with refresh option
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Something went wrong</h2>
            <p className="text-red-700 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#FEC925] hover:bg-[#e6b31f] text-[#1C1C1B] font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/partner/dashboard"
                className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}