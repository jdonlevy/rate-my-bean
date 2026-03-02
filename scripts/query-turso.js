import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing DATABASE_URL or DATABASE_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

const sql = process.argv[2] || "SELECT 1";

try {
  const result = await db.execute(sql);
  console.log(JSON.stringify(result.rows, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
}
