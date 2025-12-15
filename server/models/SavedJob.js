const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    jobId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: '',
    },
    salary: {
        type: String,
        default: '',
    },
    jobType: {
        type: String,
        default: '',
    },
    applyLink: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        default: 'jooble',
    },
    savedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound index to prevent duplicate saved jobs
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;

