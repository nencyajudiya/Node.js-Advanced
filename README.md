# Advanced Node.js Application

A comprehensive Node.js application built with Express, MongoDB, and Socket.io following industry best practices and standards.

## 🚀 Features

- **Authentication System**: JWT-based authentication with avatar support
- **Blog Management**: Full CRUD operations for blog posts with image uploads
- **Real-time Comments**: Socket.io powered real-time commenting system
- **File Upload**: Multer-based file upload with proper validation
- **Error Handling**: Comprehensive error handling middleware
- **Code Standards**: Prettier formatting and ESLint configuration

## 📁 Project Structure

```
Node/Advanced/
├── config/
│   ├── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── blogController.js     # Blog management logic
│   └── commentController.js  # Comment handling logic
├── middleware/
│   ├── authMiddleware.js     # JWT authentication middleware
│   ├── catchAsyncError.js    # Async error catching wrapper
│   └── ErrorMiddleware.js    # Global error handling
├── models/
│   ├── User.js              # User model
│   ├── Blog.js              # Blog model
│   └── Comment.js           # Comment model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── blogRoutes.js        # Blog routes
│   └── commentRoutes.js     # Comment routes
├── utils/
│   └── helpers.js           # Utility functions
├── uploads/                 # File upload directory
├── app.js                   # Express app configuration
├── index.js                 # Application entry point
├── package.json             # Dependencies and scripts
├── .prettierrc              # Code formatting rules
└── .gitignore               # Git ignore rules
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Node/Advanced
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the environment template
   cp config/env.example .env.dev
   
   # Edit .env.dev with your configuration
   nano .env.dev
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```



## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with avatar
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create new blog (authenticated)
- `PUT /api/blogs/:id` - Update blog (authenticated)
- `DELETE /api/blogs/:id` - Delete blog (authenticated)
- `GET /api/blogs/user/me` - Get user's blogs (authenticated)

### Comments
- `GET /api/comments/:blogId` - Get comments for a blog
- `POST /api/comments` - Add comment (authenticated)
- `PUT /api/comments/:id` - Update comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run server` - Start development server with nodemon
- `npm run dev` - Start development server with environment variables
- `npm run format` - Format code with Prettier

## 🏗️ Development Standards

This project follows strict development standards:

- **Error Handling**: All async functions wrapped with `catchAsyncError`
- **Code Formatting**: Prettier configuration for consistent code style
- **File Organization**: Proper folder structure with separation of concerns
- **Environment Management**: Separate development and production configurations
- **Documentation**: Comprehensive code comments and README

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `mongoose` - MongoDB object modeling
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `multer` - File upload handling
- `socket.io` - Real-time communication
- `express-validator` - Input validation
- `cors` - Cross-origin resource sharing
- `morgan` - HTTP request logger

### Development Dependencies
- `nodemon` - Development server with auto-restart
- `prettier` - Code formatter
