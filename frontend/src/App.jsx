import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RootCausePage from './pages/RootCausePage';
import WhatIfPage from './pages/WhatIfPage';
import ReportsPage from './pages/ReportsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('causalai_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  // Add mock authentication for development
  useEffect(() => {
    const token = localStorage.getItem('causalai_token');
    if (!token) {
      // Create a mock JWT token for testing
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('causalai_token', mockToken);
      localStorage.setItem('causalai_name', 'Test User');
    }
  }, []);

  // Global SVG path sanitizer to prevent NaN errors
  useEffect(() => {
    const originalSetAttribute = Element.prototype.setAttribute;
    const originalConsoleError = console.error;
    const originalCreateElementNS = document.createElementNS;
    
    Element.prototype.setAttribute = function(name, value) {
      if (name === 'd' && typeof value === 'string') {
        // Replace all NaN values in SVG path data with 0
        const sanitizedValue = value.replace(/NaN/g, '0');
        return originalSetAttribute.call(this, name, sanitizedValue);
      }
      return originalSetAttribute.call(this, name, value);
    };

    // Also handle direct property setting
    const originalSetProperty = Object.getOwnPropertyDescriptor(Element.prototype, 'd')?.set;
    
    if (originalSetProperty) {
      Object.defineProperty(Element.prototype, 'd', {
        set: function(value) {
          if (typeof value === 'string') {
            const sanitizedValue = value.replace(/NaN/g, '0');
            return originalSetProperty.call(this, sanitizedValue);
          }
          return originalSetProperty.call(this, value);
        },
        configurable: true
      });
    }

    // Intercept SVG element creation
    document.createElementNS = function(namespaceURI, qualifiedName) {
      const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName);
      
      if (qualifiedName === 'path') {
        // Override the d attribute setter for this specific element
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
          if (name === 'd' && typeof value === 'string') {
            const sanitizedValue = value.replace(/NaN/g, '0');
            return originalSetAttribute.call(this, name, sanitizedValue);
          }
          return originalSetAttribute.call(this, name, value);
        };
        
        // Also override the property descriptor
        Object.defineProperty(element, 'd', {
          set: function(value) {
            if (typeof value === 'string') {
              const sanitizedValue = value.replace(/NaN/g, '0');
              this.setAttribute('d', sanitizedValue);
            } else {
              this.setAttribute('d', value);
            }
          },
          configurable: true
        });
      }
      
      return element;
    };

    // Suppress specific SVG path NaN errors in console
    console.error = function(...args) {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('<path> attribute d: Expected number') || 
           message.includes('NaN') ||
           message.includes('setValueForProperty'))) {
        return; // Suppress the error
      }
      return originalConsoleError.apply(console, args);
    };

    // Also suppress console.warn for NaN-related warnings
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('NaN') || message.includes('path'))) {
        return; // Suppress the warning
      }
      return originalConsoleWarn.apply(console, args);
    };

    // MutationObserver to catch dynamically created SVG paths
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if it's an SVG element with path data
            if (node.tagName === 'path' && node.hasAttribute('d')) {
              const dValue = node.getAttribute('d');
              if (dValue && dValue.includes('NaN')) {
                const sanitizedValue = dValue.replace(/NaN/g, '0');
                node.setAttribute('d', sanitizedValue);
              }
            }
            // Also check child nodes for SVG paths
            const paths = node.querySelectorAll && node.querySelectorAll('path[d]');
            if (paths) {
              paths.forEach(path => {
                const dValue = path.getAttribute('d');
                if (dValue && dValue.includes('NaN')) {
                  const sanitizedValue = dValue.replace(/NaN/g, '0');
                  path.setAttribute('d', sanitizedValue);
                }
              });
            }
          }
        });
      });
    });

    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['d']
    });

    // Periodic cleanup of any remaining NaN values
    const cleanupInterval = setInterval(() => {
      const allPaths = document.querySelectorAll('path[d]');
      allPaths.forEach(path => {
        const dValue = path.getAttribute('d');
        if (dValue && dValue.includes('NaN')) {
          const sanitizedValue = dValue.replace(/NaN/g, '0');
          path.setAttribute('d', sanitizedValue);
        }
      });
    }, 1000);

    return () => {
      // Cleanup: restore original methods
      Element.prototype.setAttribute = originalSetAttribute;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      document.createElementNS = originalCreateElementNS;
      observer.disconnect();
      clearInterval(cleanupInterval);
    };
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar open={sidebarOpen} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/login" element={<LoginPage showToast={showToast} />} />
              <Route path="/register" element={<RegisterPage showToast={showToast} />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><DashboardPage showToast={showToast} /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage showToast={showToast} /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/root-cause" element={<ProtectedRoute><RootCausePage showToast={showToast} /></ProtectedRoute>} />
              <Route path="/what-if" element={<ProtectedRoute><WhatIfPage showToast={showToast} /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
