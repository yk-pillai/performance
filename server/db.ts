import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER, // Database username
  host: process.env.POSTGRES_HOST, // DB service name in docker-compose
  database: process.env.POSTGRES_DB, // Database name
  password: process.env.POSTGRES_PASS, // DB password
  port: parseInt(<string>process.env.POSTGRES_PORT),
  // ssl: true
});

export default pool;
