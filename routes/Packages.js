const express = require('express');
const router = express.Router();
const Packages = require('../models/Packages');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
require('dotenv').config();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add Packages
router.post('/addPackage', authMiddleware, adminMiddleware, upload.array('media'), async (req, res) => {
    const { title, description, price } = req.body;
    try {
        // Upload media files to Cloudinary
        const mediaUrls = await Promise.all(req.files.map(async (file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                uploadStream.end(file.buffer);
            });
        }));

        const newPackage = new Packages({
            title,
            description,
            price,
            images: mediaUrls.filter(url => url.endsWith('.jpg') || url.endsWith('.png')),
            videos: mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.mov')),
        });

        await newPackage.save();
        res.json({ message: 'Package added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all packages
router.get('/package', async (req, res) => {
    try {
        const packages = await Packages.find();
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
});

//Route to get packages with optional search and sort parameters
router.get('/search', async (req, res) => {
    const { sort, title } = req.query;

    try {
        // Search criteria
        const searchCriteria = {};
        if (title) {
            searchCriteria.title = { $regex: `^${title}`, $options: 'i' }; // Matches titles starting with the given string
        }

        // Sort order
        const sortOrder = sort === 'descend' ? -1 : 1;

        // Query the database
        const packages = await Packages.find(searchCriteria).sort({ price: sortOrder }).exec(); 
        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Error fetching packages.' });
    }
});
// Get a package by ID
router.get('/package/:packageId', async (req, res) => {
    const { packageId } = req.params;
    try {
        const packageDetails = await Packages.findById(packageId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .exec();

        if (!packageDetails) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.json(packageDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching package details', error: error.message });
    }
});

// Update Packages
router.put('/package/:packageId', authMiddleware, adminMiddleware, upload.array('media'), async (req, res) => {
    const { packageId } = req.params;
    const { title, description, price } = req.body;

    try {
        // Find the package by ID
        const package = await Packages.findById(packageId);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Updating fields if they exist in the request
        if (title) package.title = title;
        if (description) package.description = description;
        if (price) package.price = price;

        // If new media files are provided, replacing the existing ones
        if (req.files && req.files.length > 0) {
            const mediaUrls = await Promise.all(req.files.map(async (file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        });
                    uploadStream.end(file.buffer);
                });
            }));

            // Replacing existing images and videos with new uploads
            package.images = mediaUrls.filter(url => url.endsWith('.jpg') || url.endsWith('.png'));
            package.videos = mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.mov'));
        }

       
        const updatedPackage = await package.save();
        res.json({ message: 'Package updated', package: updatedPackage });
    } catch (error) {
        res.status(500).json({ message: 'Error updating package', error: error.message });
    }
});

// Delete Packages
router.delete('/package/:packageId', authMiddleware, adminMiddleware, async (req, res) => {
    const { packageId } = req.params;
    try {
        await Packages.findByIdAndDelete(packageId);
        res.json({ message: 'Package deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package', error: error.message });
    }
});

module.exports = router;
