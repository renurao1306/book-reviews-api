const express = require('express');
const auth = require('../middleware/auth');
const { getBooks, getBookById, createBook, searchBooks} = require('../controllers/bookController');

const router = express.Router();
router.post('/books', auth, createBook);
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.get('/search', searchBooks);

module.exports = router;