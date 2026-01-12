import React, { useState, useEffect } from 'react';
import { FaRedo, FaTimes, FaFilter, FaSync, FaCheckCircle, FaClock, FaSpinner, FaExclamationTriangle, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import './AdminQueueManagement.css';

const AdminQueueManagement = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 5
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEmailQueue(filter);
      setQueue(response.data.queue);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to fetch email queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (queueId) => {
    try {
      await adminService.retryFailedEmail(queueId);
      toast.success('Email queued for retry');
      fetchQueue();
    } catch (error) {
      console.error('Error retrying email:', error);
      toast.error(error.response?.data?.message || 'Failed to retry email');
    }
  };

  const handleCancel = async (queueId) => {
    if (!window.confirm('Are you sure you want to cancel this email?')) {
      return;
    }
    try {
      await adminService.cancelQueuedEmail(queueId);
      toast.success('Email cancelled successfully');
      fetchQueue();
    } catch (error) {
      console.error('Error cancelling email:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel email');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon success" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'processing':
        return <FaSpinner className="status-icon processing spin" />;
      case 'failed':
        return <FaExclamationTriangle className="status-icon error" />;
      case 'cancelled':
        return <FaBan className="status-icon cancelled" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    return <span className={`priority-badge priority-${priority}`}>{priority}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-queue-management">
      <div className="page-header">
        <h1>
          <FaRedo />
          Email Queue Management
        </h1>
        <button className="refresh-btn" onClick={fetchQueue}>
          <FaSync /> Refresh
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <FaFilter />
          <select 
            value={filter.status} 
            onChange={(e) => setFilter({...filter, status: e.target.value, page: 1})}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filter.priority} 
            onChange={(e) => setFilter({...filter, priority: e.target.value, page: 1})}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
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
        <div className="loading">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="no-data">
          <FaCheckCircle />
          <p>No emails in queue</p>
        </div>
      ) : (
        <>
          <div className="queue-table-wrapper">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Attempts</th>
                  <th>Scheduled</th>
                  <th>Last Attempt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(item.status)}
                        <span className={`status-text status-${item.status}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td className="email-cell">{item.to}</td>
                    <td className="subject-cell">{item.subject || 'No subject'}</td>
                    <td>
                      <span className={item.attempts >= 3 ? 'attempts-warning' : ''}>
                        {item.attempts}/{item.maxAttempts}
                      </span>
                    </td>
                    <td>{formatDate(item.scheduledAt)}</td>
                    <td>{item.lastAttempt ? formatDate(item.lastAttempt) : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        {(item.status === 'failed' || item.status === 'pending') && (
                          <button 
                            className="action-btn retry-btn"
                            onClick={() => handleRetry(item._id)}
                            title="Retry"
                          >
                            <FaRedo />
                          </button>
                        )}
                        {(item.status === 'pending' || item.status === 'processing') && (
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => handleCancel(item._id)}
                            title="Cancel"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Showing {(pagination.currentPage - 1) * filter.limit + 1} to{' '}
              {Math.min(pagination.currentPage * filter.limit, pagination.total)} of{' '}
              {pagination.total} emails
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

export default AdminQueueManagement;
