import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { MdSend, MdUploadFile, MdAttachFile, MdClose, MdDescription, MdAutoAwesome } from 'react-icons/md';
import { emailService, aiService } from '../services/api';
import './SendSingleEmail.css';

const SendBulkEmail = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendMethod, setSendMethod] = useState('file'); // 'file' or 'text'
  const [emailFile, setEmailFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    emails: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateEmailContent = async () => {
    if (!formData.subject.trim()) {
      toast.warning('Please enter a subject first to generate email content');
      return;
    }

    setGenerating(true);

    try {
      const response = await aiService.generateEmail({
        subject: formData.subject,
        emailType: 'bulk'
      });

      if (response.data.success) {
        setFormData({ ...formData, message: response.data.content });
        toast.success('Email content generated successfully! You can customize it as needed.');
      } else {
        toast.error(response.data.message || 'Failed to generate email content');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate email content. Please try again.';
      toast.error(errorMessage);
      
      // If API fails, show a helpful message
      if (errorMessage.includes('API key')) {
        toast.info('💡 Please configure GEMINI_API_KEY in your backend .env file');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx)$/)) {
        toast.error('Please upload a valid CSV or Excel file');
        return;
      }
      setEmailFile(file);
    }
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 3) {
      toast.warning('Maximum 3 attachments allowed for bulk emails');
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);

    if (sendMethod === 'file') {
      if (!emailFile) {
        toast.error('Please upload an email list file');
        setLoading(false);
        return;
      }
      formDataToSend.append('docs', emailFile);

      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      try {
        await emailService.sendBulkFile(formDataToSend);
        toast.success('Bulk emails are being sent!');
        // Reset form
        setFormData({ subject: '', message: '', emails: '' });
        setEmailFile(null);
        setAttachments([]);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send bulk emails');
      } finally {
        setLoading(false);
      }
    } else {
      if (!formData.emails.trim()) {
        toast.error('Please enter at least one email address');
        setLoading(false);
        return;
      }
      formDataToSend.append('emails', formData.emails);

      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      try {
        await emailService.sendBulkText(formDataToSend);
        toast.success('Bulk emails are being sent!');
        // Reset form
        setFormData({ subject: '', message: '', emails: '' });
        setAttachments([]);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send bulk emails');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="single-email-page">
      <div className="single-email-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h1 style={{ margin: 0 }}>
            <MdSend />
            Send Bulk Emails
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${sendMethod === 'file' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSendMethod('file')}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <MdUploadFile />
              Upload File
            </button>
            <button
              type="button"
              className={`btn ${sendMethod === 'text' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSendMethod('text')}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <MdDescription />
              Paste Emails
            </button>
          </div>
        </div>
        <p>Send emails to multiple recipients at once</p>
      </div>

      <div className="email-form-card">
        <form onSubmit={handleSubmit}>
          {sendMethod === 'file' ? (
            <div className="email-form-group">
              <label className="email-form-label">Upload Email List (CSV/Excel) *</label>
              <input
                type="file"
                id="emailFile"
                onChange={handleEmailFileChange}
                style={{ display: 'none' }}
                accept=".csv,.xlsx,.xls"
              />
              <label htmlFor="emailFile" className="attachment-btn">
                <MdUploadFile />
                Choose File
              </label>
              <p className="help-text-small">
                📋 Upload CSV/Excel with columns: <strong>email, name</strong> (name is optional)
                <br />
                Example CSV content:
                <br />
                <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px' }}>
                  email,name<br />
                  sunil@email.com,Sunil<br />
                  smit@email.com,Smit
                </code>
                <br />
                💡 Add names to personalize with {'{{name}}'} in your message!
              </p>

              {emailFile && (
                <div className="attachment-item" style={{ marginTop: '12px' }}>
                  <MdDescription />
                  <div className="attachment-info">
                    <div className="attachment-name">{emailFile.name}</div>
                    <div className="attachment-size">{formatFileSize(emailFile.size)}</div>
                  </div>
                  <button
                    type="button"
                    className="attachment-remove"
                    onClick={() => setEmailFile(null)}
                  >
                    <MdClose />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="email-form-group">
              <label className="email-form-label">Email Addresses *</label>
              <textarea
                name="emails"
                className="email-textarea"
                placeholder="Enter email addresses with names (optional):&#10;sunil@email.com,Sunil&#10;smit@email.com,Smit&#10;&#10;Or just emails (comma or newline separated):&#10;example@email.com, another@email.com"
                value={formData.emails}
                onChange={handleChange}
                rows="3"
                required
                style={{ minHeight: '80px', maxHeight: '120px' }}
              />
              <p className="help-text-small">
                📋 Format: <strong>email,name</strong> or just email (one per line or comma-separated)
                <br />
                Example:
                <br />
                <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px' }}>
                  sunil@email.com,Sunil<br />
                  smit@email.com,Smit<br />
                </code>
                Or just: <code style={{ fontSize: '11px' }}>email1@test.com, email2@test.com</code>
              </p>
            </div>
          )}

          <div className="email-form-group">
            <label className="email-form-label">Subject *</label>
            <input
              type="text"
              name="subject"
              className="email-form-input"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="email-form-group">
            <div className="message-header">
              <label className="email-form-label">Message *</label>
              <button
                type="button"
                className={`ai-generate-btn ${generating ? 'generating' : ''}`}
                onClick={generateEmailContent}
                disabled={generating || !formData.subject.trim()}
                title={generating ? 'Generating...' : 'Generate email content using AI'}
              >
                <MdAutoAwesome />
                {generating ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              name="message"
              className="email-textarea"
              placeholder="Enter your message with personalization:&#10;&#10;Dear {{name}},&#10;&#10;We are excited to reach out to you about our new product launch!&#10;&#10;Best regards"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              required
              style={{ minHeight: '220px', maxHeight: '220px' }}
            />
            <div className="help-text-small" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                ✨ Use <strong>{'{{name}}'}</strong> to personalize each email with recipient's name
                <br />
                💡 Click AI Generate to create content, then add {'{{name}}'} where needed
                <br />
                📧 If no name provided, "Dear Valued Customer" will be used
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
            {showPreview && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                  📨 Preview (Example with name "John"):
                </div>
                <div style={{
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  background: 'white',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {formData.message.replace(/\{\{name\}\}/gi, 'John') || 'Enter a message to see preview...'}
                </div>
              </div>
            )}
          </div>

          <div className="attachments-section">
            <label className="email-form-label">Attachments (Max 3 files)</label>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleAttachmentsChange}
              style={{ display: 'none' }}
              accept="*/*"
            />
            <label htmlFor="attachments" className="attachment-btn">
              <MdAttachFile />
              Choose Files
            </label>
            <p className="attachment-count">
              {attachments.length} file(s) selected
            </p>

            {attachments.length > 0 && (
              <div className="attachment-list">
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <MdAttachFile />
                    <div className="attachment-info">
                      <div className="attachment-name">{file.name}</div>
                      <div className="attachment-size">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="attachment-remove"
                      onClick={() => removeAttachment(index)}
                    >
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="email-form-actions">
            <button type="submit" className="send-btn" disabled={loading}>
              <MdSend />
              {loading ? 'Sending...' : 'Send Bulk Emails'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendBulkEmail;
