
const express = require('express');
const mongoose = require('mongoose');
const Cost = require('../models/costs');
const User = require('../models/users');
const router = express.Router();

// POST route to add a new cost item
router.post('/add', async (req, res) => {
    try {
        const { description, category, user_id, sum, date } = req.body;
        const currentDate = new Date();
        const costDate = date ? new Date(date) : currentDate;

        // Date check - if the date is from last month and more than 10 days have passed, block it
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const tenDaysAgo = new Date(currentDate);
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        if (costDate < lastMonth && costDate < tenDaysAgo) {
            return res.status(400).json({ error: 'Cannot add cost for last month after 10 days' });
        }

        // Create a new cost entry and save it
        const newCost = new Cost({ description, category, user_id, sum, date: costDate });
        await newCost.save();

        res.status(201).json(newCost);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred' });
    }
});


router.get("/report", async (req, res) => {
    try {
        const { id, year, month } = req.query;

        if (!id || !year || !month) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const requestMonth = `${year}-${month.padStart(2, "0")}`;

        // Calculate how many days have passed since the end of the month
        let now = new Date();
        let daysSinceEndOfMonth = (now - new Date(year, month, 0)) / (1000 * 60 * 60 * 24);

        // If more than 10 days have passed and the report already exists in computed_costs → return it
        if (daysSinceEndOfMonth > 10 && user.computed_costs && user.computed_costs.has(requestMonth)) {
            return res.status(200).json({
                user_id: id,
                year,
                month,
                costs: user.computed_costs.get(requestMonth)
            });
        }

        // Fetch relevant expenses from the database
        const costs = await Cost.find({
            user_id: id,
            date: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            }
        });

        // Build the new format with arrays for each category
        const categories = ["Food", "Health", "Housing", "Sport", "Education"];
        const report = {};
        categories.forEach(category => {
            report[category] = [];
        });

        costs.forEach(cost => {
            if (report.hasOwnProperty(cost.category)) {
                report[cost.category].push({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.date).getDate()
                });
            }
        });

        // **If more than 10 days have passed since the end of the month → save the report**
        if (daysSinceEndOfMonth > 10) {
            await User.updateOne({ id }, { $set: { [`computed_costs.${requestMonth}`]: report } });
        }

        res.status(200).json({ user_id: id, year, month, costs: report });

    } catch (err) {
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;