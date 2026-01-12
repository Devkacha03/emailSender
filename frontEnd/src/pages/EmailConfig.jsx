import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdSettings, MdCheckCircle, MdWarning } from 'react-icons/md';
import { emailConfigService } from '../services/api';
import './SendSingleEmail.css';

const EmailConfig = () => {
  const [loading, setLoading] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [formData, setFormData] = useState({
    service: 'gmail',
    email: '',
    password: '',
    host: '',
    port: 587,
    secure: false,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await emailConfigService.getConfig();
      if (response.data) {
        setFormData({
          service: response.data.service,
          email: response.data.email,
          password: '',
          host: response.data.host || '',
          port: response.data.port || 587,
          secure: response.data.secure || false,
        });
        setHasConfig(true);
      }
    } catch (error) {
      // No config found
      setHasConfig(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle port as number
    if (name === 'port') {
      setFormData({ ...formData, [name]: parseInt(value) || 587 });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Auto-populate port and secure based on common defaults
    if (name === 'service') {
      if (value === 'gmail') {
        setFormData({ ...formData, service: value, port: 465, secure: true });
      } else if (value === 'outlook' || value === 'yahoo') {
        setFormData({ ...formData, service: value, port: 587, secure: false });
      } else {
        setFormData({ ...formData, service: value });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate custom SMTP fields
    if (formData.service === 'custom') {
      if (!formData.host || !formData.port) {
        toast.error('Please fill in all custom SMTP fields');
        setLoading(false);
        return;
      }
    }

    try {
      await emailConfigService.setConfig(formData);
      toast.success('Email configuration saved successfully!');
      setHasConfig(true);
      
      // Refetch to ensure we have the latest config
      await fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="single-email-page">
      <div className="single-email-header">
        <h1>
          <MdSettings />
          Email Configuration
        </h1>
        <p>Configure your email service to start sending emails</p>
      </div>

      {hasConfig && (
        <div className="alert alert-success">
          <MdCheckCircle />
          <div>
            <strong>Configuration Active</strong>
            <p>Your email service is configured and ready to use</p>
          </div>
        </div>
      )}

      {!hasConfig && (
        <div className="alert alert-warning">
          <MdWarning />
          <div>
            <strong>No Configuration Found</strong>
            <p>Please configure your email service to start sending emails</p>
          </div>
        </div>
      )}

      <div className="email-form-card">
        <form onSubmit={handleSubmit}>
          <div className="email-form-group">
            <label className="email-form-label">Email Service</label>
            <select
              name="service"
              className="email-form-input"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
              <option value="custom">Custom SMTP</option>
            </select>
            <p className="help-text-small">Select your email service provider</p>
          </div>

          <div className="email-form-group">
            <label className="email-form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="email-form-input"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <p className="help-text-small">The email address you'll send from</p>
          </div>

          <div className="email-form-group">
            <label className="email-form-label">Password / App Password</label>
            <input
              type="password"
              name="password"
              className="email-form-input"
              placeholder="Enter your password or app password"
              value={formData.password}
              onChange={handleChange}
              required={!hasConfig}
            />
            <p className="help-text-small">
              For Gmail, use an <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="link">App Password</a>
            </p>
          </div>

          {formData.service === 'custom' && (
            <>
              <div className="email-form-group">
                <label className="email-form-label">SMTP Host</label>
                <input
                  type="text"
                  name="host"
                  className="email-form-input"
                  placeholder="smtp.example.com"
                  value={formData.host}
                  onChange={handleChange}
                  required={formData.service === 'custom'}
                />
                <p className="help-text-small">Your SMTP server hostname</p>
              </div>

              <div className="email-form-group">
                <label className="email-form-label">SMTP Port</label>
                <input
                  type="number"
                  name="port"
                  className="email-form-input"
                  placeholder="587"
                  value={formData.port}
                  onChange={handleChange}
                  min="1"
                  max="65535"
                  required={formData.service === 'custom'}
                />
                <p className="help-text-small">Common ports: 587 (TLS), 465 (SSL), 25 (non-secure)</p>
              </div>

              <div className="email-form-group">
                <label className="email-form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="secure"
                    checked={formData.secure}
                    onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                    style={{ marginRight: '8px', width: 'auto', cursor: 'pointer' }}
                  />
                  Use SSL (Port 465)
                </label>
                <p className="help-text-small">Enable for port 465, disable for port 587 (TLS)</p>
              </div>
            </>
          )}

          {formData.service !== 'custom' && (
            <div className="alert" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f7ff', border: '1px solid #0066cc', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                <strong>Note:</strong> For {formData.service === 'gmail' ? 'Gmail' : formData.service === 'outlook' ? 'Outlook' : 'Yahoo'}, you must use an <strong>App Password</strong>, not your regular account password.
              </p>
            </div>
          )}

          <div className="email-form-actions">
            <button type="submit" className="send-btn" disabled={loading}>
              {loading ? 'Saving...' : hasConfig ? 'Update Configuration' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-card">
        <h3>Setup Instructions</h3>
        
        <div className="info-section">
          <h4>🔐 Gmail Setup (Recommended)</h4>
          <ol>
            <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="link">Google Account Security</a></li>
            <li>Enable <strong>2-Step Verification</strong></li>
            <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="link">App Passwords</a></li>
            <li>Create a new app password for "Mail"</li>
            <li>Copy the 16-character password and use it here (not your regular Gmail password)</li>
          </ol>
        </div>

        <div className="info-section">
          <h4>📧 Outlook/Hotmail Setup</h4>
          <ol>
            <li>Go to your <a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer" className="link">Microsoft Account Security</a></li>
            <li>Enable two-step verification</li>
            <li>Generate an app password under "App passwords"</li>
            <li>Use the generated password here</li>
          </ol>
        </div>

        <div className="info-section">
          <h4>🌐 Yahoo Mail Setup</h4>
          <ol>
            <li>Go to <a href="https://login.yahoo.com/account/security" target="_blank" rel="noopener noreferrer" className="link">Yahoo Account Security</a></li>
            <li>Enable two-step verification</li>
            <li>Generate an app password</li>
            <li>Use the app password here</li>
          </ol>
        </div>

        <div className="info-section">
          <h4>🛠️ Custom SMTP (Advanced)</h4>
          <p>Use this option for services like SendGrid, Mailgun, AWS SES, or your own mail server:</p>
          <ul>
            <li><strong>SendGrid:</strong> smtp.sendgrid.net (Port 587, Username: "apikey", Password: Your API key)</li>
            <li><strong>Mailgun:</strong> smtp.mailgun.org (Port 587)</li>
            <li><strong>AWS SES:</strong> email-smtp.[region].amazonaws.com (Port 587)</li>
            <li><strong>Mailtrap (Testing):</strong> smtp.mailtrap.io (Port 587)</li>
          </ul>
        </div>

        <div className="info-section" style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ Troubleshooting</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>If emails fail with "Connection Timeout", your firewall or ISP may be blocking SMTP ports</li>
            <li>Try disabling antivirus temporarily or using a VPN</li>
            <li>For testing, use Mailtrap.io (free, no emails actually sent)</li>
            <li>Contact your network administrator if on a corporate network</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailConfig;
