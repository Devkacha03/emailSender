import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
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
  });

  useEffect(() => {
    // Navigate to dashboard after successful authentication
    if (shouldRedirect && isAuthenticated) {
      // Get user from localStorage to check role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Redirect to admin panel if user is admin, otherwise to user dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
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

    setLoading(true);

    try {
      const response = await authService.signup(formData);
      const { token, userDetail } = response.data;
      
      login(token, userDetail);
      toast.success('Account created successfully!');
      
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
          <MdEmail className="auth-icon" />
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
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
                placeholder="Enter your email"
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
                placeholder="Create a password"
                value={formData.userPassword}
                onChange={handleChange}
                required
                minLength="6"
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
                minLength="6"
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

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
