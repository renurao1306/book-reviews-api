const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');

const createBook = async (req, res) => {
    try {
        const { title, author, genre } = req.body;
        if (!title || !author || !genre) {
            return res.status(400).json({ message: 'Title, author, and genre are required' });
        }

        const newBook = new Book({ title, author, genre });
        await newBook.save();

        return res.status(201).json(newBook);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating book', error: error.message });
    }
}

const getBooks = async (req, res) => {
    try {
        const { author, genre, page = 1, limit = 10 } = req.query;

        const query = {};
        if (author) query.author = author;
        if (genre) query.genre = genre;

        const books = await Book.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalBooks = await Book.countDocuments(query);

        return res.status(200).json({
            books,
            totalBooks,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const book = await Book.findById(id).populate('reviews');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const reviews = await Review.find({ book: id })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const avgRating = await Review.aggregate([
            { $match: { book: new mongoose.Types.ObjectId(id) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);

        const totalReviews = await Review.countDocuments({ book: id })

        return res.status(200).json({
            book,
            avgRating: avgRating.length ? avgRating[0].avgRating : null,
            reviews,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
};

const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
            ],
        });

        return res.status(200).json({ books });
    } catch (error) {
        return res.status(500).json({ message: 'Error searching books', error: error.message });
    }
};

module.exports = { createBook, getBooks, getBookById, searchBooks };