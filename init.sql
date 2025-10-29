-- ==========================
-- ROLES (for scalable RBAC)
-- ==========================
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- USER_ROLES (Many-to-Many)
-- ==========================
CREATE TABLE user_roles (
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(36) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ==========================
-- DOCTOR
-- ==========================
CREATE TABLE doctor (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    specialty VARCHAR(255) NOT NULL,
    license_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================
-- PATIENT
-- ==========================
CREATE TABLE patient (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    dob DATE NOT NULL,
    phone_number VARCHAR(20),
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================
-- SLOT
-- ==========================
CREATE TABLE slot (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    -- MySQL CHECK constraints (from 8.0.16+)
    CONSTRAINT chk_slot_time CHECK (start_time < end_time)
);

-- ==========================
-- APPOINTMENT
-- ==========================
CREATE TABLE appointment (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    slot_id VARCHAR(36) NOT NULL UNIQUE REFERENCES slot(id) ON DELETE CASCADE,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'COMPLETED', 'CANCELLED'))
);

-- ==========================
-- MEDICAL NOTE
-- ==========================
CREATE TABLE medical_note (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id VARCHAR(36) UNIQUE NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
    notes_text TEXT,
    updated_by VARCHAR(36) REFERENCES doctor(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================
-- MEDICINE
-- ==========================
CREATE TABLE medicine (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) UNIQUE NOT NULL,
    dosage_form VARCHAR(100),
    description TEXT,
    updated_by VARCHAR(36) REFERENCES doctor(id)
);

-- ==========================
-- PRESCRIPTION
-- ==========================
CREATE TABLE prescription (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    dosage TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- PRESCRIPTION_MEDICINE (Many-to-Many)
-- ==========================
CREATE TABLE prescription_medicine (
    prescription_id VARCHAR(36) REFERENCES prescription(id) ON DELETE CASCADE,
    medicine_id VARCHAR(36) REFERENCES medicine(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity > 0),
    PRIMARY KEY (prescription_id, medicine_id)
);

-- ==========================
-- CHAT MESSAGE
-- ==========================
CREATE TABLE chat_message (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- ==========================
-- INDEXES
-- ==========================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_slot_doctor ON slot(doctor_id);
CREATE INDEX idx_appointment_patient ON appointment(patient_id);
CREATE INDEX idx_chat_sender_receiver ON chat_message(sender_id, receiver_id);

-- ROLES
INSERT INTO roles (id, name) VALUES 
(UUID(), 'ADMIN'), (UUID(), 'DOCTOR'), (UUID(), 'PATIENT');

-- USERS
INSERT INTO users (id, first_name, last_name, email, password_hash, is_enabled) VALUES
(UUID(), 'Nithin', 'Mouli', 'admin@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
(UUID(), 'Elana', 'Smith', 'dr.smith@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
(UUID(), 'William', 'Jones', 'dr.jones@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
(UUID(), 'John', 'Doe', 'john.doe@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
(UUID(), 'Jane', 'Doe', 'jane.doe@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE);

-- USER_ROLES
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@cureconnect.com' AND r.name = 'ADMIN';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'dr.smith@cureconnect.com' AND r.name = 'DOCTOR';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'dr.jones@cureconnect.com' AND r.name = 'DOCTOR';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'john.doe@cureconnect.com' AND r.name = 'PATIENT';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'jane.doe@cureconnect.com' AND r.name = 'PATIENT';

-- DOCTORS
INSERT INTO doctor (id, specialty, license_id, user_id)
SELECT UUID(), 'Cardiology', 'LIC12345', id FROM users WHERE email='dr.smith@cureconnect.com';

INSERT INTO doctor (id, specialty, license_id, user_id)
SELECT UUID(), 'Dermatology', 'LIC67890', id FROM users WHERE email='dr.jones@cureconnect.com';

-- PATIENTS
INSERT INTO patient (id, dob, phone_number, user_id)
SELECT UUID(), '1985-07-12', '+15551234567', id FROM users WHERE email='john.doe@cureconnect.com';

INSERT INTO patient (id, dob, phone_number, user_id)
SELECT UUID(), '1990-09-22', '+15559876543', id FROM users WHERE email='jane.doe@cureconnect.com';

-- SLOTS
INSERT INTO slot (id, doctor_id, start_time, end_time, is_booked)
SELECT UUID(), d.id, '2025-10-28 09:00:00', '2025-10-28 09:30:00', TRUE FROM doctor d WHERE license_id='LIC12345';

INSERT INTO slot (id, doctor_id, start_time, end_time, is_booked)
SELECT UUID(), d.id, '2025-10-28 10:00:00', '2025-10-28 10:30:00', FALSE FROM doctor d WHERE license_id='LIC12345';

INSERT INTO slot (id, doctor_id, start_time, end_time, is_booked)
SELECT UUID(), d.id, '2025-10-29 11:00:00', '2025-10-29 11:30:00', TRUE FROM doctor d WHERE license_id='LIC67890';

-- APPOINTMENTS
INSERT INTO appointment (id, slot_id, patient_id, status)
SELECT UUID(), s.id, p.id, 'BOOKED'
FROM slot s, patient p
WHERE s.is_booked = TRUE AND p.phone_number = '+15551234567'
LIMIT 1;

-- MEDICAL NOTES
INSERT INTO medical_note (id, appointment_id, notes_text, updated_by)
SELECT UUID(), a.id, 'Patient shows improvement. Continue medication for 2 weeks.', d.id
FROM appointment a, doctor d
WHERE d.license_id = 'LIC12345'
LIMIT 1;

-- MEDICINES
INSERT INTO medicine (id, name, dosage_form, description, updated_by)
SELECT UUID(), 'Aspirin', 'Tablet', 'Used to reduce pain and fever', d.id FROM doctor d WHERE d.license_id='LIC12345';

INSERT INTO medicine (id, name, dosage_form, description, updated_by)
SELECT UUID(), 'Amoxicillin', 'Capsule', 'Antibiotic for bacterial infections', d.id FROM doctor d WHERE d.license_id='LIC67890';

-- PRESCRIPTIONS
INSERT INTO prescription (id, patient_id, doctor_id, dosage, instructions)
SELECT UUID(), p.id, d.id, 'Take one tablet twice a day', 'Continue for 7 days and report if symptoms persist'
FROM patient p, doctor d
WHERE p.phone_number = '+15551234567' AND d.license_id = 'LIC12345';

-- PRESCRIPTION_MEDICINE
INSERT INTO prescription_medicine (prescription_id, medicine_id, quantity)
SELECT pr.id, m.id, 14
FROM prescription pr, medicine m
WHERE m.name = 'Aspirin'
LIMIT 1;

-- CHAT MESSAGES
INSERT INTO chat_message (id, sender_id, receiver_id, message_text, is_read)
SELECT UUID(), u1.id, u2.id, 'Hello Doctor, I have a question about my dosage.', FALSE
FROM users u1, users u2
WHERE u1.email='john.doe@cureconnect.com' AND u2.email='dr.smith@cureconnect.com';

INSERT INTO chat_message (id, sender_id, receiver_id, message_text, is_read)
SELECT UUID(), u1.id, u2.id, 'Hi John, please continue as prescribed. Any new symptoms?', FALSE
FROM users u1, users u2
WHERE u1.email='dr.smith@cureconnect.com' AND u2.email='john.doe@cureconnect.com';
