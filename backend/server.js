require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the HealthNova API!');
});
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});