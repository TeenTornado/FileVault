# FileVault

FileVault is a secure file storage application that uses Google Drive as the backend storage system. It provides a user-friendly interface for uploading, viewing, and managing files.

## Features

- User authentication with JWT
- File upload with progress tracking
- File browser with grid and list views
- File search and sorting
- File deletion
- Storage usage tracking

## Technologies

- **Backend**: Flask, MongoDB, Google Drive API
- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB Atlas account
- Google Cloud Platform account with Drive API enabled

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```
   python config.py --mongodb_uri "your_mongodb_uri" --jwt_secret "your_jwt_secret" --service_account_file "path_to_service_account.json" --port 5000
   ```

4. Start the server:
   ```
   python app.py
   ```

### Frontend Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## License

This project is licensed under the MIT License.
