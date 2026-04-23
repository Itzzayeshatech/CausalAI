import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a NaN-related error
    if (error.message && error.message.includes('NaN')) {
      console.warn('NaN error detected in chart rendering');
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 opacity-50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-sm font-medium">Chart unavailable</p>
            <p className="text-xs mt-1">Please refresh the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
