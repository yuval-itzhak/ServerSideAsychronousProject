
const express = require('express');
const User = require('../models/users');
const Cost = require('../models/costs');
const router = express.Router();

// GET route to get details of a specific user by their ID
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({id : id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Calculate the total expenses of the user
        const totalCosts = await Cost.aggregate([
            { $match: { user_id: id } },
            { $group: { _id: null, total: { $sum: "$sum" } } }
        ]);

        const total = totalCosts.length > 0 ? totalCosts[0].total : 0;

        res.status(200).json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total
        });

    } catch (err) {
        res.status(500).json({ error: "An error occurred" });
    }
});


module.exports = router;



