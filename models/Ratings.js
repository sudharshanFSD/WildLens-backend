const mongoose = require('mongoose');

const ratingsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
    value: { type: Number, required: true, min: 0, max: 5 }  // Rating value between 0 and 5
}, { timestamps: true });

module.exports = mongoose.model('Ratings', ratingsSchema);
