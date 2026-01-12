import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff, MdShield } from 'react-icons/md';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

const AdminSignup = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    userConfirmPassword: '',
    role: 'admin', // Set role as admin
  });

  useEffect(() => {
    // Navigate to admin dashboard after successful authentication
    if (shouldRedirect && isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
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

    if (formData.userPassword !== formData.userConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.userPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Create admin user with role specified
      const adminData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPassword: formData.userPassword,
        userConfirmPassword: formData.userConfirmPassword,
        role: 'admin', // Ensure role is admin
      };

      const response = await authService.signup(adminData);
      const { token, userDetail } = response.data;
      
      // Verify the created user has admin role
      if (userDetail.role !== 'admin') {
        toast.error('Failed to create admin account. Please try again.');
        setLoading(false);
        return;
      }

      login(token, userDetail);
      toast.success('Admin account created successfully!');
      
      // Trigger redirect - useEffect will handle navigation
      setShouldRedirect(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <MdShield className="auth-icon" style={{ color: '#f59e0b' }} />
          <h1>Create Admin Account</h1>
          <p>Sign up to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <div className="input-with-icon">
              <MdPerson className="input-icon" />
              <input
                type="text"
                name="userName"
                className="form-input"
                placeholder="Enter your name"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
                placeholder="Enter your password (min. 8 characters)"
                value={formData.userPassword}
                onChange={handleChange}
                required
                minLength={8}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="userConfirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.userConfirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an admin account? <Link to="/admin/login">Sign in</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
