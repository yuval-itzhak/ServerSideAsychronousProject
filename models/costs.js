const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the cost schema
const costSchema = new Schema({
    description: {type: String, required: true},
    category: {type: String, required: true, enum: ['Food', 'Health', 'Housing', 'Sport', 'Education']}, // Only one of these values is valid
    user_id: {type: String, required: true},
    sum: {type: Number, required: true},
    date: {type: Date, required: true, default: Date.now}, // Default value is the current date if not provided
});

// Create a model based on the cost schema
const Costs = mongoose.model('costs', costSchema);

module.exports = Costs;








