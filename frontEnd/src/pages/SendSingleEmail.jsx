import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { MdEmail, MdAttachFile, MdClose, MdSend, MdAutoAwesome } from 'react-icons/md';
import { emailService, aiService } from '../services/api';
import './SendSingleEmail.css';

const SendSingleEmail = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
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
        emailType: 'single'
      });

      if (response.data.success) {
        setFormData({ ...formData, message: response.data.content });
        toast.success('Email content generated successfully! You can edit it as needed.');
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      toast.warning('Maximum 5 attachments allowed');
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
    formDataToSend.append('to', formData.to);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);

    attachments.forEach((file) => {
      formDataToSend.append('attachments', file);
    });

    try {
      await emailService.sendSingle(formDataToSend);
      toast.success('Email sent successfully!');
      // Reset form
      setFormData({ to: '', subject: '', message: '' });
      setAttachments([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
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
        <h1>
          <MdEmail />
          Send Single Email
        </h1>
        <p>Send an email to a single recipient with optional attachments</p>
      </div>

      <div className="email-form-card">
        <form onSubmit={handleSubmit}>
          <div className="email-form-group">
            <label className="email-form-label">Recipient Email *</label>
            <input
              type="email"
              name="to"
              className="email-form-input"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Enter your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            />
            <p className="help-text-small">
              💡 Enter a subject and click AI Generate to auto-create content
            </p>
          </div>

          <div className="attachments-section">
            <label className="email-form-label">Attachments (Max 5 files)</label>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
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
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendSingleEmail;
