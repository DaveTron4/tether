-- =========Clients Table=========
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

-- =========Payment History Table==========
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    
    -- The Foreign Key
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Payment History Table==========
CREATE INDEX IF NOT EXISTS idx_payment_history_client_id ON payment_history(client_id);

-- =========Users Table==========
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store HASHED password, not plain text
    role VARCHAR(20) DEFAULT 'employee', -- 'admin' or 'employee'
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Products Table=========
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    
    -- IDENTIFICATION
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    
    -- CATEGORIZATION
    category VARCHAR(50) NOT NULL,
    is_generic BOOLEAN DEFAULT FALSE,
    
    -- FINANCIALS
    price DECIMAL(10, 2) NOT NULL,       
    cost DECIMAL(10, 2),                 
    
    -- INVENTORY
    stock_quantity INTEGER DEFAULT 0,    
    min_stock_level INTEGER DEFAULT 5,   
    
    -- DYNAMIC DETAILS (JSONB)
    -- Stores: {"color": "Red", "compatibility": "iPhone 14"}
    properties JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========Sales Table=========
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    
    -- WHO DID IT?
    user_id INTEGER REFERENCES users(id),
    client_id INTEGER REFERENCES clients(id),
    
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Sale Items Table==========
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL
);

-- =========Repair Tickets Table=========
CREATE TABLE repair_tickets (
    id SERIAL PRIMARY KEY,
    
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    
    device_model VARCHAR(100),            -- "Samsung S21"
    issue_description TEXT,               -- "Screen cracked, touch not working"
    status VARCHAR(20) DEFAULT 'Intake',  -- 'Intake', 'In Progress', 'Done', 'Picked Up'
    
    estimated_cost DECIMAL(10, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);