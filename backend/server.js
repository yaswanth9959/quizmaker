// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware to parse JSON and enable CORS for the frontend
app.use(express.json()); 
app.use(cors());

// Import routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Connect to MongoDB using the URI from the .env file
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();

// Use the imported routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});