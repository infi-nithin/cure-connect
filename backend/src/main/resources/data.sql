-- ROLES
INSERT INTO roles (name) VALUES 
('ADMIN'), ('DOCTOR'), ('PATIENT');

-- USERS
INSERT INTO users (first_name, last_name, email, password_hash, is_enabled) VALUES
('Nithin', 'Mouli', 'admin@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
('Elana', 'Smith', 'dr.smith@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
('William', 'Jones', 'dr.jones@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
('John', 'Doe', 'john.doe@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE),
('Jane', 'Doe', 'jane.doe@cureconnect.com', '$2y$10$UCa6UJFli2l3wLUSWe158uitSe9O90LO7lnVtdgisdAE2wO9vJ9XW', TRUE);

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
INSERT INTO doctor (specialty, license_id, user_id)
SELECT 'Cardiology', 'LIC12345', id FROM users WHERE email='dr.smith@cureconnect.com';
INSERT INTO doctor (specialty, license_id, user_id)
SELECT 'Dermatology', 'LIC67890', id FROM users WHERE email='dr.jones@cureconnect.com';

-- PATIENTS
INSERT INTO patient (dob, phone_number, user_id)
SELECT '1985-07-12', '+15551234567', id FROM users WHERE email='john.doe@cureconnect.com';
INSERT INTO patient (dob, phone_number, user_id)
SELECT '1990-09-22', '+15559876543', id FROM users WHERE email='jane.doe@cureconnect.com';

-- SLOTS
INSERT INTO slot (doctor_id, start_time, end_time, is_booked)
SELECT d.id, '2025-10-28 09:00:00', '2025-10-28 09:30:00', TRUE FROM doctor d WHERE license_id='LIC12345';
INSERT INTO slot (doctor_id, start_time, end_time, is_booked)
SELECT d.id, '2025-10-28 10:00:00', '2025-10-28 10:30:00', FALSE FROM doctor d WHERE license_id='LIC12345';
INSERT INTO slot (doctor_id, start_time, end_time, is_booked)
SELECT d.id, '2025-10-29 11:00:00', '2025-10-29 11:30:00', TRUE FROM doctor d WHERE license_id='LIC67890';

-- APPOINTMENTS
INSERT INTO appointment (slot_id, patient_id, status)
SELECT s.id, p.id, 'BOOKED'
FROM slot s, patient p
WHERE s.is_booked = TRUE AND p.phone_number = '+15551234567'
LIMIT 1;

-- MEDICAL NOTES
INSERT INTO medical_note (appointment_id, notes_text, updated_by)
SELECT a.id, 'Patient shows improvement. Continue medication for 2 weeks.', d.id
FROM appointment a, doctor d
WHERE d.license_id = 'LIC12345'
LIMIT 1;

-- MEDICINES
INSERT INTO medicine (name, dosage_form, description, updated_by)
SELECT 'Aspirin', 'Tablet', 'Used to reduce pain and fever', d.id FROM doctor d WHERE d.license_id='LIC12345';
INSERT INTO medicine (name, dosage_form, description, updated_by)
SELECT 'Amoxicillin', 'Capsule', 'Antibiotic for bacterial infections', d.id FROM doctor d WHERE d.license_id='LIC67890';

-- PRESCRIPTIONS
INSERT INTO prescription (patient_id, doctor_id, dosage, instructions)
SELECT p.id, d.id, 'Take one tablet twice a day', 'Continue for 7 days and report if symptoms persist'
FROM patient p, doctor d
WHERE p.phone_number = '+15551234567' AND d.license_id = 'LIC12345';

-- PRESCRIPTION_MEDICINE
INSERT INTO prescription_medicine (prescription_id, medicine_id, quantity)
SELECT pr.id, m.id, 14
FROM prescription pr, medicine m
WHERE m.name = 'Aspirin'
LIMIT 1;

-- CHAT MESSAGES
INSERT INTO chat_message (sender_id, receiver_id, message_text, is_read)
SELECT u1.id, u2.id, 'Hello Doctor, I have a question about my dosage.', FALSE
FROM users u1, users u2
WHERE u1.email='john.doe@cureconnect.com' AND u2.email='dr.smith@cureconnect.com';

INSERT INTO chat_message (sender_id, receiver_id, message_text, is_read)
SELECT u1.id, u2.id, 'Hi John, please continue as prescribed. Any new symptoms?', FALSE
FROM users u1, users u2
WHERE u1.email='dr.smith@cureconnect.com' AND u2.email='john.doe@cureconnect.com';
