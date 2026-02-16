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
// 1. USERS (Admins & Employees)
// ==========================================
const createUsersTable = async () => {
    const query = `
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee',
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Users table created");
};

const seedUsersTable = async () => {
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10);
    await pool.query(`
        INSERT INTO users (username, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
    `, ['David', password, 'Master Admin', 'admin']);
    console.log("🌱 Users seeded (Admin created)");
};

// ==========================================
// 2. CLIENTS (The People)
// ==========================================
const createClientsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS clients CASCADE;
    CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        zip_code VARCHAR(10),
        subscriptions JSONB, -- Store phone/wifi plans as JSON
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Clients table created");
};

const seedClientsTable = async () => {
    // We insert a client and return the ID so we can give them subscriptions later
    await pool.query(`
        INSERT INTO clients (full_name, phone_number, zip_code, subscriptions, notes)
        VALUES ('John Doe', '404-698-9528', '30018', '{"phone": "T-Mobile", "wifi": "Xfinity"}', 'Prefer text reminders')
    `);
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
    // Get John Doe's ID
    const clientRes = await pool.query("SELECT id FROM clients WHERE full_name = 'John Doe' LIMIT 1");
    const clientId = clientRes.rows[0].id;

    // 1. Add a Phone Plan
    await pool.query(`
        INSERT INTO subscriptions (client_id, service_type, carrier, plan_amount, payment_due_day)
        VALUES ($1, 'Phone', 'T-Mobile', 50.00, 15)
    `, [clientId]);

    // 2. Add a WiFi Plan
    await pool.query(`
        INSERT INTO subscriptions (client_id, service_type, carrier, plan_amount, payment_due_day)
        VALUES ($1, 'WiFi', 'Xfinity', 89.99, 1)
    `, [clientId]);

    console.log("🌱 Subscriptions seeded (Phone & WiFi)");
};

// ==========================================
// 4. PRODUCTS (Inventory)
// ==========================================
const createProductsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS products CASCADE;
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
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
    // 1. Generic Wallet Case for iPhone 15
    // We give it a specific internal barcode 'GEN-WAL-IP15'
    await pool.query(`
        INSERT INTO products 
        (name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
        'Wallet Case (iPhone 15)', // Specific Name
        'GEN-WAL-IP15',            // Specific Internal Barcode
        'Case', 
        true,                      // True = "We print the labels"
        15.00, 
        3.00, 
        10, 
        '{"brand": "Generic", "compatibility": "iPhone 15", "color": "Black"}' // JSON Properties
    ]);

    // 2. Generic Wallet Case for Samsung S24
    // Different barcode, different properties
    await pool.query(`
        INSERT INTO products 
        (name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
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
    // This uses the real UPC on the box, so is_generic is FALSE
    await pool.query(`
        INSERT INTO products 
        (name, barcode, category, is_generic, price, cost, stock_quantity, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
        'Otterbox Defender (iPhone 15)', 
        '840104290001', // Real UPC scanned from box
        'Case', 
        false,          // False = "Don't print labels, use the box"
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
            user_id INTEGER REFERENCES users(id),
            client_id INTEGER REFERENCES clients(id), -- Optional: Guest checkout
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

// ==========================================
// 6. PAYMENT HISTORY (For Subscriptions)
// ==========================================
const createPaymentHistoryTable = async () => {
    const query = `
    DROP TABLE IF EXISTS payment_history CASCADE;
    CREATE TABLE payment_history (
        id SERIAL PRIMARY KEY,
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

// ==========================================
// 7. REPAIR TICKETS
// ==========================================
const createRepairTicketsTable = async () => {
    const query = `
    DROP TABLE IF EXISTS repair_tickets CASCADE;
    CREATE TABLE repair_tickets (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) NOT NULL,
        device_model VARCHAR(100),
        issue_description TEXT,
        status VARCHAR(20) DEFAULT 'Intake',
        estimated_cost DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
    );`;
    await pool.query(query);
    console.log("🏗️ Repair Tickets table created");
};


// ==========================================
// MAIN RESET FUNCTION
// ==========================================
const reset = async () => {
    try {
        console.log("🚀 Starting Database Reset...");

        // Create Tables (Order Matters!)
        await createUsersTable();
        await createClientsTable();
        await createSubscriptionsTable(); // Depends on Clients
        await createProductsTable();
        await createSalesTables();      // Depends on Users, Clients
        await createPaymentHistoryTable(); // Depends on Subscriptions
        await createRepairTicketsTable();  // Depends on Clients

        console.log("--------------------------------");

        // Seed Tables
        await seedUsersTable();
        await seedClientsTable();
        await seedSubscriptionsTable();
        await seedProductsTable();

        console.log("✅ Database Reset Complete!");
        
    } catch (err) {
        console.error("⚠️ Database Reset Failed:", err);
    } finally {
        pool.end();
    }
};

reset();