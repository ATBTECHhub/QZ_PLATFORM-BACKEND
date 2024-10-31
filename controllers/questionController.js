const asyncHandler = require('express-async-handler');
const Question = require('../models/questions');
const Test = require('../models/tests');
const shuffleArray = require('../utils/shuffleArray');

// @Desc Add a question to a test
// @Route POST /api/tests/:testId/questions
// @Access Private (Test creator only)
const addQuestionToTest = asyncHandler(async (req, res, next) => {
    const { testId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    // Check if the test belongs to the logged-in user
    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }
    if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the test creator.' });
    }

    // Validate question details
    if (!['multipleChoice', 'TrueFalse', 'fillInTheGap'].includes(questionType)) {
        return res.status(400).json({ message: "Invalid question type." });
    }
    if (!questionText || typeof questionText !== 'string') {
        return res.status(400).json({ message: "Question text is required and must be a string." });
    }
    if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
        return res.status(400).json({ message: "Multiple choice questions must have between 3 and 5 options." });
    }
    if (questionType === 'TrueFalse' && (!questionOptions || questionOptions.length !== 2)) {
        return res.status(400).json({ message: "True or False questions must have exactly 2 options." });
    }
    if (questionType === 'fillInTheGap' && (!questionAnswers || questionAnswers.length === 0)) {
        return res.status(400).json({ message: "Fill in the gap questions must have answers." });
    }

    // Create and save the new question
    const newQuestion = new Question({
        questionType,
        questionText,
        questionOptions,
        points,
        category,
        randomizeAnswers,
        questionAnswers,
        createdBy: req.user._id
    });

    await newQuestion.save();

    // Add question to the test
    test.questions.push(newQuestion._id);
    await test.save();

    // Update the question's linkedTests
    newQuestion.linkedTests.push(testId);
    await newQuestion.save();

    res.status(201).json(newQuestion);
});

// @Desc Get all questions for a test with randomized options
// @Route GET /api/tests/:testId/questions
// @Access Private (Test creator only)
const getTestQuestions = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Ensure only the test creator can view the questions
    if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the test creator.' });
    }

    const randomizedQuestions = test.questions.map((question) => {
        if (question.randomizeAnswers) {
            const shuffledOptions = shuffleArray([...question.questionOptions]);
            return {
                ...question.toObject(),
                questionOptions: shuffledOptions
            };
        }
        return question;
    });

    res.json(randomizedQuestions);
});

// @Desc Get a specific question from a test by question ID
// @Route GET /api/tests/:testId/questions/:questionId
// @Access Private (Test creator only)
const getQuestionFromTestById = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Ensure only the test creator can view the question
    if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the test creator.' });
    }

    const question = test.questions.find(q => q._id.toString() === questionId);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
});

// @Desc Update question in a Test
// @Route PUT /api/tests/:testId/questions/:questionId
// @Access Private (Test creator only)
const updateQuestionInTest = asyncHandler(async (req, res, next) => {
    const { testId, questionId } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Ensure only the test creator can update the question
    if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the test creator.' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }

    // Validate and update the question
    question.questionType = questionType || question.questionType;
    question.questionText = questionText || question.questionText;
    question.questionOptions = questionOptions || question.questionOptions;
    question.points = points || question.points;
    question.category = category || question.category;
    question.randomizeAnswers = randomizeAnswers || question.randomizeAnswers;
    question.questionAnswers = questionAnswers || question.questionAnswers;

    await question.save();

    res.json(question);
});

// @Desc Delete question from a test
// @Route DELETE /api/tests/:testId/questions/:questionId
// @Access Private (Test creator only)
const deleteQuestionFromTest = asyncHandler(async (req, res) => {
    const { testId, questionId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
        return res.status(404).json({ message: 'Test not found' });
    }

    // Ensure only the test creator can delete the question
    if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not the test creator.' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }

    // Remove the question from the test
    test.questions = test.questions.filter(q => q.toString() !== questionId);
    await test.save();

    // Remove the question's reference from linkedTests
    question.linkedTests = question.linkedTests.filter(id => id.toString() !== testId);
    await question.remove();

    res.json({ message: 'Question deleted successfully' });
});

module.exports = {
    addQuestionToTest,
    getTestQuestions,
    getQuestionFromTestById,
    updateQuestionInTest,
    deleteQuestionFromTest
};
