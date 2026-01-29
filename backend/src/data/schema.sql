-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    zip_code VARCHAR(10),
    
    -- ISP & Login Details
    carrier VARCHAR(50) NOT NULL,
    
    -- Financials & Scheduling
    plan_amount DECIMAL(10, 2) NOT NULL,
    payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
    
    -- App State
    status VARCHAR(20) DEFAULT 'Unpaid',
    last_payment_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    
    -- The Foreign Key
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on client_id in payment_history for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_history_client_id ON payment_history(client_id);