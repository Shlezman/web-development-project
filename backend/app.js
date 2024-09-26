const express = require('express');
const mongo = require('mongoose');
const bodyParser = require('body-parser');
// npm install express-validator
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Body Parser
app.use(bodyParser.json());

// Connect to mongo
//TODO: (need change the address to the mongo-server toi an env var for generic deployment)
mongo.connect('mongodb+srv://<menimamtera>:<Meni1234>@cluster0.likp8.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB Server: \n', err));

// Routes (need to add!)
app.use('/api/users', require('./routes/users'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/orders', require('./routes/orders'));

// Start 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});