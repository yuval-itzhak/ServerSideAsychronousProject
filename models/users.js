const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    id: {type: String, required: true, unique: true},   // Ensures each user has a unique 'id'
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    birthday: {type: Date, required: true},
    maritalStatus: {type: String, required: true},
    computedCosts: {
        type: Map,  // 'computedCosts' is a Map type (key-value pairs)
        of: Object,  // The values in the map are Numbers
        default: {}, // If no value is provided, it defaults to an empty object
    }
});

// Create a model based on the user schema
const Users = mongoose.model('users', userSchema);

module.exports = Users;



