# 🍦 Shree Ram Rajasthan Kulfi House

A modern web application for Shree Ram Rajasthan Kulfi House, featuring a beautiful frontend with React.js and a robust backend with Node.js and MongoDB.

## 🌟 Features

### Frontend (React.js)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Auto-sliding Hero Carousel**: Dynamic showcase of products and services
- **Separate Pages**: Dedicated About and Contact pages with modern layouts
- **User Authentication**: Login/Register system with session management
- **Role-based Access**: Admin panel and user dashboard
- **Responsive Design**: Works perfectly on all devices

### Backend (Node.js + MongoDB)
- **RESTful API**: Complete backend API with Express.js
- **User Management**: User registration, authentication, and role management
- **Admin Panel**: Comprehensive admin dashboard with statistics
- **Order Management**: Complete order tracking system
- **Product Management**: Product catalog and inventory management
- **Security**: JWT authentication and middleware protection

## 🚀 Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **CSS3** - Modern styling with animations
- **SessionStorage** - Secure client-side storage

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
Rajaysthani/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Global styles
│   │   └── App.js         # Main app component
│   └── package.json
├── src/                   # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/make-admin` - Make user admin
- `GET /api/admin/orders` - Get all orders

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/phone` - Update phone number

## 🎨 Features Overview

### Home Page
- Auto-sliding hero carousel
- Features section
- Popular products preview
- Modern animations and transitions

### About Page
- Company story and mission
- Team information
- Statistics and achievements
- Professional layout

### Contact Page
- Contact information
- Contact form
- FAQ section
- Interactive map placeholder

### Admin Panel
- Dashboard with statistics
- User management
- Order management
- Product management

### User Dashboard
- Personal profile
- Order history
- Account settings

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Session-based storage
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set environment variables
- Configure MongoDB connection

### Frontend Deployment
- Build the React app: `npm run build`
- Deploy to platforms like Netlify, Vercel, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Shree Ram Rajasthan Kulfi House** - Bringing authentic Rajasthani flavors to your doorstep since 2000.

---

**Note**: This is a full-stack web application showcasing modern web development practices with React.js frontend and Node.js backend. 