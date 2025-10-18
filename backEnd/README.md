
# emailSender Backend

Email Sending Backend – Express.js

A powerful Email Sending Backend API built using Express.js, supporting:

✅ Single Email Sending (with attachments)

✅ Bulk Email Sending via CSV/XLSX File Upload

✅ Bulk Email Sending via Text Input

✅ Secure Email Configuration (Zoho, Gmail, etc.)

✅ JWT-based Authentication

✅ File Uploads with Multer

✅ Clean MVC structure and validation


## Features

- 🔐 Secure Authentication - JWT-based user authentication with bcrypt password hashing

- 📧 Single Email Sending - Send individual emails with multiple attachments

- 📊 Bulk Email via File - Upload Excel/CSV files to send emails to multiple recipients

- 📝 Bulk Email via Text - Send bulk emails by entering email addresses directly

- 📎 File Attachments - Support for multiple file types and attachments

- ⚙️ Email Configuration - Configure SMTP settings for Gmail, Outlook, Yahoo, and custom services

- 📈 Real-time Analytics - Track email statistics, success rates, and error patterns

- 📋 Comprehensive Logging - Detailed email logs with status tracking and error messages


## 🛠 Tech Stack

| Technology       | Purpose               |
|------------------|------------------------|
| Node.js          | Runtime environment    |
| Express.js       | Web framework          |
| MongoDB          | Database               |
| Mongoose         | ODM for MongoDB        |
| Nodemailer       | Email sending          |
| JWT              | Authentication         |
| Bcrypt           | Password hashing       |
| Multer           | File uploads           |
| XLSX             | Excel file parsing     |
| Joi              | Schema validation      |
| Express Validator| Input validation       |

## ## 📬 API Reference

### 👤 User Authentication

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| POST   | `/api/users/signIn`   | Authenticate user and return JWT |
| POST   | `/api/users/signUp`   | Register a new user          |
| GET    | `/api/users/profile`  | Fetch authenticated user's profile |

---

### ⚙️ Email Configuration

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/email-config`       | Save or update SMTP configuration |
| GET    | `/api/email-config`       | Retrieve saved email configuration |

---

### 📧 Email Sending

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| POST   | `/send-single-mail`           | Send a single email with optional attachments |
| POST   | `/api/send-bulk-mail-file`    | Send bulk emails via uploaded Excel/CSV file |
| POST   | `/api/send-bulk-mail-text`    | Send bulk emails via direct text input       |


## 📁 Project Structure

```plaintext
emailSender/
└── backEnd/
    ├── controllers/
    │   ├── emailConfigsController.js
    │   ├── errorsManager.js
    │   └── userController.js
    ├── database/
    │   └── db.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── emailConfigMiddleware.js
    │   └── validationMiddleware.js
    ├── models/
    │   ├── emailConfig.js
    │   └── user.js
    ├── routes/
    │   ├── emailConfigRoute.js
    │   └── userRoute.js
    ├── utils/
    │   ├── email/
    │   │   ├── emailBulkSender.js
    │   │   ├── emailValidator.js
    │   │   └── extractEmails.js
    │   └── file/
    │       ├── fileCleanup.js
    │       ├── fileDecrypt.js
    │       ├── fileUploadConfig.js
    │       ├── mailTransporter.js
    │       └── token.js
    ├── index.js

