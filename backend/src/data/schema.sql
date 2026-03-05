CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    -- Each store/tenant in the system
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- BASIC INFO
    store_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL, 

    -- BRANDING
    logo_url TEXT,
    theme_primary_color VARCHAR(7) DEFAULT '#454796',
    theme_secondary_color VARCHAR(7) DEFAULT '#CCAF2B',

    -- CONTACT & LOCATION
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip VARCHAR(20),

    -- 4. BILLING & SUBSCRIPTION
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50) DEFAULT 'trialing', -- 'active', 'past_due', 'canceled'
    subscription_tier VARCHAR(50) DEFAULT 'pro_cloud',  -- 'local_basic', 'pro_cloud'
    
    -- 5. STORE CONFIGURATION
    tax_rate DECIMAL(5,4) DEFAULT 0.0800, -- e.g., 8% local sales tax
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- 6. TIMESTAMPS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========Clients Table=========
CREATE TABLE IF NOT EXISTS clients (
    -- Each client/customer of the store
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- BASIC INFO
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    zip_code VARCHAR(10),

    -- DYNAMIC DETAILS
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    last_visit TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Subscriptions Table==========
CREATE TABLE IF NOT EXISTS subscriptions (
    -- Each subscription for a client (Phone, WiFi)
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- SUBSCRIPTION DETAILS
    service_type VARCHAR(20) NOT NULL, -- 'Phone' or 'WiFi'
    carrier VARCHAR(50) NOT NULL,      -- 'AT&T', 'Comcast'
    plan_amount DECIMAL(10, 2) NOT NULL,
    payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),

    -- PAYMENT & STATUS
    status VARCHAR(20) DEFAULT 'Unpaid', -- 'Paid', 'Overdue'
    last_payment_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Payment History Table==========
CREATE TABLE IF NOT EXISTS payment_history (
    -- Each payment record for a subscription
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    -- PAYMENT DETAILS
    amount_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Payment History Table==========
CREATE INDEX IF NOT EXISTS idx_payment_hist_sub_id ON payment_history(subscription_id);

-- =========Users Table==========
CREATE TABLE IF NOT EXISTS users (
    -- Employees/Users of the store
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- AUTH & ROLES
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL, -- Store HASHED password, not plain text
    role VARCHAR(20) DEFAULT 'employee', -- 'admin' or 'employee' or 'superadmin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, username),
    UNIQUE(tenant_id, email)
);

-- =========Products Table=========
CREATE TABLE products (
    -- Inventory items sold in the store (phones, accessories, repair parts)
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

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
    -- Each sale transaction in the store (phone sale, accessory sale, repair charge)
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- WHO DID IT?
    user_id INTEGER REFERENCES users(id),
    client_id INTEGER REFERENCES clients(id),
    
    -- WHAT WAS SOLD?
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========Sale Items Table==========
CREATE TABLE sale_items (
    -- Line items for each sale, linking products to sales with quantity and price at time of sale
    id SERIAL PRIMARY KEY,

    -- LINKS
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    
    -- DETAILS
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL
);

-- =========Repair Tickets Table=========
CREATE TABLE repair_tickets (
    -- Each repair job for a client's device, with details and costs
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    
    -- REPAIR DETAILS
    device_model VARCHAR(100),            -- "Samsung S21"
    issue_description TEXT,               -- "Screen cracked, touch not working"
    status VARCHAR(20) DEFAULT 'Intake',  -- 'Intake', 'In Progress', 'Done', 'Picked Up'
    
    -- COST ESTIMATES & CHARGES
    estimated_cost DECIMAL(10, 2),
    parts_cost DECIMAL(10, 2) DEFAULT 0,
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    charge_amount DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE OR REPLACE VIEW client_lifetime_value AS
SELECT
    c.id AS client_id,
    c.tenant_id,
    COALESCE(sales_totals.sales_total, 0)
        + COALESCE(repair_totals.repair_total, 0)
        + COALESCE(payment_totals.subscription_total, 0) AS lifetime_value,
    COALESCE(sales_totals.sales_total, 0) AS sales_total,
    COALESCE(repair_totals.repair_total, 0) AS repair_total,
    COALESCE(payment_totals.subscription_total, 0) AS subscription_total
FROM clients c
LEFT JOIN (
    SELECT client_id, tenant_id, SUM(total_amount) AS sales_total
    FROM sales
    GROUP BY client_id, tenant_id
) sales_totals ON sales_totals.client_id = c.id AND sales_totals.tenant_id = c.tenant_id
LEFT JOIN (
    SELECT client_id, tenant_id, SUM(charge_amount) AS repair_total
    FROM repair_tickets
    GROUP BY client_id, tenant_id
) repair_totals ON repair_totals.client_id = c.id AND repair_totals.tenant_id = c.tenant_id
LEFT JOIN (
    SELECT s.client_id, s.tenant_id, SUM(ph.amount_paid) AS subscription_total
    FROM payment_history ph
    JOIN subscriptions s ON s.id = ph.subscription_id AND ph.tenant_id = s.tenant_id
    GROUP BY s.client_id, s.tenant_id
) payment_totals ON payment_totals.client_id = c.id AND payment_totals.tenant_id = c.tenant_id;