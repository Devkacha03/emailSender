import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdHistory, MdCheckCircle, MdError, MdSchedule, MdEmail, MdSearch, MdRefresh, MdChevronLeft, MdChevronRight, MdVisibility, MdClose } from 'react-icons/md';
import { emailStatsService } from '../services/api';
import './SendSingleEmail.css';
import './EmailLogs.css';

const EmailLogs = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [limit, setLimit] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filter, limit]);

  const fetchLogs = async () => {
    try {
      const params = {
        page: currentPage,
        limit: limit,
        status: filter !== 'all' ? filter : undefined,
        search: search || undefined
      };
      const response = await emailStatsService.getLogs(params);
      setLogs(response.data.emailLogs || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch email logs');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const handleRefresh = () => {
    setSearch('');
    setCurrentPage(1);
    setFilter('all');
    fetchLogs();
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="status-icon success" />;
      case 'failed':
        return <MdError className="status-icon failed" />;
      case 'pending':
        return <MdSchedule className="status-icon pending" />;
      case 'partial':
        return <MdError className="status-icon partial" />;
      default:
        return <MdEmail className="status-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`status-badge ${status}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getRecipientStats = (recipients) => {
    if (!recipients || recipients.length === 0) return { success: 0, failed: 0, pending: 0 };
    
    return recipients.reduce((acc, r) => {
      if (r.status === 'success') acc.success++;
      else if (r.status === 'failed') acc.failed++;
      else if (r.status === 'pending') acc.pending++;
      return acc;
    }, { success: 0, failed: 0, pending: 0 });
  };

  return (
    <div className="single-email-page">
      <div className="single-email-header">
        <h1>
          <MdHistory />
          Email Logs
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="email-form-card" style={{ marginBottom: '12px' }}>
        <div className="search-filter-bar">
          <div className="search-box">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by subject or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="email-form-input"
            />
            <button className="send-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
          <button className="send-btn" onClick={handleRefresh} style={{ marginLeft: '8px' }}>
            <MdRefresh /> Refresh
          </button>
        </div>

        <div className="filter-buttons">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${filter === 'success' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => { setFilter('success'); setCurrentPage(1); }}
          >
            Success
          </button>
          <button
            className={`btn btn-sm ${filter === 'failed' ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => { setFilter('failed'); setCurrentPage(1); }}
          >
            Failed
          </button>
          <button
            className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => { setFilter('pending'); setCurrentPage(1); }}
          >
            Pending
          </button>
          <button
            className={`btn btn-sm ${filter === 'partial' ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => { setFilter('partial'); setCurrentPage(1); }}
          >
            Partial
          </button>
        </div>

        <div className="logs-info">
          <span>Showing {logs.length} of {pagination.totalLogs || 0} logs</span>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
            className="limit-select"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="email-form-card">
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <MdHistory style={{ fontSize: '64px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Email Logs</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' 
                ? 'You haven\'t sent any emails yet.' 
                : `No ${filter} emails found.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Table View */}
          <div className="email-form-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Recipients</th>
                    <th>Date & Time</th>
                    <th>Success Rate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const stats = getRecipientStats(log.recipients);
                    const totalRecipients = log.recipients?.length || 0;
                    const successRate = totalRecipients > 0 ? ((stats.success / totalRecipients) * 100).toFixed(0) : 0;

                    return (
                      <tr key={log._id}>
                        <td>
                          <div className="table-status-cell">
                            {getStatusIcon(log.overallStatus)}
                            {getStatusBadge(log.overallStatus)}
                          </div>
                        </td>
                        <td>
                          <div className="table-subject-cell">
                            {log.subject || 'No Subject'}
                          </div>
                        </td>
                        <td>
                          <span className="table-type-badge">
                            {log.isBulk ? '📧 Bulk' : '✉️ Single'}
                          </span>
                        </td>
                        <td>
                          <div className="table-recipients-cell">
                            <strong>{totalRecipients}</strong>
                            {log.isBulk && totalRecipients > 0 && (
                              <div className="recipients-mini-stats">
                                {stats.success > 0 && <span className="mini-success">✓ {stats.success}</span>}
                                {stats.failed > 0 && <span className="mini-failed">✗ {stats.failed}</span>}
                                {stats.pending > 0 && <span className="mini-pending">⏱ {stats.pending}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="table-date-cell">
                            {formatDate(log.sentAt || log.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="table-rate-cell">
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill" 
                                style={{ 
                                  width: `${successRate}%`,
                                  backgroundColor: successRate >= 80 ? '#10b981' : successRate >= 50 ? '#f59e0b' : '#ef4444'
                                }}
                              ></div>
                            </div>
                            <span className="progress-text">{successRate}%</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="view-details-btn" 
                            onClick={() => handleViewDetails(log)}
                            title="View Details"
                          >
                            <MdVisibility />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedLog && (
            <div className="modal-overlay" onClick={closeDetailsModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>
                    {getStatusIcon(selectedLog.overallStatus)}
                    Email Details
                  </h2>
                  <button className="modal-close-btn" onClick={closeDetailsModal}>
                    <MdClose />
                  </button>
                </div>

                <div className="modal-body">
                  {/* Email Information */}
                  <div className="detail-section">
                    <h3>Email Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Subject:</label>
                        <span>{selectedLog.subject || 'No Subject'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Type:</label>
                        <span className="table-type-badge">
                          {selectedLog.isBulk ? '📧 Bulk Email' : '✉️ Single Email'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        {getStatusBadge(selectedLog.overallStatus)}
                      </div>
                      <div className="detail-item">
                        <label>Date & Time:</label>
                        <span>{formatDate(selectedLog.sentAt || selectedLog.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipients Section */}
                  {selectedLog.recipients && selectedLog.recipients.length > 0 && (
                    <div className="detail-section">
                      <h3>
                        Recipients ({selectedLog.recipients.length})
                        <span className="recipients-stats-inline">
                          {(() => {
                            const stats = getRecipientStats(selectedLog.recipients);
                            return (
                              <>
                                {stats.success > 0 && <span className="stat-success">✓ {stats.success} Success</span>}
                                {stats.failed > 0 && <span className="stat-failed">✗ {stats.failed} Failed</span>}
                                {stats.pending > 0 && <span className="stat-pending">⏱ {stats.pending} Pending</span>}
                              </>
                            );
                          })()}
                        </span>
                      </h3>
                      <div className="recipients-table-container">
                        <table className="recipients-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Email Address</th>
                              <th>Status</th>
                              <th>Sent At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLog.recipients.map((recipient, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="recipient-email-cell">{recipient.email}</td>
                                <td>{getStatusBadge(recipient.status)}</td>
                                <td className="recipient-time-cell">
                                  {recipient.sentAt ? formatDate(recipient.sentAt) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="send-btn" onClick={closeDetailsModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="send-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                style={{ opacity: !pagination.hasPrevPage ? 0.5 : 1 }}
              >
                <MdChevronLeft /> Previous
              </button>
              
              <div className="pagination-info">
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              </div>

              <button
                className="send-btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
                style={{ opacity: !pagination.hasNextPage ? 0.5 : 1 }}
              >
                Next <MdChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailLogs;
