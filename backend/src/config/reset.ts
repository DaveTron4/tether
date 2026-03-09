import dotenv from 'dotenv';

// Load environment variables before importing any DB code
dotenv.config();

import bcrypt from 'bcrypt';
const { pool } = await import('./database.js');

// Safety Check: Prevent running in production
if (process.env.NODE_ENV === 'production') {
    console.error("❌ DANGER: You cannot run reset.ts in production!");
    process.exit(1);
}

// ==========================================
// 1. TENANTS
// ==========================================
const createTenantsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS tenants CASCADE;
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
        subscription_status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'past_due', 'canceled', 'inactive'
        subscription_tier VARCHAR(50) DEFAULT 'starter',    -- 'starter', 'pro', 'enterprise'
        
        -- 5. STORE CONFIGURATION
        tax_rate DECIMAL(5,4) DEFAULT 0.0800, -- e.g., 8% local sales tax
        currency VARCHAR(3) DEFAULT 'USD',
        
        -- 6. TIMESTAMPS
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await pool.query(query);
    console.log("🏗️ Tenants table created");
};

const seedTenantsTable = async () => {
    // System tenant for superadmin
    await pool.query(`
        INSERT INTO tenants (store_name, subdomain, contact_email, subscription_status)
        VALUES ('System', 'system', 'superadmin@tether.com', 'active')
    `);

    // Tenant 1: Tether Tech Repair
    await pool.query(`
        INSERT INTO tenants (store_name, subdomain, contact_email, contact_phone, address_line1, address_city, address_state, address_zip, subscription_status, subscription_tier)
        VALUES ('Tether Tech Repair', 'tether', 'info@tether.com', '404-123-4567', '123 Main St', 'Atlanta', 'GA', '30018', 'active', 'pro')
    `);

    // Tenant 2: QuickFix Mobile
    await pool.query(`
        INSERT INTO tenants (store_name, subdomain, contact_email, contact_phone, address_line1, address_city, address_state, address_zip, subscription_status, subscription_tier)
        VALUES ('QuickFix Mobile', 'quickfix', 'hello@quickfix.com', '770-555-1234', '456 Peachtree Rd', 'Decatur', 'GA', '30030', 'active', 'starter')
    `);

    console.log("🌱 Tenants seeded (system + tether + quickfix)");
};

const getTenantId = async (subdomain: string = 'tether') => {
    const res = await pool.query("SELECT id FROM tenants WHERE subdomain = $1 LIMIT 1", [subdomain]);
    return res.rows[0]?.id;
};

// ==========================================
// 1. USERS (Admins & Employees)
// ==========================================
const createUsersTable = async () => {
    const query = `
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee',
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, username),
        UNIQUE(tenant_id, email)
    );`;
    await pool.query(query);
    console.log("🏗️ Users table created");
};

const seedUsersTable = async () => {
    const systemTenantId = await getTenantId('system');
    const tetherTenantId = await getTenantId('tether');
    const quickfixTenantId = await getTenantId('quickfix');
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10);

    // Superadmin (lives under system tenant)
    await pool.query(`
        INSERT INTO users (tenant_id, username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [systemTenantId, 'David', password, 'David Super', 'david@tether.com', 'superadmin']);

    // Tether: Admin
    await pool.query(`
        INSERT INTO users (tenant_id, username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [tetherTenantId, 'tetherAdmin', password, 'Tether Admin', 'admin@tether.com', 'admin']);

    // Tether: Employee
    await pool.query(`
        INSERT INTO users (tenant_id, username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [tetherTenantId, 'tetherEmployee', password, 'Tether Employee', 'employee@tether.com', 'employee']);

    // QuickFix: Admin
    await pool.query(`
        INSERT INTO users (tenant_id, username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [quickfixTenantId, 'qfAdmin', password, 'QuickFix Admin', 'admin@quickfix.com', 'admin']);

    // QuickFix: Employee
    await pool.query(`
        INSERT INTO users (tenant_id, username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [quickfixTenantId, 'qfEmployee', password, 'QuickFix Employee', 'employee@quickfix.com', 'employee']);

    console.log("🌱 Users seeded (1 superadmin + 2 admins + 2 employees)");
};

// ==========================================
// 2. CLIENTS (The People)
// ==========================================
const createClientsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS clients CASCADE;
    CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        email VARCHAR(100),
        zip_code VARCHAR(10),
        status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Debt'
        notes TEXT,
        last_visit TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Clients table created");
};

const seedClientsTable = async () => {
    const tenantId = await getTenantId();
    await pool.query(`
        INSERT INTO clients (tenant_id, full_name, phone_number, email, zip_code, status, notes, last_visit)
        VALUES ($1, 'John Doe', '404-698-9528', 'john.doe@example.com', '30018', 'Active', 'Prefer text reminders', CURRENT_TIMESTAMP)
    `, [tenantId]);
    console.log("🌱 Clients seeded");
};

// ==========================================
// 3. SUBSCRIPTIONS (Phone & WiFi Plans)
// ==========================================
const createSubscriptionsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS subscriptions CASCADE;
    CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        
        service_type VARCHAR(20) NOT NULL, -- 'Phone' or 'WiFi'
        carrier VARCHAR(50) NOT NULL,      -- 'AT&T', 'Comcast'
        plan_amount DECIMAL(10, 2) NOT NULL,
        payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
        
        status VARCHAR(20) DEFAULT 'Unpaid', -- 'Paid', 'Overdue'
        last_payment_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Subscriptions table created");
};

const seedSubscriptionsTable = async () => {
    const tenantId = await getTenantId();
    const clientRes = await pool.query(
        "SELECT id FROM clients WHERE full_name = 'John Doe' LIMIT 1"
    );
    const clientId = clientRes.rows[0]?.id;

    if (!clientId) {
        console.warn('⚠️ No client found for subscription seed');
        return;
    }

    await pool.query(`
        INSERT INTO subscriptions (tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day)
        VALUES ($1, $2, 'Phone', 'T-Mobile', 50.00, 15)
    `, [tenantId, clientId]);

    await pool.query(`
        INSERT INTO subscriptions (tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day)
        VALUES ($1, $2, 'WiFi', 'Xfinity', 89.99, 1)
    `, [tenantId, clientId]);

    console.log("🌱 Subscriptions seeded (Phone & WiFi for John Doe)");
};

// ==========================================
// 4. PRODUCTS (Inventory)
// ==========================================
const createProductsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS products CASCADE;
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        barcode VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_generic BOOLEAN DEFAULT FALSE,
        price DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2),
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 5,
        properties JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Products table created");
};

const seedProductsTable = async () => {
    const tenantId = await getTenantId();
    // 1. Generic Wallet Case for iPhone 15
    await pool.query(`
        INSERT INTO products 
        (tenant_id, name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
        tenantId,
        'Wallet Case (iPhone 15)',
        'GEN-WAL-IP15',
        'Case', 
        true,
        15.00, 
        3.00, 
        10, 
        '{"brand": "Generic", "compatibility": "iPhone 15", "color": "Black"}'
    ]);

    // 2. Generic Wallet Case for Samsung S24
    await pool.query(`
        INSERT INTO products 
        (tenant_id, name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
        tenantId,
        'Wallet Case (Samsung S24)', 
        'GEN-WAL-S24', 
        'Case', 
        true, 
        15.00, 
        3.00, 
        10, 
        '{"brand": "Generic", "compatibility": "Samsung S24", "color": "Black"}'
    ]);

    // 3. A "True" Brand Name Product (Otterbox)
    await pool.query(`
        INSERT INTO products 
        (tenant_id, name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
        tenantId,
        'Otterbox Defender (iPhone 15)', 
        '840104290001',
        'Case', 
        false,
        59.99, 
        30.00, 
        5, 
        '{"brand": "Otterbox", "compatibility": "iPhone 15", "type": "Rugged"}'
    ]);

    console.log("🌱 Products seeded");
};

// ==========================================
// 5. SALES & ITEMS
// ==========================================
const createSalesTables = async () => {
    // Sales Table
    await pool.query(`
        DROP TABLE IF EXISTS sales CASCADE;
        CREATE TABLE sales (
            id SERIAL PRIMARY KEY,
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id),
            client_id INTEGER REFERENCES clients(id),
            total_amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Sale Items Table
    await pool.query(`
        DROP TABLE IF EXISTS sale_items CASCADE;
        CREATE TABLE sale_items (
            id SERIAL PRIMARY KEY,
            sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price_at_sale DECIMAL(10, 2) NOT NULL
        );
    `);
    console.log("🏗️ Sales tables created");
};

const seedSalesTables = async () => {
    const tenantId = await getTenantId();
    const userRes = await pool.query(
        "SELECT id FROM users WHERE username = 'David' LIMIT 1"
    );
    const clientRes = await pool.query(
        "SELECT id FROM clients WHERE full_name = 'John Doe' LIMIT 1"
    );
    const productRes = await pool.query(
        "SELECT id, price FROM products WHERE barcode = 'GEN-WAL-IP15' LIMIT 1"
    );

    const userId = userRes.rows[0]?.id;
    const clientId = clientRes.rows[0]?.id;
    const productId = productRes.rows[0]?.id;
    const productPrice = productRes.rows[0]?.price;

    if (!userId || !clientId || !productId) {
        console.warn('⚠️ Missing seed data for sales');
        return;
    }

    const saleRes = await pool.query(
        `INSERT INTO sales (tenant_id, user_id, client_id, total_amount, payment_method)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [tenantId, userId, clientId, productPrice, 'Cash']
    );

    const saleId = saleRes.rows[0]?.id;
    if (!saleId) {
        console.warn('⚠️ Failed to seed sale item');
        return;
    }

    await pool.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale)
         VALUES ($1, $2, $3, $4)`,
        [saleId, productId, 1, productPrice]
    );

    console.log('🌱 Sales seeded (1 sale + 1 item)');
};

// ==========================================
// 6. PAYMENT HISTORY (For Subscriptions)
// ==========================================
const createPaymentHistoryTable = async () => {
    const query = `
    DROP TABLE IF EXISTS payment_history CASCADE;
    CREATE TABLE payment_history (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        amount_paid DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_payment_hist_sub_id ON payment_history(subscription_id);
    `;
    await pool.query(query);
    console.log("🏗️ Payment History table created");
};

const seedPaymentHistoryTable = async () => {
    const tenantId = await getTenantId();
    const subscriptionRes = await pool.query(
        "SELECT id FROM subscriptions ORDER BY id ASC LIMIT 1"
    );
    const subscriptionId = subscriptionRes.rows[0]?.id;

    if (!subscriptionId) {
        console.warn('⚠️ No subscription found for payment history seed');
        return;
    }

    await pool.query(
        `INSERT INTO payment_history (tenant_id, subscription_id, amount_paid, status)
         VALUES ($1, $2, $3, $4)`,
        [tenantId, subscriptionId, 50.00, 'Paid']
    );

    console.log('🌱 Payment history seeded');
};

// ==========================================
// 7. REPAIR TICKETS
// ==========================================
const createRepairTicketsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS repair_tickets CASCADE;
    CREATE TABLE repair_tickets (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES clients(id) NOT NULL,
        device_model VARCHAR(100),
        issue_description TEXT,
        status VARCHAR(20) DEFAULT 'Intake',
        estimated_cost DECIMAL(10, 2),
        parts_cost DECIMAL(10, 2) DEFAULT 0,
        labor_cost DECIMAL(10, 2) DEFAULT 0,
        charge_amount DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Repair Tickets table created");
};

const createClientLtvView = async () => {
    const query = `
    DROP VIEW IF EXISTS client_lifetime_value;
    CREATE VIEW client_lifetime_value AS
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
    `;
    await pool.query(query);
    console.log('🏗️ Client lifetime value view created');
};

const seedRepairTicketsTable = async () => {
    const tenantId = await getTenantId();
    const clientRes = await pool.query(
        "SELECT id FROM clients WHERE full_name = 'John Doe' LIMIT 1"
    );
    const clientId = clientRes.rows[0]?.id;

    if (!clientId) {
        console.warn('⚠️ No client found for repair ticket seed');
        return;
    }

    await pool.query(
        `INSERT INTO repair_tickets 
        (tenant_id, client_id, device_model, issue_description, status, estimated_cost, parts_cost, labor_cost, charge_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tenantId, clientId, 'iPhone 12', 'Screen cracked, touch unresponsive', 'In Progress', 149.00, 45.00, 30.00, 149.00]
    );

    console.log('🌱 Repair tickets seeded');
};


// ==========================================
// MAIN RESET FUNCTION
// ==========================================
const reset = async () => {
    try {
        console.log("🚀 Starting Database Reset...");

        // Create Tables (Order Matters!)
        await createTenantsTable();
        await createUsersTable();
        await createClientsTable();
        await createSubscriptionsTable(); // Depends on Clients
        await createProductsTable();
        await createSalesTables();      // Depends on Users, Clients
        await createPaymentHistoryTable(); // Depends on Subscriptions
        await createRepairTicketsTable();  // Depends on Clients
        await createClientLtvView();

        console.log("--------------------------------");

        // Seed Tables
        await seedTenantsTable();
        await seedUsersTable();
        await seedClientsTable();
        await seedSubscriptionsTable();
        await seedProductsTable();
        await seedSalesTables();
        await seedPaymentHistoryTable();
        await seedRepairTicketsTable();

        console.log("✅ Database Reset Complete!");
        
    } catch (err) {
        console.error("⚠️ Database Reset Failed:", err);
    } finally {
        pool.end();
    }
};

reset();