import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFilter, FaSync, FaDownload, FaUser, FaEnvelope, FaCog, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import './AdminAuditLogs.css';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 5
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs(filter);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required. Please login as admin.');
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportReport('audit-logs', 'csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('user')) return <FaUser className="action-icon user" />;
    if (action.includes('email')) return <FaEnvelope className="action-icon email" />;
    if (action.includes('config')) return <FaCog className="action-icon config" />;
    if (action.includes('template')) return <FaDatabase className="action-icon template" />;
    if (action.includes('auth') || action.includes('login')) return <FaShieldAlt className="action-icon auth" />;
    return <FaFileAlt className="action-icon default" />;
  };

  const getActionBadge = (action) => {
    const actionTypes = {
      user_created: 'success',
      user_updated: 'info',
      user_deleted: 'danger',
      email_sent: 'success',
      email_failed: 'danger',
      config_updated: 'info',
      config_deleted: 'danger',
      template_created: 'success',
      template_updated: 'info',
      template_deleted: 'danger',
      login: 'info',
      logout: 'info',
      quota_updated: 'warning',
      quota_reset: 'warning'
    };
    
    const type = actionTypes[action] || 'default';
    return <span className={`action-badge badge-${type}`}>{action.replace(/_/g, ' ')}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-audit-logs">
      <div className="page-header">
        <h1>
          <FaFileAlt />
          Audit Logs
        </h1>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExport}>
            <FaDownload /> Export CSV
          </button>
          <button className="refresh-btn" onClick={fetchLogs}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <FaFilter />
          <select 
            value={filter.action} 
            onChange={(e) => setFilter({...filter, action: e.target.value, page: 1})}
          >
            <option value="">All Actions</option>
            <option value="user_created">User Created</option>
            <option value="user_updated">User Updated</option>
            <option value="user_deleted">User Deleted</option>
            <option value="email_sent">Email Sent</option>
            <option value="email_failed">Email Failed</option>
            <option value="config_updated">Config Updated</option>
            <option value="config_deleted">Config Deleted</option>
            <option value="template_created">Template Created</option>
            <option value="template_updated">Template Updated</option>
            <option value="template_deleted">Template Deleted</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="quota_updated">Quota Updated</option>
            <option value="quota_reset">Quota Reset</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From:</label>
          <input 
            type="date" 
            value={filter.startDate} 
            onChange={(e) => setFilter({...filter, startDate: e.target.value, page: 1})}
          />
        </div>

        <div className="filter-group">
          <label>To:</label>
          <input 
            type="date" 
            value={filter.endDate} 
            onChange={(e) => setFilter({...filter, endDate: e.target.value, page: 1})}
          />
        </div>

        <div className="filter-group">
          <select 
            value={filter.limit} 
            onChange={(e) => setFilter({...filter, limit: parseInt(e.target.value), page: 1})}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="no-data">
          <FaFileAlt />
          <p>No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="action-cell">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <strong>{log.userId?.name || 'Unknown'}</strong>
                        <span className="user-email">{log.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="details-cell">
                        {log.details ? (
                          typeof log.details === 'string' ? (
                            log.details
                          ) : (
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          )
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="ip-cell">{log.ipAddress || '-'}</td>
                    <td className="ua-cell">
                      {log.userAgent ? (
                        <span title={log.userAgent}>
                          {log.userAgent.substring(0, 30)}...
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="timestamp-cell">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Showing {(pagination.currentPage - 1) * filter.limit + 1} to{' '}
              {Math.min(pagination.currentPage * filter.limit, pagination.total)} of{' '}
              {pagination.total} logs
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={filter.page === 1}
                onClick={() => setFilter({...filter, page: filter.page - 1})}
              >
                Previous
              </button>
              <span className="page-number">
                Page {pagination.currentPage} of {pagination.pages}
              </span>
              <button
                className="pagination-btn"
                disabled={filter.page >= pagination.pages}
                onClick={() => setFilter({...filter, page: filter.page + 1})}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAuditLogs;
