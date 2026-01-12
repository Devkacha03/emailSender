import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdMonitor, MdEmail, MdPeople, MdSpeed, MdMemory, MdTimer, MdCheckCircle, MdError } from 'react-icons/md';
import adminService from '../../services/adminService';
import './AdminSystemMonitor.css';

const AdminSystemMonitor = () => {
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMonitoring();

    if (autoRefresh) {
      const interval = setInterval(fetchMonitoring, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMonitoring = async () => {
    try {
      const response = await adminService.getSystemMonitoring();
      if (response.data.success) {
        setMonitoring(response.data.monitoring);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      if (loading) {
        toast.error('Failed to load monitoring data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="loading">
        <MdMonitor style={{ fontSize: '40px', marginRight: '10px' }} />
        Loading system monitoring...
      </div>
    );
  }

  if (!monitoring) {
    return <div className="no-data">No monitoring data available</div>;
  }

  const { realtime, queue, activeUsers, systemHealth } = monitoring;

  return (
    <div className="admin-system-monitor">
      <div className="page-header">
        <h1>
          <MdMonitor /> Real-Time System Monitoring
        </h1>
        <div className="header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (5s)</span>
          </label>
          <button onClick={fetchMonitoring} className="refresh-btn">
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Real-time Email Stats */}
      <div className="monitor-section">
        <h2><MdSpeed /> Real-Time Email Activity</h2>
        <div className="stats-grid">
          <div className="stat-card realtime">
            <div className="stat-icon pulse">
              <MdEmail />
            </div>
            <div className="stat-content">
              <h3>Last 5 Minutes</h3>
              <p className="stat-number">{realtime.emailsLast5Min}</p>
              <span className="stat-label">emails sent</span>
            </div>
          </div>

          <div className="stat-card realtime">
            <div className="stat-icon">
              <MdTimer />
            </div>
            <div className="stat-content">
              <h3>Last Hour</h3>
              <p className="stat-number">{realtime.emailsLastHour}</p>
              <span className="stat-label">emails sent</span>
            </div>
          </div>

          <div className="stat-card realtime">
            <div className="stat-icon success">
              <MdCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Success Rate</h3>
              <p className="stat-number">{realtime.successRate}%</p>
              <span className="stat-label">last 5 minutes</span>
            </div>
          </div>

          <div className="stat-card realtime">
            <div className="stat-icon error">
              <MdError />
            </div>
            <div className="stat-content">
              <h3>Failed</h3>
              <p className="stat-number">{realtime.failedLast5Min}</p>
              <span className="stat-label">last 5 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Queue Status */}
      <div className="monitor-section">
        <h2><MdEmail /> Email Queue Status</h2>
        <div className="queue-grid">
          {queue && queue.length > 0 ? (
            queue.map((item) => (
              <div key={item._id} className={`queue-card status-${item._id}`}>
                <h3>{item._id}</h3>
                <p className="queue-count">{item.count}</p>
              </div>
            ))
          ) : (
            <div className="empty-queue">
              <MdCheckCircle />
              <p>Queue is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Users */}
      <div className="monitor-section">
        <h2><MdPeople /> Active Users</h2>
        <div className="active-users-card">
          <div className="user-count">
            <MdPeople className="user-icon" />
            <span className="count">{activeUsers}</span>
          </div>
          <p>users active in the last hour</p>
        </div>
      </div>

      {/* System Health */}
      <div className="monitor-section">
        <h2><MdMemory /> System Health</h2>
        <div className="health-grid">
          <div className="health-card">
            <h3>Database</h3>
            <span className={`health-status ${systemHealth.database}`}>
              {systemHealth.database === 'healthy' ? '✓' : '✗'} {systemHealth.database}
            </span>
          </div>

          <div className="health-card">
            <h3>Email Service</h3>
            <span className={`health-status ${systemHealth.emailService}`}>
              {systemHealth.emailService === 'healthy' ? '✓' : '✗'} {systemHealth.emailService}
            </span>
          </div>

          <div className="health-card">
            <h3>Uptime</h3>
            <span className="uptime">{formatUptime(systemHealth.uptime)}</span>
          </div>

          <div className="health-card">
            <h3>Memory Usage</h3>
            <div className="memory-info">
              <p>Heap: {formatBytes(systemHealth.memory?.heapUsed)} / {formatBytes(systemHealth.memory?.heapTotal)}</p>
              <p>RSS: {formatBytes(systemHealth.memory?.rss)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemMonitor;
