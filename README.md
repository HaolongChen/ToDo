# ToDo Application

A modern, feature-rich task management application with collaboration capabilities. This full-stack application allows users to create and manage tasks, collaborate with team members, assign tasks to others, and track progress.

## Features

### User Management
- User registration and authentication
- Profile customization with avatar uploads (via Cloudinary)
- Password management
- User profile viewing and editing

### Task Management
- Create, edit, update, and delete tasks
- Mark tasks as important
- Set due dates for tasks
- Mark tasks as completed
- Group tasks into custom categories
- Default smart groups:
  - My Day: Tasks created in the last 24 hours
  - Important: Tasks marked as important
  - Planned: Tasks with due dates
  - Assigned to me: Tasks assigned to you by teammates
  - Assigned by me: Tasks you've assigned to teammates

### Team Collaboration
- Send and receive team requests
- Accept or reject team invitations
- Assign tasks to team members
- Track task completion status of assigned tasks
- Remove team members

### Notifications
- Real-time notification system for team requests, task assignments, and updates
- Notification center to view all notifications

### UI Features
- Responsive design
- Dark/light mode toggle
- Search functionality for tasks, users, and groups
- Drag-and-drop task organization
- Skeleton loading states for better UX

## Tech Stack

### Frontend
- React 19
- React Router v7
- TailwindCSS v4
- Axios for API calls
- React Hot Toast for notifications
- React Image Crop for avatar editing
- Vite as the build tool

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage
- Cookie-based authentication

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas URI)
- Cloudinary account for image uploads

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Installation Steps
1. Clone the repository
   ```
   git clone https://github.com/yourusername/ToDo.git
   cd ToDo
   ```

2. Install dependencies
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Development mode
   ```
   # In one terminal, start the backend
   npm run dev
   
   # In another terminal, start the frontend
   cd frontend
   npm run dev
   ```

4. Production build
   ```
   npm run build
   npm start
   ```

## Deployment

This application is ready to be deployed to platforms like Heroku, Render, or Vercel:

- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`
- **Start Command**: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/user` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/update-profile` - Update user profile

### Todo Management
- `POST /api/todo/create` - Create a new task
- `GET /api/todo/get/:id` - Get tasks by group ID
- `GET /api/todo/getall` - Get all user tasks
- `POST /api/todo/update/:id` - Update a task
- `POST /api/todo/delete/:id` - Delete a task
- `GET /api/todo/get-groups` - Get all user groups
- `POST /api/todo/create-group` - Create a new group
- `POST /api/todo/update-group/:id` - Update a group
- `POST /api/todo/delete-group/:id` - Delete a group

### Team & Notifications
- `GET /api/notification/get-notifications` - Get user notifications
- `POST /api/notification/send-assignment` - Assign a task to a teammate
- `POST /api/notification/edit-assignment` - Edit an assigned task
- `POST /api/notification/delete-assignment-for-single-teammate` - Delete task for one teammate
- `POST /api/notification/delete-assignment-for-all-teammates` - Delete task for all teammates
- `POST /api/notification/send-requests` - Send a team request
- `POST /api/notification/accept/:id` - Accept a team request
- `POST /api/notification/reject/:id` - Reject a team request
- `POST /api/notification/delete/:id` - Delete a notification
- `GET /api/notification/get-requests` - Get team requests
- `GET /api/notification/get-teammates` - Get all teammates
- `GET /api/notification/get-user-info/:id` - Get user profile info
- `POST /api/notification/remove-from-team` - Remove user from team

### Search
- `GET /api/search` - Search for users, todos, and groups
- `GET /api/search/user/:userId` - Get user profile by ID

### Image Management
- `POST /api/image/upload` - Upload user avatar
- `GET /api/image/get` - Get current user avatar

## Database Schema

### User
- username: String (unique)
- password: String (hashed)
- team: Array of User IDs
- pendingTeam: Array of objects {userId, from}
- coverImg: String (URL)
- email: String
- bio: String
- totalTasks: Number
- completedTasks: Number
- totalTeams: Number

### Todo
- description: String
- completed: Boolean
- assigned: Boolean
- important: Boolean
- due: Date
- message: String
- user: Reference to User
- uniqueMarker: String
- username: String

### Group
- name: String
- todo: Array of Todo IDs
- user: Reference to User

### Waitlist (Notifications)
- isRequest: Boolean
- toUser: Reference to User
- fromUser: Reference to User
- isProcessed: Boolean
- todo: Reference to Todo
- message: String
- isOfficial: Boolean

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Haolong