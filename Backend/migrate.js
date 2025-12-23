#!/usr/bin/env node
// ~/Dev/NGOL-D/Backend/migrate.js
// Auto-migrate schema.sql on startup (idempotent)

const fs = require('fs').promises;
const { createConnection } = require('mysql2/promise');

async function migrate() {
  const conn = await createConnection({
    host: process.env.MARIADB_HOST || '127.0.0.1',
    port: process.env.MARIADB_PORT || 3306,
    user: process.env.MARIADB_USER || 'ngol',
    password: process.env.MARIADB_PASSWORD || 'ngol',
    database: process.env.MARIADB_DATABASE || 'NGOL_D',
    multipleStatements: true,
  });

  try {
    // Create DB if not exists (idempotent)
    await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.MARIADB_DATABASE || 'NGOL_D'}\``);
    await conn.execute(`USE \`${process.env.MARIADB_DATABASE || 'NGOL_D'}\``);

    // Read & run schema.sql (idempotent DDL)
    const schema = await fs.readFile('./schema.sql', 'utf8');
    await conn.query(schema);
    console.log('✅ Schema migrated (idempotent)');

    // Optional: record version
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const [rows] = await conn.execute("SELECT COUNT(*) AS c FROM _migrations WHERE name = 'initial'");
    if (rows[0].c === 0) {
      await conn.execute("INSERT INTO _migrations (name) VALUES ('initial')");
      console.log('✅ Migration recorded');
    }
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrate().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
}
