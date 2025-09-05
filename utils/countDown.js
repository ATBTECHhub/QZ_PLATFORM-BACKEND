const moment = require('moment-timezone');
const { notifyUsers } = require('../controllers/waitlistController');

// Set the product launch date (adjust to any date you want in "Africa/Lagos" timezone)
const launchDate = moment.tz("25/09/2024 09:50:00", "DD/MM/YYYY HH:mm:ss", "Africa/Lagos");

// Countdown check function
const checkCountdown = () => {
    const now = moment.tz("Africa/Lagos"); // Get the current time in the same timezone as the launch date
    const diff = launchDate.diff(now); // Get the difference in milliseconds

    if (diff <= 0) {
        console.log("Countdown finished! Sending notifications...");
        notifyUsers();  // Trigger notifications to users when countdown finishes
        clearInterval(countdownInterval); // Stop the interval
    } else {
        const duration = moment.duration(diff); // Convert the difference into a duration object

        // Extracting days, hours, minutes, and seconds from duration
        const days = Math.floor(duration.asDays()); // Extract days
        const hours = String(duration.hours()).padStart(2, '0'); // Zero padding for hours
        const minutes = String(duration.minutes()).padStart(2, '0'); // Zero padding for minutes
        const seconds = String(duration.seconds()).padStart(2, '0'); // Zero padding for seconds

        // Format the countdown string
        const formattedCountdown = `${days} Days - ${hours}h : ${minutes}mins : ${seconds}s`;

        console.log(`Countdown: ${formattedCountdown}`);
    }
};

// Start checking the countdown every second for real-time updates
const startCountdown = () => {
    // Initial check
    checkCountdown();

    // Check countdown every second (1000 milliseconds)
    countdownInterval = setInterval(checkCountdown, 1000); // Using 1 second interval for real-time countdown
};

let countdownInterval; // To hold the interval reference for potential clearing

module.exports = { startCountdown };
