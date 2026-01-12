import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdShield } from 'react-icons/md';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });

  useEffect(() => {
    // Navigate to admin dashboard after successful authentication
    if (shouldRedirect && isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Only allow admin role to access admin dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.error('Access denied. Admin privileges required.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShouldRedirect(false);
        setLoading(false);
      }
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      const { token, userDetail } = response.data;
      
      // Check if user is admin before allowing login
      if (userDetail.role !== 'admin') {
        toast.error('Access denied. This login is for admin users only.');
        setLoading(false);
        return;
      }
      
      // Set token and user in context and localStorage
      login(token, userDetail);
      toast.success('Admin login successful!');
      
      // Trigger redirect - useEffect will handle navigation
      setShouldRedirect(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <MdShield className="auth-icon" style={{ color: '#f59e0b' }} />
          <h1>Admin Panel Login</h1>
          <p>Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" />
              <input
                type="email"
                name="userEmail"
                className="form-input"
                placeholder="Enter admin email"
                value={formData.userEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="userPassword"
                className="form-input"
                placeholder="Enter your password"
                value={formData.userPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an admin account? <Link to="/admin/signup">Create one</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
