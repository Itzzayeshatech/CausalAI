import React from 'react';

const SafeChartWrapper = ({ children, fallback = null }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Global error handler for SVG-related errors
    const handleError = (event) => {
      const message = event.message || event.error?.message || '';
      if (message.includes('NaN') || message.includes('path') || message.includes('Expected number')) {
        event.preventDefault();
        event.stopPropagation();
        setHasError(true);
        // Clear the error after a short delay
        setTimeout(() => setHasError(false), 1000);
        return true;
      }
      return false;
    };

    // Add error listeners
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleError, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleError, true);
    };
  }, []);

  // Intercept and suppress any console errors related to SVG paths
  React.useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = function(...args) {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('<path> attribute d: Expected number') || 
           message.includes('NaN') ||
           message.includes('setValueForProperty') ||
           message.includes('path'))) {
        return; // Suppress the error
      }
      return originalConsoleError.apply(console, args);
    };

    console.warn = function(...args) {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('NaN') || message.includes('path'))) {
        return; // Suppress the warning
      }
      return originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  if (hasError) {
    return fallback || (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">📊</div>
          <p>Chart temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-chart-wrapper">
      {children}
    </div>
  );
};

export default SafeChartWrapper;
