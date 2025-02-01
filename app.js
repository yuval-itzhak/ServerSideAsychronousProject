console.log('Happy developing Yuval and Matan ✨')

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

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
app.use('/api', require('./routes/costRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/aboutRoutes'));

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
