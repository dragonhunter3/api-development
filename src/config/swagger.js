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
        url: 'http://myapplicationtest.chickenkiller.com',
        description: 'Custom Domain Server (Port 80)',
      },
      {
        url: 'http://myapplicationtest.chickenkiller.com:3000',
        description: 'Custom Domain Server (Port 3000)',
      },
      {
        url: 'https://api-development-sigma.vercel.app',
        description: 'Production Vercel Server',
      },
    ],
  },
  // Search path for JSDoc annotations to generate Swagger Spec
  apis: [
    './src/routes/*.js',
    './routes/*.js',
    './api/routes/*.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
