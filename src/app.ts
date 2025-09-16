import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/authRoutes';

// Create Express app
const app = express();

// Middleware Configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://qzplatform.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

app.options('*', cors()); // Preflight handling
app.use(express.json()); // Parse JSON
app.use(morgan('dev'));

// Swagger Setup
const port = process.env.PORT || 3000;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QzPlatform API',
      version: '1.0.0',
      description: 'API documentation for QzPlatform',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware to strip /api prefix - MUST COME BEFORE ROUTES
app.use((req, res, next) => {
  console.log('Original URL:', req.url); // Debug logging
  if (req.url.startsWith('/api/')) {
    req.url = req.url.substring(4); // Remove '/api'
    console.log('Rewritten URL:', req.url); // Debug logging
  }
  next();
});

// Routes - NOW MOUNTED WITHOUT /api PREFIX
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/auths', authRoutes);
app.use('/api/tests/:testId/questions', require('./routes/questionRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/questions', require('./routes/questionBankRoutes'));
app.use('/api/tests/administer', require('./routes/administerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));

// Error Handler
app.use(errorHandler);

export default app;