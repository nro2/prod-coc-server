const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    info: {
      title: 'coc-server',
      description: 'Committee on Committees API',
    },
  },
  apis: ['./src/routes/*.js', './docs/swagger.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
