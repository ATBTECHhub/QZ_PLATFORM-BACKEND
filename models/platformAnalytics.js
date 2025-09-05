const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const platformAnalyticsSchema = new Schema({
    totalUsers: {
        type: Number,
        default: 0,
        required: true
    },
    totalGroups: {
        type: Number,
        default: 0,
        required: true
    },
    totalTests: {
        type: Number,
        default: 0,
        required: true
    },
    totalQuestions: {
        type: Number,
        default: 0,
        required: true
    },
    activeUsers: {
        type: Number,
        default: 0,
        required: true
    },
    inactiveUsers: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('platformAnalytics', platformAnalyticsSchema);