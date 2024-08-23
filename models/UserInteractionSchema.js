const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
