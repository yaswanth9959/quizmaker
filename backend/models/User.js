const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
    }],
});

module.exports = mongoose.model('User', userSchema);