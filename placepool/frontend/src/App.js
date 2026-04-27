import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage         from './pages/LoginPage';
import SignupPage        from './pages/SignupPage';
import OTPPage           from './pages/OTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage     from './pages/DashboardPage';
import DSAPage           from './pages/DSAPage';
import SubjectsPage      from './pages/SubjectsPage';
import AptitudePage      from './pages/AptitudePage';
import CompaniesPage     from './pages/CompaniesPage';
import AdminPage         from './pages/AdminPage';
import Layout            from './components/shared/Layout';
console.log('API BASE:', process.env.REACT_APP_API_URL);

function Protected({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, border:'3px solid #ede9fe', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <div style={{ fontSize:13, color:'#9ca3af' }}>Loading PlacePool…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"           element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/signup"          element={user ? <Navigate to="/" /> : <SignupPage />} />
      <Route path="/verify-otp"      element={<OTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/"          element={<DashboardPage />} />
        <Route path="/dsa"       element={<DSAPage />} />
        <Route path="/subjects"  element={<SubjectsPage />} />
        <Route path="/aptitude"  element={<AptitudePage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/admin"     element={<Protected adminOnly><AdminPage /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration:3000, style:{ borderRadius:10, fontSize:13, fontFamily:'Segoe UI,system-ui,sans-serif' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
