import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches React errors and saves state for recovery
 * Prevents full app crashes and provides user-friendly error UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🚨 App crashed:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Save crash info to localStorage for debugging
    try {
      const crashData = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      localStorage.setItem('last_crash', JSON.stringify(crashData));
      console.log('💾 Crash data saved to localStorage for debugging');
    } catch (storageError) {
      console.error('Failed to save crash data:', storageError);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    // Clear error state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page to reset app state
    window.location.reload();
  };

  handleReportIssue = () => {
    const crashData = localStorage.getItem('last_crash');
    const githubIssueUrl = 'https://github.com/anthropics/claude-code/issues/new?title=App%20Crash&body=';
    const body = crashData
      ? encodeURIComponent(`App crashed with the following details:\n\n\`\`\`json\n${crashData}\n\`\`\``)
      : encodeURIComponent('App crashed but crash data could not be retrieved.');

    window.open(githubIssueUrl + body, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Error UI
      return (
        <div className="min-h-screen bg-[#f4f0f0] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#4b0f0d] mb-2">
                  Something went wrong
                </h1>
                <p className="text-[#9b9b9b] mb-4">
                  The application encountered an error and couldn't continue. Don't worry—your
                  data has been automatically saved to your browser's storage.
                </p>
              </div>
            </div>

            {/* Error details (collapsible) */}
            <details className="mb-6 bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-[#4b0f0d] mb-2">
                Technical Details (for debugging)
              </summary>
              <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-48">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                </div>
                {this.state.error?.stack && (
                  <div className="text-xs text-gray-500 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                )}
              </div>
            </details>

            {/* Recovery actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-[#780817] text-white font-bold rounded-lg hover:bg-[#4b0f0d] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Application
              </button>

              <button
                onClick={this.handleReportIssue}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report This Issue
              </button>
            </div>

            {/* Recovery tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Your data is safe
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Unsaved changes are backed up in your browser</li>
                <li>• Reload the app to restore your work</li>
                <li>• If problems persist, try clearing your browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
