import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdDescription, MdSearch, MdAdd, MdEdit, MdDelete, MdClear, MdRefresh, MdFilterList } from 'react-icons/md';
import adminService from '../../services/adminService';
import './AdminEmailManagement.css';

const AdminTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: '',
    category: 'other',
    isActive: true
  });

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTemplates({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });

      if (response.data.success) {
        setTemplates(response.data.templates);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total || response.data.templates?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        await adminService.updateTemplate(editingTemplate._id, formData);
        toast.success('Template updated successfully');
      } else {
        await adminService.createTemplate(formData);
        toast.success('Template created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      message: template.message,
      category: template.category,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminService.deleteTemplate(id);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      message: '',
      category: 'other',
      isActive: true
    });
    setEditingTemplate(null);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchTemplates();
    toast.success('Data refreshed!');
  };

  const hasActiveFilters = searchTerm || filters.category || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="admin-template-management">
      <div className="page-header">
        <h1><MdDescription /> Template Management</h1>
        <div className="header-actions">
          <button className="create-btn" onClick={() => setShowModal(true)}>
            <MdAdd /> Create Template
          </button>
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
            placeholder="Search templates by name or subject..."
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
            <label><MdFilterList /> Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="marketing">Marketing</option>
              <option value="newsletter">Newsletter</option>
              <option value="notification">Notification</option>
              <option value="transactional">Transactional</option>
              <option value="other">Other</option>
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
          <p>Loading templates...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Usage Count</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template._id}>
                    <td>{template.name}</td>
                    <td>{template.subject}</td>
                    <td>
                      <span className="badge">
                        {template.category}
                      </span>
                    </td>
                    <td>{template.usageCount}</td>
                    <td>
                      <span className={`badge ${template.isActive ? 'active' : 'inactive'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(template)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(template._id)}
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

          {templates.length === 0 && (
            <div className="no-data">
              <MdDescription />
              <p>No templates found</p>
              {hasActiveFilters && <p className="no-data-hint">Try adjusting your filters</p>}
            </div>
          )}

          <div className="pagination">
            <div className="pagination-info">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)} to{' '}
              {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} templates
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

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTemplate ? 'Edit Template' : 'Create Template'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="marketing">Marketing</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="notification">Notification</option>
                  <option value="transactional">Transactional</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="8"
                  required
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplateManagement;
