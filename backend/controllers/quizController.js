const Quiz = require('../models/Quiz');
const pdf = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const path = require('path');

const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = docx;

const callAI = async (sourceContent, numQuestions) => {
    // This is the prompt that generates ALL question types.
    const allTypesPrompt = `
You are a quiz generation expert. Your task is to create a quiz based *exclusively* on the content provided below.
DO NOT GENERATE QUESTIONS ON ANY OTHER TOPIC.
The output must be a single, valid JSON object with the specified structure.

---
INSTRUCTIONS
1.  Generate exactly ${numQuestions} questions.
2.  The output must be a single JSON object with a key "questions", which is an array of question objects.
3.  Each question object must have the following keys:
    * "question_type" (string): One of "mcq", "tf", or "fill".
    * "question_text" (string): The quiz question itself.
    * "options" (array of strings): Only for "mcq" questions. Must have exactly 4 options.
    * "correct_answer" (string): The correct answer.
    * "difficulty" (string): One of "easy", "medium", or "hard".
    * "explanation" (string): A brief explanation for the correct answer.
4.  Ensure questions are clear, non-repetitive, and directly related to the source content.
5.  Return ONLY the final, valid JSON object. Do not include any other text or markdown outside the JSON.
---
CONTENT
${sourceContent}
`;

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

        const geminiResponse = await axios.post(geminiEndpoint, {
            contents: [{ parts: [{ text: allTypesPrompt }] }],
            generationConfig: {
                stopSequences: ['`'],
                responseMimeType: "application/json"
            }
        });

        let aiContent = geminiResponse.data.candidates[0].content.parts[0].text;
        const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            aiContent = jsonMatch[1];
        }

        const parsedData = JSON.parse(aiContent);
        if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
            throw new Error('Invalid JSON structure from Gemini API.');
        }

        console.log("Quiz generated using Gemini API.");
        return parsedData;

    } catch (geminiError) {
        console.error('Gemini API call failed. Falling back to OpenAI:', geminiError.message);
        try {
            const openaiApiKey = process.env.OPENAI_API_KEY;
            const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
            
            const openaiResponse = await axios.post(openaiEndpoint, {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: allTypesPrompt }],
                response_format: { type: "json_object" }
            }, {
                headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' }
            });

            console.log("Quiz generated using OpenAI API.");
            return JSON.parse(openaiResponse.data.choices[0].message.content);

        } catch (openaiError) {
            console.error('OpenAI API call also failed:', openaiError.message);
            throw new Error('Failed to generate quiz from both AI providers.');
        }
    }
};

exports.generateQuiz = async (req, res) => {
    try {
        const { topic, text, numQuestions, questionTypes } = req.body;
        let sourceContent = '';

        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            sourceContent = data.text;
            fs.unlinkSync(req.file.path);
        } else if (topic && topic.trim() !== '') {
            sourceContent = topic;
        } else if (text && text.trim() !== '') {
            sourceContent = text;
        } else {
            return res.status(400).json({ msg: 'No content provided for quiz generation.' });
        }
        
        const numQ = parseInt(numQuestions);
        if (numQ < 1 || numQ > 100) {
            return res.status(400).json({ msg: 'Number of questions must be between 1 and 100' });
        }

        const rawQuizData = await callAI(sourceContent, numQ, questionTypes);

        // --- FINAL FIX: POST-PROCESSING THE RESULTS ---
        const selectedTypesSet = new Set(questionTypes);
        const filteredQuestions = rawQuizData.questions.filter(q => selectedTypesSet.has(q.question_type));

        // Trim the filtered questions to the user's requested count
        const finalQuestions = filteredQuestions.slice(0, numQ);

        res.json({ title: topic || 'Generated Quiz', questions: finalQuestions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.saveQuiz = async (req, res) => {
    const { title, topic, questions } = req.body;
    try {
        const newQuiz = new Quiz({
            title,
            topic,
            questions,
            user: req.user.id,
        });
        const quiz = await newQuiz.save();
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateQuiz = async (req, res) => {
    const { title, questions } = req.body;
    try {
        let quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        quiz.title = title || quiz.title;
        quiz.questions = questions || quiz.questions;
        await quiz.save();
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        await quiz.deleteOne();
        res.json({ msg: 'Quiz removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.exportQuizPdf = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${quiz.title}.pdf"`);
        doc.pipe(res);

        doc.fontSize(20).text(quiz.title, { align: 'center' }).moveDown();
        quiz.questions.forEach((q, index) => {
            doc.fontSize(12).text(`${index + 1}. ${q.question_text}`).moveDown();
            if (q.question_type === 'mcq') {
                q.options.forEach(opt => {
                    doc.text(`    - ${opt}`);
                });
            }
            doc.moveDown();
        });

        doc.addPage().fontSize(20).text('Answer Key', { align: 'center' }).moveDown();
        quiz.questions.forEach((q, index) => {
            doc.fontSize(12).text(`${index + 1}. ${q.correct_answer}`).moveDown();
        });

        doc.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.exportQuizDocx = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const paragraphs = [new Paragraph({ text: quiz.title, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1 })];

        quiz.questions.forEach((q, index) => {
            paragraphs.push(new Paragraph({ text: `${index + 1}. ${q.question_text}` }));
            if (q.question_type === 'mcq') {
                q.options.forEach(opt => {
                    paragraphs.push(new Paragraph({ text: `    - ${opt}` }));
                });
            }
            paragraphs.push(new Paragraph({ text: '' }));
        });

        paragraphs.push(new Paragraph({ text: 'Answer Key', alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1 }));
        quiz.questions.forEach((q, index) => {
            paragraphs.push(new Paragraph({ text: `${index + 1}. ${q.correct_answer}` }));
        });

        const doc = new Document({ sections: [{ children: paragraphs }] });
        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${quiz.title}.docx"`);
        res.send(buffer);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};