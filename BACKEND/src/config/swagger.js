export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DeepStore API',
    version: '1.0.0',
    description:
      'RESTful API for the DeepStore e-commerce application. ' +
      'Business rules (auth, pricing, inventory, orders) are enforced server-side.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Versioned API base',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {},
};