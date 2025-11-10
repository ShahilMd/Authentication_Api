// swagger.js
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication Service API",
      version: "1.0.0",
      description: "API documentation for the authentication service deployed on Render",
    },
    servers: [
      {
        url: "https://authentication-api-backend-kb8e.onrender.com", // Replace with your deployed backend URL
      },
    ],
     components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to your route files where you’ll add Swagger comments
};

const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };
