/**
 * Infivion Technologies - Backend Server
 * Contact Form with OTP Verification
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for Render (fixes express-rate-limit warning)
app.set('trust proxy', 1);

// Middleware - CORS: Allow frontend (Netlify + localhost)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'https://infivion-technologies.netlify.app'
];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow for now - add your Netlify URL to allowedOrigins for security
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - NO localhost fallback (Render has no local MongoDB)
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error('❌ MONGODB_URI is missing. Add it in Render → Environment.');
    process.exit(1);
}

const mongoOptions = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000
};

mongoose.connect(mongoURI, mongoOptions)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

// Routes
app.use('/api/contact', contactRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Infivion Backend is running' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
});
