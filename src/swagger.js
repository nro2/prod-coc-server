const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'coc-server',
    },
  },
  apis: ['./src/routes/*.js', './docs/swagger.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
