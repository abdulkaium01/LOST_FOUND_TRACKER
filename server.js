const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const path = require('path');

// Load environment variables from a config file
dotenv.config({ path: './config/config.env' });

// Connect to the MongoDB database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const categories = require('./routes/categoryRoutes');
const items = require('./routes/itemRoutes');
const users = require('./routes/userRoutes');

// Initialize the Express application
const app = express();

// --- Middleware Setup ---

// Enable CORS (Cross-Origin Resource Sharing)
// This allows your API to be accessed from different domains,
// which is crucial for a frontend application running on a separate server.
app.use(cors());

// Body parser to handle JSON data in the request body
app.use(express.json());

// Cookie parser to parse cookies attached to the client request
app.use(cookieParser());

// Serve static images from the 'uploads/images' directory
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// --- Route Mounting ---

// Mount the routers to their respective API endpoints
app.use('/api/auth', auth);
app.use('/api/categories', categories);
app.use('/api/items', items);
app.use('/api/users', users);

// --- Server Startup ---

// Set the port for the server, using a default of 3000 if not specified in the environment
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// --- Error Handling ---

// Handle unhandled promise rejections gracefully
// This prevents the application from crashing on unhandled errors
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close the server and exit the process with a failure code
  server.close(() => process.exit(1));
});
