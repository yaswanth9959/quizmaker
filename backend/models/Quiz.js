const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    topic: {
        type: String,
        trim: true,
    },
    questions: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        question_type: { type: String, enum: ['mcq', 'tf', 'fill'] },
        question_text: { type: String, required: true },
        options: [String],
        correct_answer: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
        explanation: String,
        confidence_score: Number,
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);