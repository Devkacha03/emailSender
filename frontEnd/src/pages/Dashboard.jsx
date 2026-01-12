import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  MdDashboard, 
  MdEmail, 
  MdCheckCircle, 
  MdError,
  MdTrendingUp,
  MdSchedule,
  MdLightbulb,
  MdSpeed,
  MdSecurity,
  MdAutorenew,
  MdSend,
  MdGroup,
  MdSettings,
  MdHistory,
  MdArrowForward,
  MdTrendingDown
} from 'react-icons/md';
import { emailStatsService } from '../services/api';
import './Dashboard.css';      
import './SendSingleEmail.css';
import './EmailConfig.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentLogs();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await emailStatsService.getAnalytics();
      console.log('Analytics response:', response.data);
      setAnalytics(response.data.data); // Backend returns data inside 'data' object
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const response = await emailStatsService.getLogs({ page: 1, limit: 5 });
      setRecentLogs(response.data.emailLogs || []);
    } catch (error) {
      console.error('Error fetching recent logs:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = analytics || {
    totalSentEmails: 0,
    totalSuccessEmails: 0,
    totalFailedEmails: 0,
    totalPendingEmails: 0,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>
            <MdDashboard />
            Dashboard
          </h1>
          <p className="dashboard-welcome">Welcome back! Here's what's happening with your emails</p>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Emails</span>
            <div className="stat-card-icon-wrapper primary">
              <MdEmail />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalSentEmails || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-trend up">
              <MdTrendingUp /> All time
            </span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Successful</span>
            <div className="stat-card-icon-wrapper success">
              <MdCheckCircle />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalSuccessEmails || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-trend up">
              <MdTrendingUp /> {stats.successRate?.toFixed(1) || 0}% success rate
            </span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Failed</span>
            <div className="stat-card-icon-wrapper danger">
              <MdError />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalFailedEmails || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-trend down">
              <MdTrendingDown /> {stats.failureRate?.toFixed(1) || 0}% failure rate
            </span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending</span>
            <div className="stat-card-icon-wrapper warning">
              <MdSchedule />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalPendingEmails || 0}</div>
          <div className="stat-card-footer">
            <span className="stat-trend">
              {stats.pendingRate?.toFixed(1) || 0}% pending
            </span>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      {stats.totalSentEmails === 0 && (
        <div className="get-started-card">
          <MdEmail style={{ fontSize: '64px', color: 'var(--primary-color)', marginBottom: '16px' }} />
          <h2>Get Started with Email Sender</h2>
          <p>
            You haven't sent any emails yet. Configure your email settings and start
            sending emails to unlock the full potential of this platform!
          </p>
          <a href="/email-config" className="get-started-btn">
            <MdSettings />
            Configure Email Now
          </a>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Quick Actions */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              <MdSpeed />
              Quick Actions
            </h2>
          </div>
          <div className="quick-actions-grid">
            <a href="/email-config" className="quick-action-card">
              <div className="quick-action-icon">
                <MdSettings />
              </div>
              <div className="quick-action-content">
                <h3>Configure Email</h3>
                <p>Set up your email provider</p>
              </div>
            </a>
            
            <a href="/send-single" className="quick-action-card">
              <div className="quick-action-icon">
                <MdSend />
              </div>
              <div className="quick-action-content">
                <h3>Send Single Email</h3>
                <p>Quick email to one recipient</p>
              </div>
            </a>
            
            <a href="/send-bulk" className="quick-action-card">
              <div className="quick-action-icon">
                <MdGroup />
              </div>
              <div className="quick-action-content">
                <h3>Send Bulk Emails</h3>
                <p>Send to multiple recipients</p>
              </div>
            </a>
            
            <a href="/email-logs" className="quick-action-card">
              <div className="quick-action-icon">
                <MdHistory />
              </div>
              <div className="quick-action-content">
                <h3>View Email Logs</h3>
                <p>Track your email history</p>
              </div>
            </a>
          </div>
        </div>

        {/* Tips & Best Practices */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              <MdLightbulb />
              Tips & Best Practices
            </h2>
          </div>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">
                <MdSpeed style={{ color: '#f59e0b' }} />
              </div>
              <div className="tip-content">
                <h4>Use AI Generation</h4>
                <p>Save time by using AI to generate professional email content instantly</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon">
                <MdCheckCircle style={{ color: '#10b981' }} />
              </div>
              <div className="tip-content">
                <h4>Validate Emails</h4>
                <p>Always validate email addresses before sending bulk emails to improve delivery</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon">
                <MdSecurity style={{ color: '#2563eb' }} />
              </div>
              <div className="tip-content">
                <h4>Secure Configuration</h4>
                <p>Keep your email credentials secure and update passwords regularly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              <MdAutorenew />
              Recent Activity
            </h2>
            <a href="/email-logs" className="view-all-link">
              View all logs <MdArrowForward />
            </a>
          </div>
          <div className="activity-list">
            {recentLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${log.overallStatus === 'success' ? 'success' : 'failed'}`}>
                  {log.overallStatus === 'success' ? <MdCheckCircle /> : <MdError />}
                </div>
                <div className="activity-content">
                  <div className="activity-subject">{log.subject || 'No Subject'}</div>
                  <div className="activity-meta">
                    <span>{log.isBulk ? 'Bulk Email' : 'Single Email'}</span>
                    <span>•</span>
                    <span>{log.recipients?.length || 0} recipient{log.recipients?.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{formatDate(log.sentAt || log.createdAt)}</span>
                  </div>
                </div>
                <span className={`activity-badge ${log.overallStatus}`}>
                  {log.overallStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
