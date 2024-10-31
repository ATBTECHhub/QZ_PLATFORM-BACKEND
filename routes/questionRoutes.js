const express = require('express');
const router = express.Router({ mergeParams: true });  // mergeParams to access parent route params
const {
    addQuestionToTest,
    getTestQuestions,
    getQuestionFromTestById,
    updateQuestionInTest,
    deleteQuestionFromTest,
} = require('../controllers/questionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authHandler');

//@Route /api/tests/:testId/questions
//@Desc Add question to test
router.post('/', authenticateToken, authorizeRoles('testCreator'), addQuestionToTest); 

//@Route /api/tests/:testId/questions
//@Desc Get questions for test
router.get('/', authenticateToken, authorizeRoles('testCreator'), getTestQuestions);  // Adjust to use base path

//@Route /api/tests/:testId/questions/:questionId
//@Desc Get question from test by Id
router.get('/:questionId', authenticateToken, authorizeRoles('testCreator'), getQuestionFromTestById);

//@Route /api/tests/:testId/questions/:questionId
//@Desc Update questions in Test
router.put('/:questionId', authenticateToken, authorizeRoles('testCreator'), updateQuestionInTest);

// Delete questions From Test
router.delete('/:questionId', authenticateToken, authorizeRoles('testCreator'),deleteQuestionFromTest);

module.exports = router;
