-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS painter_timesheet;
USE painter_timesheet;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    hourlyRate DECIMAL(10, 2),
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Locations table
CREATE TABLE IF NOT EXISTS Locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zipCode VARCHAR(10) NOT NULL,
    isActive BOOLEAN DEFAULT true,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create TimeEntries table
CREATE TABLE IF NOT EXISTS TimeEntries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    locationId INT NOT NULL,
    clockIn DATETIME NOT NULL,
    clockOut DATETIME,
    breakStart DATETIME,
    breakEnd DATETIME,
    breakDuration INT,
    totalHours DECIMAL(10, 2),
    notes TEXT,
    status ENUM('active', 'completed', 'modified') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (locationId) REFERENCES Locations(id)
);

-- Create indexes
CREATE INDEX idx_user_username ON Users(username);
CREATE INDEX idx_timeentry_userid ON TimeEntries(userId);
CREATE INDEX idx_timeentry_locationid ON TimeEntries(locationId);
CREATE INDEX idx_timeentry_clockin ON TimeEntries(clockIn);
CREATE INDEX idx_location_name ON Locations(name);

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, password, firstName, lastName, role)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE id=id;
