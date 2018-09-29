import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();


let connectionString;
if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.TEST_DB_NAME}`;
} else {
  connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}`;
}

const pool = new Pool({ connectionString });

export default {
  async query(text, params) {
    const res = await pool.query(text, params);
    return res;
  },
};