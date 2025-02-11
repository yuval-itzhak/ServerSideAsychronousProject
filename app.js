const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorhandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * @fileoverview Main server file for the application.
 * Initializes Express, connects to MongoDB, sets up middleware, and defines routes.
 */

/**
 * Middleware to parse incoming JSON requests
 */
app.use(bodyParser.json());

/**
 * Connects to MongoDB using the connection string from environment variables
 */
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

/**
 * Routes
 * @module Routes
 */

//costroutes including - report route and add route
app.use('/api', require('./routes/costroutes'));
//userroutes including - get user route
app.use('/api', require('./routes/userroutes'));
//aboutroutes including - get developers details
app.use('/api', require('./routes/aboutroutes'));

/**
 * Global error handler middleware
 */
app.use(errorHandler);

/**
 * Starts the Express server on the defined PORT
 */
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
