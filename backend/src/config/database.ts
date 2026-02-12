import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment from repository root (one level above `backend`)
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  ssl: false,
};

export const pool = new pg.Pool(config);
