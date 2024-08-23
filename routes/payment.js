const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const Payment = require('../models/Payment'); 
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
    const { amount, bookingId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
        });

        // Create a Payment entry in the database
        const payment = new Payment({
            user: req.user.id,
            booking: bookingId, // Pass booking ID here
            amount,
            currency: 'usd',
            status: 'Pending',
            stripePaymentId: paymentIntent.id,
        });
        await payment.save();
        console.log('payment page stripeid : ',payment.stripePaymentId);
        
        res.json({ clientSecret: paymentIntent.client_secret, stripePaymentId: paymentIntent.id });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send('Failed to create payment intent');
    }
});

//update payment status
router.put('/:stripePaymentId/status', async (req, res) => {

    const { stripePaymentId } = req.params;
    const { status } = req.body;

    try {
        const payment = await Payment.findOneAndUpdate(
            { stripePaymentId },  
            { status },
            { new: true }
        );

        if (!payment) {
            return res.status(404).send('Payment not found');
        }
        res.json(payment);
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).send('Failed to update payment status');
    }
});


module.exports = router;
