const mongoose = require('mongoose');

const userResumeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    atsScore: {
        type: Number,
        default: null,
    },
    summary: {
        type: String,
        default: '',
    },
    skills: {
        type: [String],
        default: [],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for faster queries
userResumeSchema.index({ userId: 1, uploadedAt: -1 });

const UserResume = mongoose.model('UserResume', userResumeSchema);

module.exports = UserResume;



