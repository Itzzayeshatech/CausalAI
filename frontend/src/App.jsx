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
