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
        url: 'http://localhost:5000', // adjust based on your actual dev URL
      },
    ],
  },
  apis: ['./routes/*.js'], // 👈 this tells swagger-jsdoc where to look for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = swaggerSpec;