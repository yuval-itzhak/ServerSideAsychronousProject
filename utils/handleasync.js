/**
 * @route Middleware Async Handler
 * @desc Wraps asynchronous route handlers to catch errors automatically
 * @param {Function} fn - The asynchronous function to wrap
 * @returns {Function} Wrapped function with error handling
 */
module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
