import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import EmailConfig from './pages/EmailConfig';
import SendSingleEmail from './pages/SendSingleEmail';
import SendBulkEmail from './pages/SendBulkEmail';
import EmailLogs from './pages/EmailLogs';
import Profile from './pages/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmailManagement from './pages/admin/AdminEmailManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminTemplateManagement from './pages/admin/AdminTemplateManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSystemMonitor from './pages/admin/AdminSystemMonitor';
import AdminQueueManagement from './pages/admin/AdminQueueManagement';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />

        {/* Private Routes */}
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="email-config" element={<EmailConfig />} />
          <Route path="send-single" element={<SendSingleEmail />} />
          <Route path="send-bulk" element={<SendBulkEmail />} />
          <Route path="email-logs" element={<EmailLogs />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="monitor" element={<AdminSystemMonitor />} />
          <Route path="queue" element={<AdminQueueManagement />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="emails" element={<AdminEmailManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="templates" element={<AdminTemplateManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
