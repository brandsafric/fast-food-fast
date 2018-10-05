// This file creates the database tables needed
import { Pool, Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import db from './index';


dotenv.config();

let connectionString = '';
if (process.env.NODE_ENV === 'test') {
  connectionString = process.env.TEST_DB_URL;
} else {
  connectionString = process.env.DATABASE_URL;
}

const pool = new Pool({
  connectionString,
});

const client = new Client({
  connectionString,
});
client.connect();

const dropAllTables = 'DROP TABLE IF EXISTS users, orders, food_items, token_blacklist, categories';
const dropAllTypes = 'DROP TYPE IF EXISTS user_role, order_status';

const createRoleEnum = `CREATE TYPE user_role AS ENUM (
  'user', 
  'admin'
)`;

const createStatusEnum = `CREATE TYPE order_status AS ENUM (
  'COMPLETED', 
  'CANCELLED', 
  'PROCESSING',
  'DECLINED',
  'ACCEPTED',
  'NEW'
)`;

const createUsersTable = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role user_role DEFAULT 'user',
  username varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NULL
)`;

const createTokenBlacklistTable = `CREATE TABLE token_blacklist (
  id SERIAL PRIMARY KEY,
  token varchar(255) NULL,
  created_at TIMESTAMP DEFAULT NOW()
)`;

const createCategoriesTable = `CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name varchar(255) UNIQUE NOT NULL,
  description text,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NULL
)`;

const createFoodItemsTable = `CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
  name varchar(255) NOT NULL,
  image varchar(255) NOT NULL,
  description text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NULL
)`;

const createOrdersTable = `CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id integer NOT NULL,
  item_id integer NOT NULL,
  quantity integer NOT NULL,
  total_price integer NOT NULL,
  status order_status DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (customer_id) REFERENCES users (id),
  FOREIGN KEY (item_id) REFERENCES food_items (id)
)`;


const initUser = async () => {
  const password = bcrypt.hashSync('melvine1', 10);
  const params = ['admin', 'Melvine', 'admin.melvine@test.com', password];
  try {
    await db.query(`INSERT INTO users (role, username, email, password)
      VALUES ($1, $2, $3, $4)`, params);
  } catch (error) {
    return error;
  }
};

const initFoodItems = async () => {
  try {
    await db.query(`INSERT INTO food_items (name, image, description, quantity, unit_price)
    VALUES ('Vegetable', 'http://via.placeholder.com/170x170', 'Good', 4, 500)`);
  } catch (error) {
    return error;
  }
};

async function initializeTables() {
  try {
    // drop tables
    await client.query(dropAllTables);
    await client.query(dropAllTypes);

    // create enum types
    await client.query(createRoleEnum);
    await client.query(createStatusEnum);

    // create tables
    await client.query(createUsersTable);
    await client.query(createTokenBlacklistTable);
    await client.query(createCategoriesTable);
    await client.query(createFoodItemsTable);
    await client.query(createOrdersTable);


    if (process.env.NODE_ENV !== 'test') {
      await initUser();
      await initFoodItems();
    }


    client.end();
    console.log('Tables created successfully!');
  } catch (error) {
    console.log(error);
  }
}

initializeTables();
