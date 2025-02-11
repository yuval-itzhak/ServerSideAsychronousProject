

const express = require('express');
const router = express.Router();
/**
 * @route GET /about
 * @desc Retrieves a list of team members
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} List of team members with first and last names
 */
router.get('/about' , (req, res) => {
    res.json([
        {
            firstName: "Yuval" ,
            lastName: "Itzhak",
        },
        {
            firstName: "Matan" ,
            lastName: "Zror",
        }
    ])
})

module.exports = router;