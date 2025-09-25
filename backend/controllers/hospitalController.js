const db = require('../db');

// Controller to search for hospitals based on filters
const searchHospitals = async (req, res) => {
    const { city, specialties, avg_cost_category } = req.query;

    let query = 'SELECT id, name, city, specialties, avg_cost_category, rating, description FROM hospitals WHERE 1=1';
    const params = [];

    if (city && city !== 'any') {
        query += ' AND city = ?';
        params.push(city);
    }
    if (specialties && specialties !== 'any') {
        query += ' AND specialties LIKE ?';
        params.push(`%${specialties}%`);
    }
    if (avg_cost_category && avg_cost_category !== 'any') {
        query += ' AND avg_cost_category = ?';
        params.push(avg_cost_category);
    }

    query += ' ORDER BY rating DESC LIMIT 10';

    try {
        const [hospitals] = await db.query(query, params);
        res.json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while searching hospitals' });
    }
};

// Controller to book a hospital for the logged-in user
const bookHospital = async (req, res) => {
    const { hospitalId } = req.body;
    const userId = req.user.id; // Get user ID from the token (via middleware)
    if (!hospitalId) {
        return res.status(400).json({ message: 'Hospital ID is required' });
    }
    try {
        const [result] = await db.query('INSERT INTO bookings (user_id, hospital_id) VALUES (?, ?)', [userId, hospitalId]);
        const [hospitals] = await db.query('SELECT name FROM hospitals WHERE id = ?', [hospitalId]);
        const hospitalName = hospitals.length > 0 ? hospitals[0].name : 'Unknown Hospital';
        res.status(201).json({
            message: 'Booking confirmed',
            bookingId: result.insertId,
            hospitalName: hospitalName,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during booking' });
    }
};

// Controller to get the booking history for a specific user
const getBookingHistory = async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Forbidden: You can only view your own history.' });
    }
    try {
        const query = `
            SELECT 
                h.name AS hospitalName, 
                h.specialties, 
                b.booking_date AS date
            FROM bookings b
            JOIN hospitals h ON b.hospital_id = h.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `;
        const [bookings] = await db.query(query, [userId]);
        res.json({
            userId: parseInt(userId),
            bookings: bookings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching history' });
    }
};

module.exports = { searchHospitals, bookHospital, getBookingHistory };