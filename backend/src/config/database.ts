import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
};

export const pool = new pg.Pool(config);
