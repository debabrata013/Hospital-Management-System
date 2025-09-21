-- Hospital Management System Database Schema
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    employeeId VARCHAR(100) UNIQUE,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phoneNumber VARCHAR(20) UNIQUE,
    address TEXT,
    gender ENUM('male', 'female', 'other'),
    dateOfBirth DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create default admin user
INSERT IGNORE INTO Users (email, password, role, employeeId, isActive, firstName, lastName) 
VALUES ('admin@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'EMP001', TRUE, 'System', 'Administrator');

-- Patients table
CREATE TABLE IF NOT EXISTS Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phoneNumber VARCHAR(20),
    address TEXT,
    gender ENUM('male', 'female', 'other'),
    dateOfBirth DATE,
    emergencyContact VARCHAR(20),
    bloodGroup VARCHAR(5),
    allergies TEXT,
    medicalHistory TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT,
    doctorId INT,
    appointmentDate DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES Patients(id),
    FOREIGN KEY (doctorId) REFERENCES Users(id)
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS MedicalRecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    doctorId INT NOT NULL,
    visitDate DATETIME NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    vitals JSON,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES Patients(id),
    FOREIGN KEY (doctorId) REFERENCES Users(id)
);

-- Billing table
CREATE TABLE IF NOT EXISTS Billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    appointmentId INT,
    totalAmount DECIMAL(10,2) NOT NULL,
    paidAmount DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'paid', 'partial', 'cancelled') DEFAULT 'pending',
    paymentMethod VARCHAR(50),
    billDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    dueDate DATETIME,
    items JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES Patients(id),
    FOREIGN KEY (appointmentId) REFERENCES Appointments(id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemName VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 0,
    unitPrice DECIMAL(10,2),
    supplier VARCHAR(255),
    expiryDate DATE,
    batchNumber VARCHAR(100),
    minStockLevel INT DEFAULT 10,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS Rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomNumber VARCHAR(20) UNIQUE NOT NULL,
    roomType ENUM('general', 'private', 'icu', 'emergency') NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    capacity INT DEFAULT 1,
    currentOccupancy INT DEFAULT 0,
    dailyRate DECIMAL(10,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff Shifts table
CREATE TABLE IF NOT EXISTS StaffShifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staffId INT NOT NULL,
    shiftDate DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staffId) REFERENCES Users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_patients_patientId ON Patients(patientId);
CREATE INDEX idx_appointments_date ON Appointments(appointmentDate);
CREATE INDEX idx_appointments_status ON Appointments(status);
CREATE INDEX idx_billing_status ON Billing(status);
CREATE INDEX idx_rooms_status ON Rooms(status);
