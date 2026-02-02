/**
 * OTP Model for MongoDB
 * Stores hashed OTPs with expiry
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otpHash: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Auto-delete after 5 minutes (300 seconds)
    }
});

// Index for faster queries
otpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', otpSchema);
