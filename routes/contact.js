/**
 * Contact Form API Routes
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { otpRateLimiter, submitRateLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/contact/otp/send
 * Send OTP to user's email
 */
router.post('/otp/send', otpRateLimiter, contactController.sendOtp);

/**
 * POST /api/contact/otp/verify
 * Verify the OTP entered by user
 */
router.post('/otp/verify', contactController.verifyOtp);

/**
 * POST /api/contact/submit
 * Submit the contact form after OTP verification
 */
router.post('/submit', submitRateLimiter, contactController.submitContact);

module.exports = router;
