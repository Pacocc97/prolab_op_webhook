const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const routes = require('./routes');

// Define the origin(s) you want to allow
const allowedOrigins = ['http://localhost:3000']; // Add other origins as needed

// Configure CORS options
const corsOptions = {
  origin: allowedOrigins, // Allow only the specified origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true, // Allow cookies and other credentials
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

// Use the CORS middleware with the defined options
app.use(cors(corsOptions));

// Alternatively, to allow all origins (not recommended for production)
// app.use(cors());

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount your routes
app.use('/', routes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Servidor Express en puerto ${PORT}`);
});