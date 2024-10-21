const asyncHandler = require("express-async-handler");
const Test = require('../models/tests');
const express = require('express');

//@Desc Create a new test
//@Route POST /api/tests
//@Access Public
const createTest = async (req, res) => {
    try {
        const { testName, description, category, createdBy, instruction} = req.body;
        const newTest = new Test({
            testName,
            description,
            category,
            createdBy,
            instruction,
        });

        const savedTest = await newTest.save();
        res.status(201).json({message: "New Test Created" , savedTest});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createTestAndContinue = async (req, res) => {
    try {
        const { testName, description, category, createdBy, instruction} = req.body;
        const newTest = new Test({
            testName,
            description,
            category,
            createdBy,
            instruction,
        });

        const savedTest = await newTest.save();
        res.status(201).json({
            message: "New Created Successfully, proceed to add question" , 
            testId: savedTest,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//@Desc Get all tests
//@Route GET /api/tests
//@Access Public
const getTests = async (req, res) => {
    try {
        const tests = await Test.find();
        
        // Log each Test ID to the console
        tests.forEach(test => {
            console.log('Test ID:', test._id);
        });

        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//@Desc Get a test by id
//@Route GET /api/tests/:id
//@Access Public
const getTestById = async (req, res) => {
    try {
        // Log the ID being passed
        console.log('Test ID:', req.params.testId);

        // Attempt to find the test by ID
        const test = await Test.findById(req.params.testId).populate('createdBy');

        
        if (!test) {
            // Log if the test is not found
            console.log('Test not found');
            return res.status(404).json({ message: 'Test not found' });
        }

        // Log the found test
        console.log('Found Test:', test);
        res.status(200).json(test);
    } catch (error) {
        // Log any errors that occur
        console.error('Error retrieving test:', error.message);
        res.status(500).json({ message: error.message });
    }
};



//@Desc Update a test by id
//@Route PUT /api/tests/:id
//@Access Public
const updateTest = async (req, res) => {
    try {
        const { testName, description, category, instruction} = req.body;

        const test = await Test.findById(req.params.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        test.testName = testName || test.testName;
        test.description = description || test.description;
        test.category = category || test.category;
        test.instruction = instruction || test.instruction;
        test.updatedAt = Date.now();

        const updatedTest = await test.save();
        res.status(200).json(updatedTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//@Desc Delete a test by id
//@Route DELETE /api/tests/:id
//@Access Public
const deleteTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndDelete(req.params.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createTest,
    createTestAndContinue,
    getTests,
    getTestById,
    updateTest,
    deleteTest,
};
