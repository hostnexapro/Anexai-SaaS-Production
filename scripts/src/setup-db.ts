import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const { rows: before } = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log("Existing tables:", before.map((r: any) => r.table_name).join(", ") || "(none)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS nexa_projects (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        prompt TEXT NOT NULL,
        tech_stack TEXT NOT NULL DEFAULT 'React',
        files JSONB NOT NULL DEFAULT '[]',
        github_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✓ nexa_projects table ready");

    await client.query(`
      CREATE TABLE IF NOT EXISTS nexa_settings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✓ nexa_settings table ready");

    const { rows: after } = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log("All tables:", after.map((r: any) => r.table_name).join(", "));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
