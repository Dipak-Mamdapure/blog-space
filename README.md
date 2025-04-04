BlogSpace - Secure Blog Platform
A modern, secure blogging platform with real-time notifications, built with the MERN stack (MongoDB, Express.js, React, Node.js).


**Features**
- Secure Authentication: User registration and login with encrypted passwords
- Blog Creation: Create and publish blog posts with text content and tags
- Real-time Notifications: Instant notifications when new blogs are published
- User Profiles: Each blog post is associated with its author
- Modern UI: Clean and responsive design using Tailwind CSS and ShadcnUI

**Technologies Used:**  
**Frontend**  
React (with Vite)  
TypeScript  
TanStack Query (React Query) for data fetching  
Wouter for routing  
Zod for schema validation  
Shadcn/UI components  
Tailwind CSS for styling  

**Backend**  
Node.js with Express  
MongoDB with Mongoose  
WebSockets for real-time notifications  
Passport.js for authentication  
TypeScript  
Prerequisites  

# **Before you begin, ensure you have the following installed:**
Node.js (v18 or later)
npm or yarn
MongoDB (local instance or MongoDB Atlas account)
Installation
Clone the repository

git clone https://github.com/yourusername/blogspace.git
cd blogspace
# Install dependencies
npm install **or** yarn install

Create a .env file in the root directory with the following variables:

MONGODB_URI=your_mongodb_connection_string  
SESSION_SECRET=your_session_secret  
PORT=5000  

For local development with MongoDB running locally:  
MONGODB_URI=mongodb://localhost:27017/blogspace  
SESSION_SECRET=your_secret_key  
PORT=5000  

# **Running the Application**
Development Mode
npm run dev **or** yarn dev

**This will start both the frontend and backend in development mode:**

Frontend will be available at: http://localhost:5173
Backend API will be available at: http://localhost:5000
WebSocket server will be available at: ws://localhost:5000/ws

# Production Build
npm run build or yarn build
# To start the production server:
npm start **or** yarn start

# **API Documentation**

# **Authentication Endpoints** 
**Register a new user**  
POST /api/register
Request body: { username: string, password: string }  
Response: User object

**Authenticate a user**  
POST /api/login  
Request body: { username: string, password: string }  
Response: User object  

**Log out the current user**  
POST /api/logout  
Response: Status 200 on success  

**Get current authenticated user**  
GET /api/user  
Response: User object or 401 if not authenticated  

# **Blog Endpoints**  
**Get all blog posts**  
GET /api/blogs  
Response: Array of blog posts  

**Get a specific blog post**  
GET /api/blogs/:id  
Response: Blog post object  

**Get all blog posts by a specific user**  
GET /api/blogs/user/:userId  
Response: Array of blog posts  

**Create a new blog post (authenticated)**  
POST /api/blogs  
Request body: { title: string, content: string, tags?: string }  
Response: New blog post object  

# **Notification Endpoints**  
**Get all notifications**  
GET /api/notifications  
Response: Array of notification objects  

**Get notifications for a specific user**  
GET /api/notifications/user/:userId  
Response: Array of notification objects  

**Mark a notification as read**  
POST /api/notifications/:id/read  
Response: Updated notification object  

# **WebSocket API**
The application uses WebSockets for real-time notifications. Connect to ws://localhost:5000/ws to receive real-time updates when new blog posts are created.

# **Open a Pull Request**
License
This project is licensed under the MIT License - see the LICENSE file for details.

# **Acknowledgements**
React
Express
MongoDB
Tailwind CSS
Shadcn/UI
TanStack Query
Created with ❤️ by **Dipak Mamdapure**
