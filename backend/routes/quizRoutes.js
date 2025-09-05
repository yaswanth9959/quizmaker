const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { 
    generateQuiz,
    saveQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    exportQuizPdf,
    exportQuizDocx 
} = require('../controllers/quizController');

const upload = multer({ dest: 'uploads/' });

// Quiz generation and management endpoints
router.post('/generate', auth, upload.single('pdf'), generateQuiz);
router.post('/', auth, saveQuiz);
router.get('/', auth, getQuizzes);
router.get('/:id', auth, getQuizById);
router.put('/:id', auth, updateQuiz);
router.delete('/:id', auth, deleteQuiz);

// Exporting endpoints
router.get('/:id/export/pdf', auth, exportQuizPdf);
router.get('/:id/export/docx', auth, exportQuizDocx);

module.exports = router;