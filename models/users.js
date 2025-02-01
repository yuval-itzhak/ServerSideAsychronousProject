const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    id: {type: String, required: true, unique: true},   // Ensures each user has a unique 'id'
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    birthday: {type: Date, required: true},
    marital_status: {type: String, required: true},
    computed_costs: {
        type: Map,  // 'computed_costs' is a Map type (key-value pairs)
        of: Object,  // The values in the map are Numbers
        default: {}, // If no value is provided, it defaults to an empty object
    }
});

// Create a model based on the user schema
const Users = mongoose.model('users', userSchema);

module.exports = Users;



