const express = require('express');
const mongoose = require('mongoose');
const Cost = require('../models/costs');
const User = require('../models/users');
const handleAsync = require('../utils/handleasync');
const router = express.Router();



/**
 * POST route to add a new cost item
 * @route POST /add
 * @desc Adds a new cost item
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing cost details
 * @param {string} req.body.description - Description of the cost
 * @param {string} req.body.category - Category of the cost
 * @param {string} req.body.userId - ID of the user
 * @param {number} req.body.sum - Amount of the cost (must be a positive number)
 * @param {string} req.body.date - Date of the cost in YYYY-MM-DD format
 * @param {Object} res - Express response object
 * @returns {JSON} The newly created cost object
 * @throws {Error} If required fields are missing or invalid
 */
router.post('/add', handleAsync(async (req, res) => {
    const { description, category, userId, sum, date } = req.body;
    const currentDate = new Date();

    // Validate required fields
    if (!description || !userId || !sum || !date) {
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

    const newCost = new Cost({ description, category, userId, sum, date: costDate });
    await newCost.save();

    res.status(201).json(newCost);
}));

/**
 * GET report route
 * @route GET /report
 * @desc Retrieves a user's cost report for a given month
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - User ID
 * @param {number} req.query.year - Year (YYYY format)
 * @param {number} req.query.month - Month (1-12)
 * @param {Object} res - Express response object
 * @returns {JSON} The monthly cost report organized by category
 * @throws {Error} If parameters are missing or invalid
 */
router.get('/report', handleAsync(async (req, res) => {
    const { id, year, month } = req.query;

    if (!id || !year || !month) {
        const error = new Error('Missing parameters');
        error.status = 400;
        throw error;
    }

// Convert values to numbers only once
    const numericId = Number(id);
    const numericYear = Number(year);
    const numericMonth = Number(month);
    const now = new Date();

// Validate ID (must be a number)
    if (isNaN(numericId)) {
        const error = new Error('ID must contain only numbers.');
        error.status = 400;
        throw error;
    }

// Validate Year (must be a number in YYYY format)
    if (isNaN(numericYear) || numericYear < 1000 || numericYear > 9999) {
        const error = new Error('Invalid year. Must be in YYYY format.');
        error.status = 400;
        throw error;
    }

// Validate Month (must be a number between 1-12)
    if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
        const error = new Error('Month must contain only numbers and be a real calendar month.');
        error.status = 400;
        throw error;
    }
    if (numericMonth>now.getMonth() && numericYear>=now.getFullYear()) {
        const error = new Error('Date in the future is not good');
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
    const lastDayOfMonth = new Date(year, month, 0);
    const daysSinceEndOfMonth = (now - lastDayOfMonth) / (1000 * 60 * 60 * 24);

    if (daysSinceEndOfMonth > 5 && user.computedCosts?.get(requestMonth)) {
        return res.status(200).json({
            userId: id,
            year,
            month,
            costs: user.computedCosts?.get(requestMonth)
        });
    }

    // Fetch costs for the given month
    const costs = await Cost.find({
        userId: id,
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
        report[cost.category].push({
            sum: cost.sum,
            description: cost.description,
            day: new Date(cost.date).getDate()
        });
    });
    //replacing an empty array with 0
    categories.forEach(category => {
        if (!Array.isArray(report[category]) || report[category].length === 0) {
            report[category] = 0;
        }
    });



    // Save the report if more than 5 days have passed
    if (daysSinceEndOfMonth > 5) {
        await User.updateOne({ id }, { $set: { [`computedCosts.${requestMonth}`]: report } });
    }

    res.status(200).json({ userId: id, year, month, costs: report });
}));

module.exports = router;

