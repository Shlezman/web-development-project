const express = require('express');
const mongo = require('mongoose');
const bodyParser = require('body-parser');
// npm install express-validator
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Load environment variables
dotenv.config();
// Body Parser
app.use(bodyParser.json());

// CORS configuration to allow all origins
const corsOptions = {
  origin: function (origin, callback) {
    if (origin) {
      // Allow the specific origin if it's present (for credentials)
      callback(null, origin);
    } else {
      // Allow requests with no origin (e.g., mobile apps, servers)
      callback(null, '*');
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true // Allow credentials (cookies, etc.)
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Connect to mongo
mongo.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.likp8.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB Server: \n', err));

// Add the routes and the required files
app.use('/api/users', require('./routes/users'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/fb', require('./routes/facebook'));
app.use('/api/map', require('./routes/maps'))

// Start 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});