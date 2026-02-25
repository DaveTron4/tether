-- =========Clients Table=========
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    zip_code VARCHAR(10),

    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    last_visit TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Subscriptions Table==========
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,

    service_type VARCHAR(20) NOT NULL, -- 'Phone' or 'WiFi'
    carrier VARCHAR(50) NOT NULL,      -- 'AT&T', 'Comcast'
    plan_amount DECIMAL(10, 2) NOT NULL,
    payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),

    status VARCHAR(20) DEFAULT 'Unpaid', -- 'Paid', 'Overdue'
    last_payment_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Payment History Table==========
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,

    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    amount_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Payment History Table==========
CREATE INDEX IF NOT EXISTS idx_payment_hist_sub_id ON payment_history(subscription_id);

-- =========Users Table==========
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
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
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    parts_cost DECIMAL(10, 2) DEFAULT 0,
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    charge_amount DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- =========Client Lifetime Value View=========
CREATE OR REPLACE VIEW client_lifetime_value AS
SELECT
    c.id AS client_id,
    COALESCE(sales_totals.sales_total, 0)
        + COALESCE(repair_totals.repair_total, 0)
        + COALESCE(payment_totals.subscription_total, 0) AS lifetime_value,
    COALESCE(sales_totals.sales_total, 0) AS sales_total,
    COALESCE(repair_totals.repair_total, 0) AS repair_total,
    COALESCE(payment_totals.subscription_total, 0) AS subscription_total
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(total_amount) AS sales_total
    FROM sales
    GROUP BY client_id
) sales_totals ON sales_totals.client_id = c.id
LEFT JOIN (
    SELECT client_id, SUM(charge_amount) AS repair_total
    FROM repair_tickets
    GROUP BY client_id
) repair_totals ON repair_totals.client_id = c.id
LEFT JOIN (
    SELECT s.client_id, SUM(ph.amount_paid) AS subscription_total
    FROM payment_history ph
    JOIN subscriptions s ON s.id = ph.subscription_id
    GROUP BY s.client_id
) payment_totals ON payment_totals.client_id = c.id;