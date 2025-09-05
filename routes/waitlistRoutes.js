const express = require('express');
const { addToWaitlist, getWaitlist } = require('../controllers/waitlistController');

const router = express.Router();

// Endpoint to add users to waitlist
/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Add Email to the Waitlist
 *     tags:
 *       - Waitlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: User added to waitlist
 *       400:
 *         description: Email already added to the waitlist
 *       
 */
router.post('/', addToWaitlist);

/**
 * @swagger
 * /api/waitlist:
 *   get:
 *     summary: Get all users on the waitlist
 *     tags:
 *       - Waitlist
 *     responses:
 *       200:
 *         description: List of users on the waitlist
 */
router.get('/', getWaitlist);
module.exports = router;
