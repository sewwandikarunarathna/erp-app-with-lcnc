import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import { ToastProvider } from './features/shared/ToastContext';

function App() {
  return (
    <ToastProvider >
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/portal" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
