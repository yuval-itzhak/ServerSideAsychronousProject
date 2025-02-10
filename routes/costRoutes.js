const express = require('express');
const mongoose = require('mongoose');
const Cost = require('../models/costs');
const User = require('../models/users');
const handleAsync = require('../utils/handleAsync');
const router = express.Router();


// POST route to add a new cost item
router.post('/add', handleAsync(async (req, res) => {
    const { description, category, user_id, sum, date } = req.body;
    const currentDate = new Date();

    // Validate required fields
    if (!description || !user_id || !sum || !date) {
        throw new Error('Missing required fields. Date must be provided in YYYY-MM-DD format.');
    }

    if (isNaN(sum) || sum <= 0) {
        throw new Error('Invalid sum value. It must be a positive number.');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }

    // Convert date to a proper Date object
    const [year, month, day] = date.split('-').map(Number);
    const costDate = new Date(year, month - 1, day);

    // Ensure the date is valid (e.g., prevents "2025-02-30")
    if (isNaN(costDate.getTime()) || costDate.getFullYear() !== year || costDate.getMonth() !== month - 1 || costDate.getDate() !== day) {
        throw new Error('Invalid date. Ensure it is a real calendar date in YYYY-MM-DD format.');
    }

    // Calculate time constraints
    const firstOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // 1st of the current month
    const firstOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // 1st of last month
    const lastAllowedDateForLastMonth = new Date(firstOfCurrentMonth); // 5th of the current month
    lastAllowedDateForLastMonth.setDate(5);


    // Validation logic
    const isCurrentMonth = costDate >= firstOfCurrentMonth && costDate <= currentDate;
    const isLastMonthButAllowed = costDate >= firstOfLastMonth && costDate < firstOfCurrentMonth && currentDate <= lastAllowedDateForLastMonth;

    if (!isCurrentMonth && !isLastMonthButAllowed) {
        throw new Error('Cost date must be either from the current month or from the last month (only if today is within the first 5 days of the current month).');
    }

    const newCost = new Cost({ description, category, user_id, sum, date: costDate });
    await newCost.save();

    res.status(201).json(newCost);
}));



// GET report route
router.get('/report', handleAsync(async (req, res) => {
    const { id, year, month } = req.query;

    if (!id || !year || !month) {
        const error = new Error('Missing parameters');
        error.status = 400;
        throw error;
    }


    // Ensure values are not empty and contain only numbers
    if (!id || isNaN(Number(id))) {
        const error = new Error('ID must contain only numbers.');
        error.status = 400;
        throw error;
    }

    if (!year || isNaN(Number(year))) {
        const error = new Error('Year must contain only numbers.');
        error.status = 400;
        throw error;
    }
    if (year < 1000 || year > 9999) {
        const error = new Error('Invalid year. Must be in YYYY format.');
        error.status = 400;
        throw error;
    }
    if (!month || isNaN(Number(month)) || month < 1 || month > 12) {
        const error = new Error('Month must contain only numbers and real calender date.');
        error.status = 400;
        throw error;
    }


    const user = await User.findOne({ id });
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const requestMonth = `${year}-${String(month).padStart(2, "0")}`;
    const now = new Date();
    const lastDayOfMonth = new Date(year, month, 0);
    const daysSinceEndOfMonth = (now - lastDayOfMonth) / (1000 * 60 * 60 * 24);

    if (daysSinceEndOfMonth > 5 && user.computed_costs?.[requestMonth]) {
        return res.status(200).json({
            user_id: id,
            year,
            month,
            costs: user.computed_costs[requestMonth]
        });
    }

    // Fetch costs for the given month
    const costs = await Cost.find({
        user_id: id,
        date: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1)
        }
    });


    //Build the new format with arrays for each category
    const categories = ['Food', 'Health', 'Housing', 'Sport', 'Education'];

    // Organize costs by category
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


    // Save the report if more than 5 days have passed
    if (daysSinceEndOfMonth > 5) {
        await User.updateOne({ id }, { $set: { [`computed_costs.${requestMonth}`]: report } });
    }

    res.status(200).json({ user_id: id, year, month, costs: report });
}));

module.exports = router;

