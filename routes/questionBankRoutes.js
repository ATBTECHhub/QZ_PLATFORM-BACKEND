const express = require('express');
const router = express.Router();
const {
    listAllQuestions,
    addNewQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    linkQuestionToTest,
    unlinkQuestionFromTest,
    searchQuestions
} = require('../controllers/questionBankController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authHandler');

// @Route GET /api/questions
// @Desc List all questions (for logged-in test creators only)
router.get('/', authenticateToken, authorizeRoles('testCreator'), listAllQuestions);

// @Route POST /api/questions
// @Desc Add a new question (for logged-in test creators only)
router.post('/', authenticateToken, authorizeRoles('testCreator'), addNewQuestion);

// @Route GET /api/questions/:id
// @Desc Get a specific question by ID (for logged-in test creators only)
router.get('/:id', authenticateToken, authorizeRoles('testCreator'), getQuestionById);

// @Route PUT /api/questions/:id
// @Desc Update a specific question by ID (for logged-in test creators only)
router.put('/:id', authenticateToken, authorizeRoles('testCreator'), updateQuestion);

// @Route DELETE /api/questions/:id
// @Desc Delete a specific question by ID (for logged-in test creators only)
router.delete('/:id', authenticateToken, authorizeRoles('testCreator'), deleteQuestion);

// @Route PUT /api/questions/:id/link/:testId
// @Desc Link a question to a test (for logged-in test creators only)
router.put('/:id/link/:testId', authenticateToken, authorizeRoles('testCreator'), linkQuestionToTest);

// @Route PUT /api/questions/:id/unlink/:testId
// @Desc Unlink a question from a test (for logged-in test creators only)
router.put('/:id/unlink/:testId', authenticateToken, authorizeRoles('testCreator'), unlinkQuestionFromTest);

// @Route GET /api/questions/search
// @Desc Search questions based on filters (for logged-in test creators only)
router.get('/search', authenticateToken, authorizeRoles('testCreator'), searchQuestions);

module.exports = router;
