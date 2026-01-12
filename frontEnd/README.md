# Email Sender Frontend

A modern, responsive frontend application for the Email Sender backend.

## Features

- 🔐 User Authentication (Login, Signup, Forgot Password)
- ⚙️ Email Configuration Management
- 📧 Send Single Emails with Attachments
- 📨 Send Bulk Emails (via Text or File Upload)
- 📊 Email Analytics Dashboard
- 📜 Email Logs and History
- 🎨 Modern, Responsive UI

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontEnd/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── context/          # React context
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json
└── vite.config.js
```

## Usage

1. **Sign Up**: Create a new account
2. **Login**: Sign in with your credentials
3. **Configure Email**: Set up your email service (Gmail, Outlook, etc.)
4. **Send Emails**: 
   - Single: Send individual emails with attachments
   - Bulk: Upload CSV/Excel or paste email list
5. **View Analytics**: Check email statistics and logs

## API Endpoints Used

- `POST /api/users/signUp` - User registration
- `POST /api/users/signIn` - User login
- `POST /api/email-config` - Configure email settings
- `GET /api/email-config` - Get email configuration
- `POST /api/send-single-mail` - Send single email
- `POST /api/send-bulk-mail-file` - Send bulk emails via file
- `POST /api/send-bulk-mail-text` - Send bulk emails via text
- `GET /api/v2/get-email-logs` - Get email logs
- `GET /api/v2/email-analytics` - Get analytics

## Technologies

- React 18
- Vite
- React Router
- Axios
- React Icons
- React Toastify
