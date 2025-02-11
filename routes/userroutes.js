const express = require('express');
const User = require('../models/users');
const Cost = require('../models/costs');
const handleAsync = require('../utils/handleasync');
const router = express.Router();

// GET route to get details of a specific user by their ID
router.get('/users/:id', handleAsync(async (req, res) => {
    const { id } = req.params;

    // Ensure ID is not empty and contains only numbers
    if (!id || isNaN(Number(id))) {
        const error = new Error('ID must contain only numbers.');
        error.status = 400;
        throw error; // Express will catch this error
    }

    const user = await User.findOne({ id: String(id) });
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Calculate the total expenses of the user
    const totalCosts = await Cost.aggregate([
        { $match: { user_id: id } },
        { $group: { _id: null, total: { $sum: '$sum' } } }
    ]);

    const total = totalCosts.length > 0 ? totalCosts[0].total : 0;

    res.status(200).json({
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
        total
    });
}));

module.exports = router;
