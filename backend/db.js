const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // We added the custom Aiven port here
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false // This satisfies Aiven's strict SSL requirement
    }
});

pool.getConnection((err, conn) => {
    if(err) console.log('Database connection failed.', err);
    else {
        console.log('Database connected successfully.');
        conn.release();
    }
});

module.exports = pool.promise();
