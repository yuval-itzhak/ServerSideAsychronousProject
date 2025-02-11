/**
 * @route Middleware Error Handler
 * @desc Handles application errors and sends a JSON response
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {JSON} Error message with status code
 */
module.exports = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    res.status(err.status || 500).json({
        error: err.message || 'An unexpected error occurred',
    });
};
