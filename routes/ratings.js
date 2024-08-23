const express = require('express');
const router = express.Router();
const Ratings = require('../models/Ratings');
const Packages = require('../models/Packages');
const authMiddleware = require('../middleware/auth');

// Add Rating
router.post('/package/:packageId/ratings', authMiddleware, async (req, res) => {
    const { packageId } = req.params;
    const { value } = req.body;

    try {
        // Check if the package exists
        const packageExists = await Packages.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Validate rating value
        if (value < 0 || value > 5) {
            return res.status(400).json({ message: 'Rating value must be between 0 and 5' });
        }

        // Create and save the rating
        const rating = new Ratings({
            user: req.userId,
            package: packageId,
            value,
        });

        await rating.save();

        // Add rating to the package's ratings array
        await Packages.findByIdAndUpdate(packageId, {
            $push: { ratings: rating._id }
        });

        res.json({ message: 'Rating added successfully' });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Error adding rating', error: error.message });
    }
});

router.get('/package/:packageId/ratings', authMiddleware, async (req, res) => {
    const { packageId } = req.params;

    try {
        // Check if the package exists
        const packageExists = await Packages.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Fetch ratings for the package
        const ratings = await Ratings.find({ package: packageId })
            .populate('user', 'username')  // Populate the user field with only the username
            .exec();

        // Map the ratings to extract necessary fields
        const ratingsWithUsernames = ratings.map(rating => ({
            username: rating.user.username,
            value: rating.value
        }));

        res.json(ratingsWithUsernames);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Error fetching ratings', error: error.message });
    }
});

module.exports = router;
