const Book = require('../models/Book');
const Review = require('../models/Review');

const addReview = async (req, res) => {
    try {
        const { id: bookId } = req.params;
        const { rating, comment } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const existingReview = await Review.findOne({ book: bookId, user: req.user.id });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this book' });

        const review = new Review({
            book: bookId,
            user: req.user.id,
            rating,
            comment
        });

        await review.save();
        await Book.findByIdAndUpdate(bookId, { $push: { reviews: review._id } });

        return res.status(201).json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Error adding review', error: error.message });
    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own review' });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        return res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating review', error: error.message });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if(review.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own review' });
        }

        await Review.findByIdAndDelete(id);
        await Book.findByIdAndUpdate(review.book, { $pull: { reviews: id } });

        return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
}

module.exports = { addReview, updateReview, deleteReview };