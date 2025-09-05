const asyncHandler = require('express-async-handler');
const Question = require('../models/questions'); // Unified model
const Test = require('../models/tests'); // Model for tests


// @Desc List all questions created by the logged-in Test Creator, including linked test names
// @Route GET /api/questions
// @Access Private (Test Creator)
const listAllQuestions = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;  // Assuming req.user contains the logged-in user details

    try {
        // Fetch only the questions created by the logged-in test creator and populate linked test names
        const questions = await Question.find({ createdBy: loggedInUserId })
            .populate('linkedTests', 'testName'); // Fetch the test names of linked tests
        
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
});


// @Desc Add a new question to the Question Bank
// @Route POST /api/questions
// @Access Public
const addNewQuestion = asyncHandler(async (req, res, next) => {
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

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

    try {
        const newQuestion = new Question({
            questionType,
            questionText,
            questionOptions,
            points,
            category,
            randomizeAnswers,
            questionAnswers,
            createdBy: req.user._id // Assuming req.user contains the logged-in user details
        });
        console.log('createdBy:', req.user._id); // Log the creator ID for debugging

        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        next(error);
    }
});

// @Desc Get a specific question from the Question Bank
// @Route GET /api/questions/:id
// @Access Private (Test Creator)
const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        console.log('Requesting question with ID:', id); // Debug line

        const question = await Question.findById(id).populate('linkedTests', 'testName');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        console.log('Question found:', question); // Debug line

        // Check if the current user is the creator of the question
        if (question.createdBy.toString() !== req.user._id.toString()) {
            console.log('Access denied for user:', req.user._id); // Debug line
            return res.status(403).json({ message: 'Access denied. You are not the creator of this question.' });
        }

        res.json(question);
    } catch (error) {
        console.error('Error retrieving question:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});



// @Desc Update a question in the Question Bank
// @Route PUT /api/questions/:id
// @Access Private (Test Creator)
const updateQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { questionType, questionText, questionOptions, points, category, randomizeAnswers, questionAnswers } = req.body;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Ensure only the creator can update this question
        if (question.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. You are not the creator of this question.' });
        }

        if (questionType) {
            if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
                return res.status(400).json({ message: 'Multiple choice questions must have between 3 and 5 options.' });
            }
        }

        question.questionType = questionType || question.questionType;
        question.questionText = questionText || question.questionText;
        question.questionOptions = questionOptions || question.questionOptions;
        question.points = points || question.points;
        question.category = category || question.category;
        question.randomizeAnswers = randomizeAnswers || question.randomizeAnswers;
        question.questionAnswers = questionAnswers || question.questionAnswers;

        await question.save();
        res.json(question);
    } catch (error) {
        next(error);
    }
});

// @Desc Delete a question from the Question Bank
// @Route DELETE /api/questions/:id
// @Access Private (Test Creator)
const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Ensure only the creator can delete this question
        if (question.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. You are not the creator of this question.' });
        }

        // Remove the question from all linked tests
        await Test.updateMany(
            { questions: id },
            { $pull: { questions: id } }
        );

        // Log for better debugging: Check if the update query executed successfully
        console.log('Removed question from tests successfully');

        // Remove the question from the database
        await question.deleteOne();
        
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        // Log the full error for debugging
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
});



// @Desc Link a question from the Question Bank to a test
// @Route PUT /api/questions/:id/link/:testId
// @Access Private (Test Creator only)
const linkQuestionToTest = asyncHandler(async (req, res) => {
    const { id, testId } = req.params;

    try {
        const question = await Question.findById(id);
        const test = await Test.findById(testId);

        // Check if the question and test exist
        if (!question) return res.status(404).json({ message: 'Question not found' });
        if (!test) return res.status(404).json({ message: 'Test not found' });

        // Check if the logged-in user is the creator of the question and test
        if (question.createdBy.toString() !== req.user._id.toString() || test.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to link this question to this test' });
        }

        // Check if the question is already linked to the test
        if (test.questions.includes(id)) {
            return res.status(400).json({ message: 'Question already linked to this test' });
        }

        // Link the question to the test
        test.questions.push(id);
        await test.save();

        question.linkedTests.push(testId);
        await question.save();

        res.json({ message: 'Question linked to test successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error linking question to test' });
    }
});

// @Desc Unlink a question from a test
// @Route PUT /api/questions/:id/unlink/:testId
// @Access Private (Test Creator only)
const unlinkQuestionFromTest = asyncHandler(async (req, res) => {
    const { id, testId } = req.params;

    try {
        const question = await Question.findById(id);
        const test = await Test.findById(testId);

        // Check if the question and test exist
        if (!question) return res.status(404).json({ message: 'Question not found' });
        if (!test) return res.status(404).json({ message: 'Test not found' });

        // Check if the logged-in user is the creator of the question and test
        if (question.createdBy.toString() !== req.user._id.toString() || test.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to unlink this question from this test' });
        }

        // Check if the question is linked to the test
        if (!test.questions.includes(id)) {
            return res.status(400).json({ message: 'Question is not linked to this test' });
        }

        // Unlink the question from the test
        test.questions = test.questions.filter(q => q.toString() !== id);
        await test.save();

        question.linkedTests = question.linkedTests.filter(t => t.toString() !== testId);
        await question.save();

        res.json({ message: 'Question unlinked from test successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unlinking question from test' });
    }
});



// @Desc Search questions based on filters
// @Route GET /api/questions/search
// @Access Private (Test Creator only)
const searchQuestions = asyncHandler(async (req, res, next) => {
    const { category, points, questionType } = req.query;
    const query = { createdBy: req.user._id };  // Filter by logged-in user

    // Add additional filters based on query parameters
    if (category) query.category = category;
    if (points) query.points = points;
    if (questionType) query.questionType = questionType;

    console.log('Query:', query); // Log the query for debugging

    try {
        const questions = await Question.find(query);
        res.status(200).json(questions);
    } catch (error) {
        next(error);
    }
});



module.exports = {
    listAllQuestions,
    addNewQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    linkQuestionToTest,
    unlinkQuestionFromTest,
    searchQuestions
};
