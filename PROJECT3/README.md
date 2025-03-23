# Freelancers' Income and Tax Management Platform

A comprehensive platform for freelancers to manage their income, generate invoices, and calculate tax liabilities automatically.

## Features
- Income tracking and management
- Invoice generation
- Tax liability calculation
- User authentication
- Dashboard for financial overview
- Document management

## Tech Stack
- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB
- Authentication: JWT

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Compass
- npm or yarn

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Project Structure
```
freelancer-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.js
    └── package.json
``` 