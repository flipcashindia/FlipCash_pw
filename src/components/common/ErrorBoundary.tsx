// src/components/common/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can customize this fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <h2 className="text-2xl font-bold mb-4">Partner Access Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            You need to be logged in as a partner to view leads.
          </p>
          <div className="flex gap-4">
            {/* <Link 
              to="/login" 
              className="bg-brand-yellow hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded"
            >
              Partner Login
            </Link> */}
            <Link 
              to="/partner-signup" 
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}