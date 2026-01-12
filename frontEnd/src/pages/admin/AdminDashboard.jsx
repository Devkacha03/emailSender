import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  MdDashboard, 
  MdEmail, 
  MdPeople, 
  MdCheckCircle, 
  MdError,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdSettings,
  MdNotifications,
  MdSend,
  MdDescription,
  MdBarChart,
  MdRefresh,
  MdAccessTime,
  MdVisibility
} from 'react-icons/md';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);
  const [emailTrend, setEmailTrend] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ status: 'healthy', uptime: '99.9%' });

  useEffect(() => {
    fetchDashboardData();
    generateTrendData();
  }, []);

  const generateTrendData = () => {
    // Generate last 7 days trend data
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        emails: Math.floor(Math.random() * 100) + 50,
        success: Math.floor(Math.random() * 80) + 40
      });
    }
    setEmailTrend(trend);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentEmails(response.data.recentEmails);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <MdDashboard style={{ fontSize: '40px', marginRight: '10px' }} />
        Loading Dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error-message">
        <MdError />
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <MdDashboard />
            Admin Dashboard
          </h1>
          <p className="header-subtitle">Welcome back! Here's what's happening with your email system.</p>
        </div>
        <button className="refresh-btn" onClick={fetchDashboardData}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* System Health Bar */}
      <div className="system-health">
        <div className="health-indicator">
          <MdCheckCircle className="health-icon healthy" />
          <span>System Status: <strong>Healthy</strong></span>
        </div>
        <div className="health-stats">
          <span><MdAccessTime /> Uptime: {systemHealth.uptime}</span>
          <span><MdEmail /> Queue: 0 pending</span>
          <span><MdWarning /> Errors: 0</span>
        </div>
      </div>

      {/* Main Stats Grid with Charts */}
      <div className="stats-grid">
        <div className="stat-card featured">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <MdEmail />
            </div>
            <div className="stat-info">
              <h3>Total Emails</h3>
              <p className="stat-number">{stats.emails.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-positive">
              <MdTrendingUp /> {stats.emails.today} today
            </span>
          </div>
          <div className="stat-chart">
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={emailTrend}>
                <defs>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="emails" stroke="#667eea" fill="url(#colorEmails)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card featured">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <MdCheckCircle />
            </div>
            <div className="stat-info">
              <h3>Success Rate</h3>
              <p className="stat-number">{stats.emails.successRate}%</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-positive">
              <MdTrendingUp /> {stats.emails.successful.toLocaleString()} successful
            </span>
          </div>
          <div className="stat-chart">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={emailTrend}>
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <MdPeople />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.users.total}</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-info">
              {stats.users.active} active users
            </span>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.users.active / stats.users.total) * 100}%`, background: '#f59e0b' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
              <MdDescription />
            </div>
            <div className="stat-info">
              <h3>Templates</h3>
              <p className="stat-number">{stats.templates.total}</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-info">
              {stats.templates.active} active
            </span>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.templates.active / stats.templates.total) * 100}%`, background: '#6366f1' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Quick Actions */}
          <div className="dashboard-section quick-actions">
            <h2>
              <MdSettings />
              Quick Actions
            </h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate('/admin/emails')}>
                <MdEmail />
                <span>Email Management</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/users')}>
                <MdPeople />
                <span>Manage Users</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/templates')}>
                <MdDescription />
                <span>Templates</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/analytics')}>
                <MdBarChart />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Email Performance */}
          <div className="dashboard-section performance-section">
            <h2>
              <MdBarChart />
              Email Performance (Last 7 Days)
            </h2>
            <div className="performance-grid">
              <div className="performance-card success">
                <div className="perf-icon">
                  <MdCheckCircle />
                </div>
                <div className="perf-info">
                  <h4>Successful</h4>
                  <p className="perf-number">{stats.emails.successful.toLocaleString()}</p>
                  <span className="perf-percentage">{stats.emails.successRate}%</span>
                </div>
              </div>

              <div className="performance-card failed">
                <div className="perf-icon">
                  <MdError />
                </div>
                <div className="perf-info">
                  <h4>Failed</h4>
                  <p className="perf-number">{stats.emails.failed.toLocaleString()}</p>
                  <span className="perf-percentage">{((stats.emails.failed / stats.emails.total) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="performance-card info">
                <div className="perf-icon">
                  <MdEmail />
                </div>
                <div className="perf-info">
                  <h4>Last 7 Days</h4>
                  <p className="perf-number">{stats.emails.last7Days.toLocaleString()}</p>
                  <span className="perf-trend"><MdTrendingUp /> +12%</span>
                </div>
              </div>

              <div className="performance-card admin">
                <div className="perf-icon">
                  <MdPeople />
                </div>
                <div className="perf-info">
                  <h4>Admin Users</h4>
                  <p className="perf-number">{stats.users.admins}</p>
                  <span className="perf-label">Managing system</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="dashboard-section chart-section">
            <h2>
              <MdTrendingUp />
              Email Activity Trend
            </h2>
            <div className="activity-chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={emailTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  />
                  <Bar dataKey="emails" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">

          {/* Recent Emails */}
          <div className="dashboard-section recent-section">
            <div className="section-header">
              <h2>
                <MdEmail />
                Recent Email Campaigns
              </h2>
              <button className="view-link" onClick={() => navigate('/admin/emails')}>
                View All <MdVisibility />
              </button>
            </div>
            
            {recentEmails.length > 0 ? (
              <div className="recent-emails-list">
                {recentEmails.slice(0, 5).map((email) => (
                  <div key={email.id} className="recent-email-item">
                    <div className="email-info">
                      <div className="email-subject">{email.subject}</div>
                      <div className="email-meta">
                        <span><MdPeople /> {email.sender}</span>
                        <span><MdEmail /> {email.recipientCount} recipients</span>
                        <span><MdAccessTime /> {new Date(email.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="email-status">
                      <span className={`type-badge ${email.type}`}>
                        {email.type}
                      </span>
                      <span className={`status-badge status-${email.status}`}>
                        {email.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <MdEmail className="no-data-icon" />
                <p>No recent emails found</p>
              </div>
            )}
          </div>

          {/* System Notifications */}
          <div className="dashboard-section notifications-section">
            <h2>
              <MdNotifications />
              System Notifications
            </h2>
            <div className="notifications-list">
              <div className="notification-item success">
                <MdCheckCircle className="notif-icon" />
                <div className="notif-content">
                  <h4>System Update Complete</h4>
                  <p>All services are running smoothly</p>
                  <span className="notif-time">2 hours ago</span>
                </div>
              </div>
              <div className="notification-item info">
                <MdEmail className="notif-icon" />
                <div className="notif-content">
                  <h4>High Email Volume Detected</h4>
                  <p>{stats.emails.today} emails sent today</p>
                  <span className="notif-time">5 hours ago</span>
                </div>
              </div>
              <div className="notification-item warning">
                <MdWarning className="notif-icon" />
                <div className="notif-content">
                  <h4>Scheduled Maintenance</h4>
                  <p>System backup scheduled for tonight</p>
                  <span className="notif-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
