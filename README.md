# 📋 ToDo Application

<div align="center">

![ToDo App Logo](frontend/public/icon.svg)

[![Deployment Status](https://img.shields.io/website?url=https%3A%2F%2Ftodo-qkmo.onrender.com&style=for-the-badge&logo=render&logoColor=white&label=Deployment)](https://todo-qkmo.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

## 🌟 Overview

A modern, feature-rich task management application with robust collaboration capabilities. This full-stack MERN application allows users to create and manage tasks, collaborate with team members, assign tasks to others, and track progress in real-time.

### ✨ [Live Demo](https://todo-qkmo.onrender.com)

## ✨ Key Features

### 👤 User Management
- **Secure Authentication**: Register, login, and manage your account securely
- **Profile Customization**: Upload and edit avatars via Cloudinary integration
- **Password Management**: Change and reset passwords with secure hashing
- **User Profiles**: View and edit personal information and track productivity stats

### 📝 Task Management
- **Complete CRUD Operations**: Create, read, update, and delete tasks effortlessly
- **Task Prioritization**: Mark important tasks for focused attention
- **Due Date Tracking**: Set and monitor deadlines to stay on schedule
- **Completion Tracking**: Mark tasks as completed and view progress statistics
- **Custom Categories**: Group tasks into personalized categories
- **Smart Grouping System**:
  - **📅 My Day**: Tasks created in the last 24 hours for daily focus
  - **⭐ Important**: Priority tasks requiring immediate attention
  - **📆 Planned**: Tasks with upcoming deadlines
  - **📥 Assigned to me**: Tasks delegated by team members
  - **📤 Assigned by me**: Tasks you've delegated to your team

### 👥 Team Collaboration
- **Team Building**: Send, receive, accept, and reject team requests
- **Task Assignment**: Delegate tasks to specific team members
- **Progress Monitoring**: Track completion status of assigned tasks in real-time
- **Team Management**: Add or remove team members as projects evolve

### 🔔 Notifications
- **Real-time Updates**: Instant notification system for team activities
- **Comprehensive Notification Center**: Central hub for all alerts and updates
- **Action-based Notifications**: Alerts for assignments, team requests, and task updates

### 🎨 UI/UX Features
- **Responsive Design**: Optimal experience across all devices (mobile, tablet, desktop)
- **Dark/Light Mode**: Toggle between themes based on preference or time of day
- **Advanced Search**: Quickly find tasks, users, and groups with the search functionality
- **Drag-and-Drop Interface**: Intuitive task organization between groups
- **Loading States**: Skeleton loading for improved perceived performance
- **Clean, Modern Interface**: Intuitive design focused on productivity

## 🛠️ Tech Stack

### 🌐 Frontend
- **React 19**: Latest version for building the user interface
- **React Router v7**: Advanced client-side routing with latest features
- **TailwindCSS v4**: Utility-first CSS framework for rapid UI development
- **Axios**: Promise-based HTTP client for API requests
- **React Hot Toast**: Elegant notification system
- **React Image Crop**: Advanced image cropping for avatar customization
- **Vite**: Next-generation frontend build tool for faster development

### ⚙️ Backend
- **Node.js**: JavaScript runtime for server-side logic
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Elegant MongoDB object modeling
- **JWT**: Secure JSON Web Token authentication
- **Bcrypt**: Strong password hashing for security
- **Cloudinary**: Cloud-based image management
- **Cookie-based Auth**: Secure, stateful authentication system

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v16 or higher
- **MongoDB**: Local installation or Atlas URI connection
- **Cloudinary**: Account for image storage (free tier available)
- **Git**: For cloning the repository

### 🔧 Environment Setup
Create a `.env` file in the root directory with the following variables:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 📥 Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ToDo.git
   cd ToDo
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Development mode**
   ```bash
   # Terminal 1: Start the backend server
   npm run dev
   
   # Terminal 2: Start the frontend development server
   cd frontend
   npm run dev
   ```
   Your app should now be running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

4. **Production build**
   ```bash
   # Build the React frontend
   npm run build
   
   # Start the production server
   npm start
   ```
   The application will be available at http://localhost:5000

## 🌎 Deployment

### 🔗 Live Application
The application is deployed and accessible at: **[https://todo-qkmo.onrender.com](https://todo-qkmo.onrender.com)**

### 🚀 Deployment Instructions
This application is optimized for deployment on platforms like Render, Heroku, or Vercel.

#### Configuration Settings
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`
- **Start Command**: `npm start`

#### Deployment Steps
1. Connect your GitHub repository to your deployment platform
2. Configure the environment variables as described in the Environment Setup section
3. Use the configuration settings above
4. Deploy your application

#### Performance Optimizations
- The application includes mobile responsiveness
- SEO optimizations are implemented
- Structured data for rich search results
- Optimized for fast load times

## 🔌 API Documentation

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/signin` | Login and authenticate a user |
| `POST` | `/api/auth/logout` | Logout and clear user session |
| `GET` | `/api/auth/user` | Retrieve current authenticated user data |
| `POST` | `/api/auth/change-password` | Update user password securely |
| `POST` | `/api/auth/update-profile` | Update user profile information |

### 📝 Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/todo/create` | Create a new task |
| `GET` | `/api/todo/get/:id` | Retrieve tasks by group ID |
| `GET` | `/api/todo/getall` | Retrieve all tasks for current user |
| `POST` | `/api/todo/update/:id` | Update an existing task |
| `POST` | `/api/todo/delete/:id` | Delete a specific task |
| `GET` | `/api/todo/get-groups` | Retrieve all task groups |
| `POST` | `/api/todo/create-group` | Create a new task group |
| `POST` | `/api/todo/update-group/:id` | Update group properties |
| `POST` | `/api/todo/delete-group/:id` | Delete a task group |

### 👥 Team & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notification/get-notifications` | Retrieve user notifications |
| `POST` | `/api/notification/send-assignment` | Assign task to teammate |
| `POST` | `/api/notification/edit-assignment` | Edit an assigned task |
| `POST` | `/api/notification/delete-assignment-for-single-teammate` | Remove task for one teammate |
| `POST` | `/api/notification/delete-assignment-for-all-teammates` | Remove task for all teammates |
| `POST` | `/api/notification/send-requests` | Send team collaboration request |
| `POST` | `/api/notification/accept/:id` | Accept team invitation |
| `POST` | `/api/notification/reject/:id` | Reject team invitation |
| `POST` | `/api/notification/delete/:id` | Delete notification |
| `GET` | `/api/notification/get-requests` | Retrieve pending team requests |
| `GET` | `/api/notification/get-teammates` | Retrieve team members list |
| `GET` | `/api/notification/get-user-info/:id` | Get user profile details |
| `POST` | `/api/notification/remove-from-team` | Remove member from team |

### 🔍 Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search` | Search users, tasks, and groups |
| `GET` | `/api/search/user/:userId` | Retrieve user profile by ID |

### 🖼️ Image Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/image/upload` | Upload user avatar image |
| `GET` | `/api/image/get` | Retrieve current user avatar |

## 💾 Database Schema

### 👤 User
| Field | Type | Description |
|-------|------|-------------|
| `username` | String (unique) | User's unique identifier |
| `password` | String (hashed) | Securely hashed password |
| `team` | Array of User IDs | Team members connected to user |
| `pendingTeam` | Array of Objects | Pending team requests `{userId, from}` |
| `coverImg` | String (URL) | Profile avatar image URL |
| `email` | String | User's email address |
| `bio` | String | User's personal/professional bio |
| `totalTasks` | Number | Count of all tasks created |
| `completedTasks` | Number | Count of completed tasks |
| `totalTeams` | Number | Count of team connections |

### 📝 Todo
| Field | Type | Description |
|-------|------|-------------|
| `description` | String | Task description text |
| `completed` | Boolean | Completion status |
| `assigned` | Boolean | Whether task is assigned |
| `important` | Boolean | Priority status flag |
| `due` | Date | Task deadline date |
| `message` | String | Optional note for task |
| `user` | Reference to User | Task owner reference |
| `uniqueMarker` | String | Identifier for assignments |
| `username` | String | Creator's username |

### 📁 Group
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Group category name |
| `todo` | Array of Todo IDs | Tasks in this group |
| `user` | Reference to User | Group owner reference |

### 🔔 Waitlist (Notifications)
| Field | Type | Description |
|-------|------|-------------|
| `isRequest` | Boolean | Whether it's a team request |
| `toUser` | Reference to User | Recipient user reference |
| `fromUser` | Reference to User | Sender user reference |
| `isProcessed` | Boolean | Whether notification is processed |
| `todo` | Reference to Todo | Related task (if applicable) |
| `message` | String | Notification message |
| `isOfficial` | Boolean | System notification flag |

## 📱 Mobile Responsiveness

The ToDo application is fully optimized for mobile devices:

- Responsive design adapts to all screen sizes
- Touch-friendly interface elements
- Optimized for both portrait and landscape orientations
- Touch gesture support for common actions
- Mobile-specific enhancements for better usability

## 🔍 SEO Optimization

This project implements comprehensive SEO best practices:

- Semantic HTML structure
- Structured data for rich search results
- Optimized meta tags and descriptions
- Mobile-friendly design (Google ranking factor)
- Sitemap.xml for better indexing
- Robots.txt configuration for search crawlers
- Accessible to screen readers and assistive technologies

## 🔒 Security Features

- JWT authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- Protection against common web vulnerabilities
- Secure API endpoints with proper authorization

## 🛣️ Roadmap

Future enhancements planned for the ToDo application:

- [ ] Calendar view for better deadline visualization
- [ ] Email notifications for important updates
- [ ] Advanced filtering and sorting options
- [ ] Task templates for recurring tasks
- [ ] Time tracking and productivity analytics
- [ ] Advanced team permission management
- [ ] Public API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Haolong** - [GitHub Profile](https://github.com/Haolong)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request