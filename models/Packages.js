const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    videos: [String],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ratings' }],  // Reference to Ratings schema
}, { timestamps: true });

module.exports = mongoose.model('Packages', packageSchema);
