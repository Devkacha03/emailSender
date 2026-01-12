import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdSettings, MdSave } from 'react-icons/md';
import adminService from '../../services/adminService';
import './AdminEmailManagement.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSettings();

      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await adminService.updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1><MdSettings /> System Settings</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="dashboard-section">
          <h2>Email Settings</h2>

          <div className="settings-grid">
            <div className="setting-item">
              <label>Email Rate Limit (per batch)</label>
              <input
                type="number"
                value={settings?.emailRateLimit || 10}
                onChange={(e) => setSettings({ ...settings, emailRateLimit: e.target.value })}
                min="1"
                max="100"
              />
              <p className="setting-description">
                Number of emails to send per batch
              </p>
            </div>

            <div className="setting-item">
              <label>Max Attachment Size (MB)</label>
              <input
                type="number"
                value={settings?.maxAttachmentSize || 25}
                onChange={(e) => setSettings({ ...settings, maxAttachmentSize: e.target.value })}
                min="1"
                max="100"
              />
              <p className="setting-description">
                Maximum size for email attachments
              </p>
            </div>

            <div className="setting-item">
              <label>Max Recipients Per Bulk Email</label>
              <input
                type="number"
                value={settings?.maxRecipientsPerBulk || 1000}
                onChange={(e) => setSettings({ ...settings, maxRecipientsPerBulk: e.target.value })}
                min="1"
                max="10000"
              />
              <p className="setting-description">
                Maximum number of recipients per bulk email
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>AI Settings</h2>

          <div className="settings-grid">
            <div className="setting-item">
              <label>AI Email Generation</label>
              <div className="setting-status">
                <span className={`badge ${settings?.enableAI ? 'active' : 'inactive'}`}>
                  {settings?.enableAI ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="setting-description">
                {settings?.enableAI 
                  ? 'AI email generation is configured and ready to use' 
                  : 'Add GROK_API_KEY to .env file to enable AI features'}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>System Status</h2>

          <div className="settings-grid">
            <div className="setting-item">
              <label>Maintenance Mode</label>
              <div className="setting-status">
                <span className={`badge ${settings?.maintenanceMode ? 'status-failed' : 'status-success'}`}>
                  {settings?.maintenanceMode ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="setting-description">
                When enabled, only admins can access the system
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <button type="submit" className="create-btn" disabled={saving}>
            <MdSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
