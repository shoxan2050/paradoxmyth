import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Path from './pages/Path';
import Lesson from './pages/Lesson';
import Test from './pages/Test';
import Result from './pages/Result';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';
import Contacts from './pages/Contacts';

function App() {
  console.log('App: Rendering full application');
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contacts" element={<Contacts />} />

            {/* Protected Routes - All authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/path" element={<Path />} />
              <Route path="/lesson" element={<Lesson />} />
              <Route path="/test" element={<Test />} />
              <Route path="/result" element={<Result />} />
            </Route>

            {/* Teacher/Admin Routes */}
            <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
              <Route path="/teacher" element={<Teacher />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
