import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdTrendingUp, MdEmail, MdPeople, MdCheckCircle, MdError, MdBarChart, MdRefresh, MdCalendarToday, MdClear } from 'react-icons/md';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import adminService from '../../services/adminService';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day'
  });
  const [activePreset, setActivePreset] = useState('');

  // Chart colors
  const COLORS = {
    success: '#10b981',
    failed: '#ef4444',
    partial: '#f59e0b',
    pending: '#6366f1',
    bulk: '#8b5cf6',
    single: '#06b6d4'
  };

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Date presets
  const datePresets = [
    { label: 'Today', value: 'today', days: 0 },
    { label: 'Last 7 Days', value: '7days', days: 7 },
    { label: 'Last 30 Days', value: '30days', days: 30 },
    { label: 'Last 3 Months', value: '3months', days: 90 },
    { label: 'Last 6 Months', value: '6months', days: 180 },
    { label: 'Last Year', value: '1year', days: 365 }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics(dateRange);

      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
    toast.info('Analytics refreshed');
  };

  const handlePresetClick = (preset) => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (preset.days === 0) {
      // Today
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - preset.days);
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupBy: preset.days <= 7 ? 'day' : preset.days <= 30 ? 'day' : preset.days <= 90 ? 'day' : 'month'
    });
    setActivePreset(preset.value);
    toast.success(`Showing data for ${preset.label}`);
  };

  const handleClearFilters = () => {
    setDateRange({
      startDate: '',
      endDate: '',
      groupBy: 'day'
    });
    setActivePreset('');
    toast.info('Filters cleared');
  };

  const hasActiveFilters = dateRange.startDate || dateRange.endDate || activePreset;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="no-data">
        <MdBarChart />
        <h3>No Analytics Data Available</h3>
        <p>Analytics data will appear here once emails are sent.</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <h1><MdTrendingUp /> Analytics & Reports</h1>
        <button className="refresh-btn" onClick={handleRefresh}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Modern Filter Section */}
      <div className="modern-filters">
        {/* Quick Date Presets */}
        <div className="date-presets">
          <div className="presets-label">
            <MdCalendarToday /> Quick Select:
          </div>
          <div className="presets-buttons">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                className={`preset-btn ${activePreset === preset.value ? 'active' : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="custom-filters">
          <div className="filters-row">
            <div className="filter-group">
              <label><MdCalendarToday /> Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, startDate: e.target.value });
                  setActivePreset('');
                }}
              />
            </div>
            <div className="filter-group">
              <label><MdCalendarToday /> End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, endDate: e.target.value });
                  setActivePreset('');
                }}
              />
            </div>
            <div className="filter-group">
              <label><MdBarChart /> Group By</label>
              <select
                value={dateRange.groupBy}
                onChange={(e) => setDateRange({ ...dateRange, groupBy: e.target.value })}
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="filter-group">
                <label style={{ opacity: 0 }}>Clear</label>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  <MdClear /> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Performance Charts Section */}
      <div className="charts-section">
        <h2 className="section-title"><MdBarChart /> Email Performance Charts</h2>
        
        <div className="charts-grid">
          {/* Line Chart - Email Trends Over Time */}
          <div className="chart-card">
            <h3>📊 Email Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.emailTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="success" stroke={COLORS.success} strokeWidth={2} dot={{ r: 4 }} name="Success" />
                <Line type="monotone" dataKey="failed" stroke={COLORS.failed} strokeWidth={2} dot={{ r: 4 }} name="Failed" />
                <Line type="monotone" dataKey="partial" stroke={COLORS.partial} strokeWidth={2} dot={{ r: 4 }} name="Partial" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Email Status Distribution */}
          <div className="chart-card">
            <h3>🥧 Email Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry._id] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Bulk vs Single Emails */}
          <div className="chart-card">
            <h3>📊 Bulk vs Single Emails</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.typeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill={COLORS.bulk} name="Email Count">
                  {analytics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry._id === 'bulk' ? COLORS.bulk : COLORS.single} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart - Email Volume Trends */}
          <div className="chart-card">
            <h3>📈 Email Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.emailTrend}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" name="Total Emails" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Trend Line */}
          <div className="chart-card full-width">
            <h3>🎯 Success Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.emailTrend.map(item => ({
                ...item,
                successRate: item.total > 0 ? ((item.success / item.total) * 100).toFixed(2) : 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} unit="%" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Line type="monotone" dataKey="successRate" stroke={COLORS.success} strokeWidth={3} dot={{ r: 5 }} name="Success Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Activity Charts Section */}
      <div className="charts-section">
        <h2 className="section-title"><MdPeople /> User Activity Charts</h2>
        
        <div className="charts-grid">
          {/* Pie Chart - Active vs Inactive Users Ratio */}
          <div className="chart-card">
            <h3>📈 User Success Rate Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topUsers.map(user => ({
                    name: user.userName,
                    value: parseFloat(user.successRate.toFixed(1))
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.topUsers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="dashboard-section">
        <h2><MdPeople /> Top Users by Email Count</h2>
        {analytics.topUsers && analytics.topUsers.length > 0 ? (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Total Emails</th>
                  <th>Successful</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>{user.userName || 'N/A'}</td>
                    <td>{user.userEmail || 'N/A'}</td>
                    <td><strong>{user.emailCount.toLocaleString()}</strong></td>
                    <td>{user.successCount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${user.successRate >= 80 ? 'status-success' : user.successRate >= 50 ? 'status-partial' : 'status-failed'}`}>
                        {user.successRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No user data available</p>
        )}
      </div>

      {/* Email Trend Table */}
      <div className="dashboard-section">
        <h2><MdTrendingUp /> Email Trend Details</h2>
        {analytics.emailTrend && analytics.emailTrend.length > 0 ? (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date/Period</th>
                  <th>Total</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Partial</th>
                  <th>Bulk</th>
                  <th>Single</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.emailTrend.map((trend) => {
                  const successRate = trend.total > 0 ? ((trend.success / trend.total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={trend._id}>
                      <td><strong>{trend._id}</strong></td>
                      <td><strong>{trend.total.toLocaleString()}</strong></td>
                      <td>
                        <span className="badge status-success">{trend.success}</span>
                      </td>
                      <td>
                        <span className="badge status-failed">{trend.failed}</span>
                      </td>
                      <td>
                        <span className="badge status-partial">{trend.partial || 0}</span>
                      </td>
                      <td>{trend.bulk || 0}</td>
                      <td>{trend.single || 0}</td>
                      <td>
                        <span className={`badge ${successRate >= 80 ? 'status-success' : successRate >= 50 ? 'status-partial' : 'status-failed'}`}>
                          {successRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No trend data available</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
