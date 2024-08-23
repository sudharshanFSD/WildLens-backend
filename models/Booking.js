const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
    bookingDate: { type: Date, required: true },
    numberOfPersons: { type: Number, required: true }, 
    status: { type: String, enum: ['pending', 'success', 'failed', 'canceled'], default: 'pending' }, // Added 'canceled'
    stripePaymentId: { type: String, required: true },
    additionalInfo: { type: String }
});

module.exports = mongoose.model('Booking', bookingSchema);
