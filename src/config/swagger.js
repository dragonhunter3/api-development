const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MVC Auth API Documentation',
      version: '1.0.0',
      description: 'API for User Authentication (Email/Password, Google OAuth, and Apple Sign-In) built with Express, MongoDB, and the MVC pattern.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://your-app.vercel.app',
        description: 'Production Vercel Server (Updated dynamically)',
      },
    ],
  },
  // Search path for JSDoc annotations to generate Swagger Spec
  apis: [
    path.join(process.cwd(), 'src/routes/*.js'),
    path.join(__dirname, '../routes/*.js')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
