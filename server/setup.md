# Smart Task Management App - Backend Setup & Testing

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running on localhost:27017)
3. **npm** or **yarn**

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory with the following content:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-task-management
JWT_SECRET=your-super-secret-jwt-key-for-development-only
JWT_EXPIRE=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as a service)
# MongoDB should start automatically

# Or start manually
mongod
```

### 4. Start the Backend Server
```bash
npm start
```

The server will start on `http://localhost:5000`

### 5. Test the Backend
```bash
node test-backend.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering/sorting)
- `GET /api/tasks/dashboard` - Get dashboard data
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task as completed

### Admin (Admin role required)
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/audit` - View audit logs

### AI Features
- `POST /api/ai/predict-category` - Predict next category
- `POST /api/ai/generate-description` - Generate description from summary
- `GET /api/ai/admin-report` - Generate admin report

## Test Data

The test script will create:
- A test user account
- Sample tasks
- Test all CRUD operations

## Troubleshooting

1. **MongoDB Connection Error**: Make sure MongoDB is running
2. **Port Already in Use**: Change PORT in .env file
3. **JWT Error**: Check JWT_SECRET in .env file
4. **Dependencies Missing**: Run `npm install` again

## Next Steps

After successful backend testing:
1. Set up the React frontend
2. Configure Google OAuth (optional)
3. Set up OpenAI API key for AI features (optional) 