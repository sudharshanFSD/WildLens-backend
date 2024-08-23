const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Packages = require('../models/Packages');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Get comments for a specific package
router.get('/package/:packageId/comments', authMiddleware, async (req, res) => {
    const { packageId } = req.params;
    

    try {
        //  if the package exists
        const packageExists = await Packages.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Retrieving comments for the specific package
        const comments = await Comment.find({ package: packageId })
            .populate('user', 'username') //  user field with only the username
            .sort({ createdAt: -1 }) // Sort by creation date descending
            .exec();

        // Mapping the comments to extract only the necessary fields
        const commentsWithUsernames = comments.map(comment => ({
            _id: comment._id, 
            username: comment.user.username,
            content: comment.content,
        }));

        res.json(commentsWithUsernames);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
});

// Add a comment to a specific package
router.post('/package/:packageId/comments', authMiddleware, async (req, res) => {
    const { content } = req.body;
    const { packageId } = req.params;
  

    try {
        // Verifying if the package exists
        const packageExists = await Packages.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Create and save the new comment
        const comment = new Comment({
            user: req.userId,
            package: packageId,
            content,
        });
        await comment.save();

        // Retrieve and return the comment details
        const commentDetails = await Comment.findById(comment._id).populate('user', 'username');
        const newComment = {
            _id: commentDetails._id, // Ensure _id is included
            username: commentDetails.user.username,
            content: commentDetails.content
        };

        res.json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

// Delete a comment from a specific package
router.delete('/package/:packageId/comments/:commentId', authMiddleware, async (req, res) => {
    const { packageId, commentId } = req.params;


    try {
        // Validate commentId
        if (!commentId) {
            return res.status(400).json({ message: 'Comment ID is required' });
        }

        const comment = await Comment.findById(commentId);

        // Check if the comment exists and if the user is authorized to delete it
        if (!comment || comment.user.toString() !== req.userId) {
            return res.status(404).json({ message: 'Comment not found or not authorized' });
        }

        // Remove the comment ID from the package's comments array
        await Packages.findByIdAndUpdate(packageId, {
            $pull: { comments: commentId }
        });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
});

module.exports = router;
