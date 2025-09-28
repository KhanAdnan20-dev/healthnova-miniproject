require('dotenv').config();
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*****" : "EMPTY");
console.log("DB_NAME:", process.env.DB_NAME);

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