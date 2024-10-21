const express = require('express');
const { addToWaitlist, getWaitlist } = require('../controllers/waitlistController');

const router = express.Router();

// Endpoint to add users to waitlist
router.post('/', addToWaitlist);

//endpoint for getting all users on the waitlist
router.get('/', getWaitlist);

module.exports = router;
