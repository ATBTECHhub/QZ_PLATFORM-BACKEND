const express = require ('express');
const router = express.Router();
const { 
    createTest, 
    createTestAndContinue, 
    getTests, 
    getTestById,
    updateTest,
    deleteTest
} = require('../controllers/testController');

//Create Test
router.post('/create', createTest);

//Create Test and Continue
router.post('/create-and-continue', createTestAndContinue);

//Get all Test
router.get('/', getTests)

//Get test by Id
router.get('/:testId', getTestById)

//Update Test
router.put('/:testId', updateTest)

//Delete Test
router.delete('/:testId', deleteTest);

module.exports = router;

