-- HealthNova Database Schema
-- Run this file to set up the required tables in MySQL.
--
-- Usage:
--   mysql -u root -p < database/schema.sql
-- OR paste the contents into MySQL Workbench / phpMyAdmin.

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS healthnova;
USE healthnova;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    specialties VARCHAR(255) NOT NULL,
    avg_cost_category ENUM('Low', 'Medium', 'High') NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hospital_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Sample hospital data (optional — remove if you want to start fresh)
INSERT INTO hospitals (name, city, specialties, avg_cost_category, rating, description) VALUES
('City General Hospital', 'Mumbai', 'Cardiology', 'Medium', 4.5, 'A leading cardiac care centre in the heart of Mumbai.'),
('Apollo Wellness Centre', 'Delhi', 'Orthopedics', 'High', 4.7, 'World-class orthopaedic procedures with cutting-edge technology.'),
('Sunrise Medical Institute', 'Bangalore', 'Neurology', 'High', 4.8, 'Pioneering neurological treatments and brain surgery.'),
('Green Valley Clinic', 'Chennai', 'General', 'Low', 4.2, 'Affordable general healthcare for the whole family.'),
('Heritage Health Hub', 'Hyderabad', 'Pediatrics', 'Medium', 4.4, 'Specialised care for infants, children and teenagers.'),
('Lotus Cancer Care', 'Pune', 'Oncology', 'High', 4.6, 'Comprehensive cancer diagnosis, treatment and rehabilitation.'),
('Rainbow Children Hospital', 'Kolkata', 'Pediatrics', 'Low', 4.3, 'Dedicated children''s hospital offering compassionate care.'),
('Medicity Super Specialty', 'Mumbai', 'Cardiology', 'High', 4.9, 'State-of-the-art cardiovascular surgery and interventions.'),
('Lifespring Maternity', 'Delhi', 'Gynecology', 'Medium', 4.5, 'Expert maternity, obstetrics and gynaecology services.'),
('Hope Neuro Spine Institute', 'Bangalore', 'Neurology', 'High', 4.7, 'Advanced spine surgery and neuro-rehabilitation programs.');
