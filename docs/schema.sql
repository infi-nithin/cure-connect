-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================
-- ROLES (for scalable RBAC)
-- ==========================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- USER_ROLES (Many-to-Many)
-- ==========================
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ==========================
-- DOCTOR
-- ==========================
CREATE TABLE doctor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty VARCHAR(255) NOT NULL,
    license_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================
-- PATIENT
-- ==========================
CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dob DATE NOT NULL,
    phone_number VARCHAR(20),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================
-- SLOT
-- ==========================
CREATE TABLE slot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_slot_time CHECK (start_time < end_time)
);

-- ==========================
-- APPOINTMENT
-- ==========================
CREATE TABLE appointment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL UNIQUE REFERENCES slot(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('BOOKED', 'COMPLETED', 'CANCELLED')) DEFAULT 'BOOKED'
);

-- ==========================
-- MEDICAL NOTE
-- ==========================
CREATE TABLE medical_note (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
    notes_text TEXT,
    updated_by UUID REFERENCES doctor(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- MEDICINE
-- ==========================
CREATE TABLE medicine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    dosage_form VARCHAR(100),
    description TEXT,
    updated_by UUID REFERENCES doctor(id)
);

-- ==========================
-- PRESCRIPTION
-- ==========================
CREATE TABLE prescription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    dosage TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- PRESCRIPTION_MEDICINE (Many-to-Many)
-- ==========================
CREATE TABLE prescription_medicine (
    prescription_id UUID REFERENCES prescription(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicine(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity > 0),
    PRIMARY KEY (prescription_id, medicine_id)
);

-- ==========================
-- CHAT MESSAGE
-- ==========================
CREATE TABLE chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
