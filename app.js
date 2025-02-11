const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorhandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api', require('./routes/costroutes'));
app.use('/api', require('./routes/userroutes'));
app.use('/api', require('./routes/aboutroutes'));
app.use(errorHandler);

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
