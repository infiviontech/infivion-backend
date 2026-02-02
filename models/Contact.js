/**
 * Contact/Enquiry Model for MongoDB
 * Stores all contact form submissions
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'company']
    },
    institution: {
        type: String,
        trim: true,
        default: null
    },
    organization: {
        type: String,
        trim: true,
        default: null
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'closed'],
        default: 'new'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ messageId: 1 });

module.exports = mongoose.model('Contact', contactSchema);
