const express = require('express');
const Booking = require('../models/Booking');
const Packages = require('../models/Packages');
const authMiddleware = require('../middleware/auth');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const router = express.Router();

// Get all bookings for a user, sorted by creation date (most recent first)
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.userId })
            .populate('package') // Populate the package field
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .exec();

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error.message);
        res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
});

//add bookings

router.post('/package/:packageId/book', authMiddleware, async (req, res) => {
    const { numberOfPersons, bookingDate } = req.body;
    const packageId = req.params.packageId;

    if (!numberOfPersons || numberOfPersons <= 0) {
        return res.status(400).json({ error: 'Please provide a valid number of persons.' });
    }

    if (!bookingDate) {
        return res.status(400).json({ error: 'Please provide a valid booking date.' });
    }

    try {
        const package = await Packages.findById(packageId);

        if (!package) {
            return res.status(404).json({ error: 'Package not found.' });
        }

        const totalAmount = package.price * numberOfPersons;
       

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // amount in cents
            currency: 'usd',
            metadata: { packageId: packageId, userId: req.userId },
        });

        
        

        // Create a new booking
        const booking = new Booking({
            user: req.userId,
            package: packageId,
            numberOfPersons,
            bookingDate,
            totalAmount,
            stripePaymentId: paymentIntent.id, // Store the payment intent ID in the booking
            status: 'pending',
        });

       
     
       
        await booking.save();
        
        // Create a corresponding payment record
        const payment = new Payment({
            user: req.userId,
            booking: booking._id,
            amount: totalAmount,
            currency: 'usd',
            status: 'Pending', 
            stripePaymentId: paymentIntent.id, // Save the payment intent ID
        });

        
        

        await payment.save();

        // Respond with the booking ID and client secret
        res.json({ bookingId: booking._id, clientSecret: paymentIntent.client_secret, stripePaymentId: paymentIntent.id  });
    } catch (error) {
        console.error('Error creating booking:', error.message);
        res.status(500).json({ error: 'Failed to create booking.' });
    }
});



// Cancel a booking
router.delete('/booking/:bookingId/cancel', authMiddleware, async (req, res) => {
    const bookingId = req.params.bookingId;

    try {
        const booking = await Booking.findOne({ _id: bookingId, user: req.userId });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        if (booking.status === 'canceled') {
            return res.status(400).json({ error: 'Booking is already canceled.' });
        }

        // Update the status to 'canceled' without modifying other fields
        booking.status = 'canceled';
        await booking.save(); // Save the updated booking

        res.json({ message: 'Booking canceled successfully.' });
    } catch (error) {
        console.error('Error canceling booking:', error.message);
        res.status(500).json({ error: 'Failed to cancel booking.' });
    }
});

// Clear all bookings for the authenticated user
router.delete('/bookings/clear', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from token
  

        const bookings = await Booking.find({ user: userId });


        await Booking.deleteMany({ user: userId }); // Assuming bookings have a user field
        res.status(200).json({ message: 'All bookings cleared successfully' });
    } catch (error) {
        console.error('Error clearing bookings:', error.message);
        res.status(500).json({ message: 'Failed to clear bookings', error });
    }
});

// Update booking status
router.put('/:bookingId/status', async (req, res) => {
    const { bookingId } = req.params; 
    const { status } = req.body;

    try {
        const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        res.json(booking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).send('Failed to update booking status');
    }
});

module.exports = router;
