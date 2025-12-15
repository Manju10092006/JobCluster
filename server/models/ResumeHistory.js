/**
 * Resume History Model
 * Stores complete ATS analysis results for authenticated users
 */

const mongoose = require('mongoose');

const resumeHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    originalFilename: {
        type: String,
        required: true,
    },
    storedFilepath: {
        type: String,
        default: '',
    },
    analysisScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    skills: {
        type: [String],
        default: [],
    },
    summary: {
        type: String,
        default: '',
    },
    suggestions: {
        type: [String],
        default: [],
    },
    strengths: {
        type: [String],
        default: [],
    },
    weaknesses: {
        type: [String],
        default: [],
    },
    experience: {
        type: String,
        default: '',
    },
    education: {
        type: String,
        default: '',
    },
    fullJson: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound index for user queries sorted by date
resumeHistorySchema.index({ userId: 1, createdAt: -1 });

const ResumeHistory = mongoose.model('ResumeHistory', resumeHistorySchema);

module.exports = ResumeHistory;



