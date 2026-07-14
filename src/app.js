const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const forgotRoutes = require('./routes/forgotRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Initialize Express
const app = express();

// Connect Database (uses connection caching)
connectDB();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Swagger UI compatibility
}));
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload assets (dynamically resolve writeable path on Vercel)
const staticUploadPath = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(staticUploadPath));

// Logging Middlewares
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base API route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the MVC Auth API.',
    docs: '/api-docs',
  });
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth/forgot', forgotRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
