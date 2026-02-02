/**
 * Rate Limiting Middleware
 * Prevents abuse of OTP and submission endpoints
 */

const rateLimit = require('express-rate-limit');

// OTP Request Rate Limiter
// 5 OTP requests per 15 minutes per IP
const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        error: 'Too many OTP requests. Please try again after 15 minutes.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Form Submission Rate Limiter
// 10 submissions per hour per IP
const submitRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        error: 'Too many submissions. Please try again after an hour.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API Rate Limiter
// 100 requests per 15 minutes per IP
const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests. Please slow down.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    otpRateLimiter,
    submitRateLimiter,
    generalRateLimiter
};
