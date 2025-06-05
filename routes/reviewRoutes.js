const express = require('express');
const auth = require('../middleware/auth');
const { addReview, updateReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();
router.post('/books/:id/reviews', auth, addReview);
router.put('/reviews/:id', auth, updateReview);
router.delete('/reviews/:id', auth, deleteReview);

module.exports = router;