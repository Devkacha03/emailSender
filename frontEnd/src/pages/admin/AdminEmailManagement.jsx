import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdEmail, MdSearch, MdFilterList, MdDelete, MdRemoveRedEye, MdClear, MdRefresh } from 'react-icons/md';
import adminService from '../../services/adminService';
import './AdminEmailManagement.css';

const AdminEmailManagement = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmails();
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllEmails({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });

      if (response.data.success) {
        setEmails(response.data.emails);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total || response.data.emails?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email record?')) return;

    try {
      await adminService.deleteEmail(id);
      toast.success('Email deleted successfully');
      fetchEmails();
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to delete email');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.info('Refreshed email list');
  };

  const hasActiveFilters = searchTerm || filters.status || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="admin-email-management">
      <div className="page-header">
        <h1><MdEmail /> Email Management</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh} title="Refresh">
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-box"
            placeholder="Search by subject, sender, or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <MdClear />
            </button>
          )}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label><MdFilterList /> Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div className="filter-group">
            <label><MdFilterList /> Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="bulk">Bulk</option>
              <option value="single">Single</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Per Page</label>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="filter-group">
              <label style={{ opacity: 0 }}>Clear</label>
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <MdClear /> Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading emails...
        </div>
      ) : emails.length === 0 ? (
        <div className="no-data">
          <MdEmail className="no-data-icon" />
          <h3>No Emails Found</h3>
          <p>{hasActiveFilters ? 'Try adjusting your filters' : 'No email records available'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Sender</th>
                  <th>Recipients</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email._id}>
                    <td>{new Date(email.createdAt).toLocaleString()}</td>
                    <td>{email.subject}</td>
                    <td>{email.userId?.userName || 'Unknown'}</td>
                    <td>{email.recipients.length}</td>
                    <td>
                      <span className={`badge ${email.isBulk ? 'bulk' : 'single'}`}>
                        {email.isBulk ? 'Bulk' : 'Single'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${email.overallStatus}`}>
                        {email.overallStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view"
                        onClick={() => window.location.href = `/admin/emails/${email._id}`}
                        title="View Details"
                      >
                        <MdRemoveRedEye />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(email._id)}
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)} to{' '}
              {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} emails
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span className="page-number">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminEmailManagement;
