const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const authHandler = require("./middlewares/authHandler");
const connectDB = require('./config/db');
//const { executeScheduledAssignments } = require('./utils/scheduler');
const { startCountdown } = require('./utils/countDown');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const morgan = require('morgan');
require('dotenv').config();

// App configuration
const app = express();
const port = process.env.PORT || 3000;

// Swagger Setup
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
        url: `http://localhost:${port}`, // dynamically reflects the actual port
      },
    ],
  },
  apis: ['./routes/*.js'], // Looks for Swagger comments in route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://qzplatform.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

app.options('*', cors()); // Preflight handling
app.use(express.json()); // Use for parsing json from request 

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/tests/:testId/questions", require("./routes/questionRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/questions", require("./routes/questionBankRoutes"));
app.use("/api/tests/administer", require("./routes/administerRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/superadmin", require("./routes/superAdminRoutes"));
app.use("/api/waitlist", require("./routes/waitlistRoutes"));
app.use(morgan("dev"));

// Error Handler
app.use(errorHandler);

// Background Jobs
//startCountdown();
//executeScheduledAssignments();

// Connect to DB & Start Server
connectDB();

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
});
