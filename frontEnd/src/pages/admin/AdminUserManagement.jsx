import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdPeople, MdSearch, MdDelete, MdEdit, MdToggleOn, MdToggleOff, MdRemoveRedEye, MdClear, MdRefresh, MdFilterList } from 'react-icons/md';
import adminService from '../../services/adminService';
import './AdminEmailManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total || response.data.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
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
      role: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchUsers();
    toast.success('Data refreshed!');
  };

  const hasActiveFilters = searchTerm || filters.role || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="admin-user-management">
      <div className="page-header">
        <h1><MdPeople /> User Management</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
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
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              <MdClear />
            </button>
          )}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label><MdFilterList /> Role</label>
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="filter-group">
            <label><MdFilterList /> Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Emails Sent</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.userName}</td>
                    <td>{user.userEmail}</td>
                    <td>
                      <select
                        className={`badge ${user.role}`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.stats?.emailsSent || 0}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(user._id)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <MdToggleOff /> : <MdToggleOn />}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="no-data">
              <MdPeople />
              <p>No users found</p>
              {hasActiveFilters && <p className="no-data-hint">Try adjusting your filters</p>}
            </div>
          )}

          <div className="pagination">
            <div className="pagination-info">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)} to{' '}
              {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} users
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

export default AdminUserManagement;
