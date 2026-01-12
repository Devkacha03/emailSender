import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdPerson, MdEmail, MdLock, MdCalendarToday, MdVerifiedUser, MdEdit, MdSave, MdCancel, MdSettings, MdPhone, MdVisibility, MdVisibilityOff, MdNotifications, MdAccessTime, MdCameraAlt } from 'react-icons/md';
import { authService, emailStatsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SendSingleEmail.css';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confimPassword: '',
  });
  const [profileForm, setProfileForm] = useState({
    userName: user?.userName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showLastActive: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  useEffect(() => {
    fetchStats();
    setProfileForm({
      userName: user?.userName || '',
      bio: user?.bio || 'Email marketing enthusiast 📧',
      phone: user?.phone || '',
    });
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await emailStatsService.getAnalytics();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulated API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser({ ...user, ...profileForm });
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      userName: user?.userName || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
    });
    setEditMode(false);
  };

  const handlePrivacyChange = (setting) => {
    setPrivacySettings({ ...privacySettings, [setting]: !privacySettings[setting] });
    toast.success('Privacy settings updated');
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings({ ...notificationSettings, [setting]: !notificationSettings[setting] });
    toast.success('Notification settings updated');
  };

  const getLastActive = () => {
    // Simulated - replace with actual last active tracking
    const now = new Date();
    return 'Just now';
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confimPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(passwordForm);
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confimPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="single-email-page">
      <div className="single-email-header">
        <h1>
          <MdPerson />
          My Profile
        </h1>
      </div>

      {/* Profile Overview */}
      <div className="profile-overview">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profileForm.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="avatar-upload" title="Change Photo">
              <MdCameraAlt />
            </div>
            <div className="verified-badge" title="Verified User">
              <MdVerifiedUser />
            </div>
          </div>
          
          <div className="profile-info">
            {editMode ? (
              <input
                type="text"
                name="userName"
                className="profile-edit-input"
                value={profileForm.userName}
                onChange={handleProfileChange}
                placeholder="Your name"
              />
            ) : (
              <h2>{profileForm.userName || 'User Name'}</h2>
            )}
            <p className="profile-email">
              <MdEmail /> {user?.userEmail || 'user@example.com'}
            </p>
            {editMode ? (
              <textarea
                name="bio"
                className="profile-bio-input"
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself..."
                rows="2"
              />
            ) : (
              <p className="profile-bio">{profileForm.bio || 'No bio yet'}</p>
            )}
            <div className="profile-meta">
              <span className="meta-item">
                <MdCalendarToday />
                Joined {formatDate(user?.createdAt)}
              </span>
              {privacySettings.showLastActive && (
                <span className="meta-item">
                  <MdAccessTime />
                  {getLastActive()}
                </span>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            {!editMode ? (
              <button className="btn-edit-profile" onClick={() => setEditMode(true)}>
                <MdEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-profile" onClick={handleProfileSubmit} disabled={loading}>
                  <MdSave /> Save
                </button>
                <button className="btn-cancel-profile" onClick={handleCancelEdit}>
                  <MdCancel /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">📧</div>
              <div className="stat-details">
                <h3>{stats.totalSentEmails || 0}</h3>
                <p>Total Emails Sent</p>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-details">
                <h3>{stats.totalSuccessEmails || 0}</h3>
                <p>Successful</p>
                <span className="stat-percentage">{stats.successRate?.toFixed(1) || 0}%</span>
              </div>
            </div>

            <div className="stat-card stat-failed">
              <div className="stat-icon">❌</div>
              <div className="stat-details">
                <h3>{stats.totalFailedEmails || 0}</h3>
                <p>Failed</p>
                <span className="stat-percentage">{stats.failureRate?.toFixed(1) || 0}%</span>
              </div>
            </div>

            <div className="stat-card stat-pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-details">
                <h3>{stats.totalPendingEmails || 0}</h3>
                <p>Pending</p>
                <span className="stat-percentage">{stats.pendingRate?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Information Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>
            <MdSettings />
            Account Information
          </h2>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Full Name</label>
            <div className="info-value">
              <MdPerson />
              {editMode ? (
                <input
                  type="text"
                  name="userName"
                  className="info-edit-input"
                  value={profileForm.userName}
                  onChange={handleProfileChange}
                />
              ) : (
                <span>{profileForm.userName || 'Not set'}</span>
              )}
            </div>
          </div>

          <div className="info-item">
            <label>Email Address</label>
            <div className="info-value">
              <MdEmail />
              <span>{user?.userEmail || 'Not set'}</span>
              {privacySettings.showEmail && <span className="privacy-badge">Public</span>}
            </div>
          </div>

          <div className="info-item">
            <label>Phone Number</label>
            <div className="info-value">
              <MdPhone />
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  className="info-edit-input"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <span>{profileForm.phone || 'Not set'}</span>
              )}
              {privacySettings.showPhone && profileForm.phone && <span className="privacy-badge">Public</span>}
            </div>
          </div>

          <div className="info-item">
            <label>Account Status</label>
            <div className="info-value">
              <MdVerifiedUser />
              <span className="badge-success">Active</span>
            </div>
          </div>

          <div className="info-item">
            <label>Member Since</label>
            <div className="info-value">
              <MdCalendarToday />
              <span>{formatDate(user?.createdAt)}</span>
            </div>
          </div>

          <div className="info-item">
            <label>Last Active</label>
            <div className="info-value">
              <MdAccessTime />
              <span>{getLastActive()}</span>
              {privacySettings.showLastActive && <span className="privacy-badge">Public</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>
            <MdVisibility />
            Privacy Settings
          </h2>
        </div>

        <div className="privacy-controls">
          <div className="privacy-item">
            <div className="privacy-info">
              <h4>Show Email Address</h4>
              <p>Allow others to see your email address</p>
            </div>
            <button 
              className={`toggle-btn ${privacySettings.showEmail ? 'active' : ''}`}
              onClick={() => handlePrivacyChange('showEmail')}
            >
              {privacySettings.showEmail ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
          </div>

          <div className="privacy-item">
            <div className="privacy-info">
              <h4>Show Phone Number</h4>
              <p>Display your phone number on your profile</p>
            </div>
            <button 
              className={`toggle-btn ${privacySettings.showPhone ? 'active' : ''}`}
              onClick={() => handlePrivacyChange('showPhone')}
            >
              {privacySettings.showPhone ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
          </div>

          <div className="privacy-item">
            <div className="privacy-info">
              <h4>Show Last Active</h4>
              <p>Let others see when you were last active</p>
            </div>
            <button 
              className={`toggle-btn ${privacySettings.showLastActive ? 'active' : ''}`}
              onClick={() => handlePrivacyChange('showLastActive')}
            >
              {privacySettings.showLastActive ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>
            <MdNotifications />
            Notification Preferences
          </h2>
        </div>

        <div className="privacy-controls">
          <div className="privacy-item">
            <div className="privacy-info">
              <h4>Email Notifications</h4>
              <p>Receive email updates about your account activity</p>
            </div>
            <button 
              className={`toggle-btn ${notificationSettings.emailNotifications ? 'active' : ''}`}
              onClick={() => handleNotificationChange('emailNotifications')}
            >
              {notificationSettings.emailNotifications ? '✓' : '✕'}
            </button>
          </div>

          <div className="privacy-item">
            <div className="privacy-info">
              <h4>SMS Notifications</h4>
              <p>Get text messages for important updates</p>
            </div>
            <button 
              className={`toggle-btn ${notificationSettings.smsNotifications ? 'active' : ''}`}
              onClick={() => handleNotificationChange('smsNotifications')}
            >
              {notificationSettings.smsNotifications ? '✓' : '✕'}
            </button>
          </div>

          <div className="privacy-item">
            <div className="privacy-info">
              <h4>Push Notifications</h4>
              <p>Receive push notifications in your browser</p>
            </div>
            <button 
              className={`toggle-btn ${notificationSettings.pushNotifications ? 'active' : ''}`}
              onClick={() => handleNotificationChange('pushNotifications')}
            >
              {notificationSettings.pushNotifications ? '✓' : '✕'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>
            <MdLock />
            Security Settings
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="email-form-group">
            <label className="email-form-label">
              <MdLock /> Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              className="email-form-input"
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="email-form-group">
            <label className="email-form-label">
              <MdLock /> New Password
            </label>
            <input
              type="password"
              name="newPassword"
              className="email-form-input"
              placeholder="Enter your new password (min. 8 characters)"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
            <small className="help-text">
              Password must be at least 8 characters long
            </small>
          </div>

          <div className="email-form-group">
            <label className="email-form-label">
              <MdLock /> Confirm New Password
            </label>
            <input
              type="password"
              name="confimPassword"
              className="email-form-input"
              placeholder="Confirm your new password"
              value={passwordForm.confimPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>

          <div className="email-form-actions">
            <button 
              type="submit" 
              className="send-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Updating...
                </>
              ) : (
                <>
                  <MdSave />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>

        <div className="security-tips">
          <h3>🔐 Password Security Tips</h3>
          <ul>
            <li>Use a mix of uppercase and lowercase letters</li>
            <li>Include numbers and special characters</li>
            <li>Avoid using personal information</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Change your password regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
