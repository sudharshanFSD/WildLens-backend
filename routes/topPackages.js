const express = require('express');
const router = express.Router();
const Packages = require('../models/Packages');

// Route to get top 5 packages
router.get('/topPackages', async (req, res) => {
    try {
        const topPackages = await Packages.aggregate([
            {
                $project: {
                    title: 1,
                    description: 1,
                    price: 1,
                    images: 1,
                    averageRating: { $avg: "$ratings.rating" },
                    numberOfComments: { $size: "$comments" }
                }
            },
            { $sort: { averageRating: -1, numberOfComments: -1 } },
            { $limit: 5 }
        ]);

        if (topPackages.length > 0) {
            res.json(topPackages);
        } else {
            res.status(404).json({ message: 'No packages found' });
        }
    } catch (error) {
        console.error('Error fetching top packages:', error.message);
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
