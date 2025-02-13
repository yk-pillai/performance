import { Pool } from "pg";

const pool = new Pool({
  user: "yk", // Database username
  host: "db", // DB service name in docker-compose
  database: "performance", // Database name
  password: "postgresql", // DB password
  port: 5432,
});

export default pool
