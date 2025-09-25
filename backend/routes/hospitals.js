const express = require('express');
const { searchHospitals, bookHospital, getBookingHistory } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware'); // Import the middleware
const router = express.Router();

// Public route - anyone can search for hospitals
router.get('/search', searchHospitals);

// Protected routes - only logged-in users can access these
router.post('/book', protect, bookHospital); 
router.get('/history/:userId', protect, getBookingHistory);

module.exports = router;