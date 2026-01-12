import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdLock } from 'react-icons/md';
import { authService } from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setValidating(false);
      setIsValidToken(false);
      toast.error('Invalid reset link');
      return;
    }
    
    setValidating(false);
    setIsValidToken(true);
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.setNewPassword(token, formData);
      toast.success('Password reset successful! Please login with your new password.');
      
      // Store the new token if backend returns it
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Validating...</h1>
            <p>Please wait while we verify your reset link</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Invalid Link</h1>
            <p>This password reset link is invalid or has expired</p>
          </div>
          <div className="auth-footer">
            <Link to="/forgot-password" className="btn btn-primary auth-btn">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <MdLock className="auth-icon" />
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input
                type="password"
                name="newPassword"
                className="form-input"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
