#!/usr/bin/env node
// NGOL-D Auto-Seeder (MariaDB-only, idempotent)
// Usage: MARIADB_* env vars required → set by CI or dev shell

const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

// Config from env (CI sets these via services)
const config = {
  host: process.env.MARIADB_HOST || '127.0.0.1',
  port: parseInt(process.env.MARIADB_PORT || '3306'),
  user: process.env.MARIADB_USER || 'ngol',
  password: process.env.MARIADB_PASSWORD || 'ngol',
  database: process.env.MARIADB_DATABASE || 'ngol_dev'
};

async function seed() {
  console.log('🌱 Seeding NGOL-D test users...');

  let conn;
  try {
    conn = await mariadb.createConnection(config);
    
    // Ensure users table exists (matches your models/User.js)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        second_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        organisation VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Hash password (cost 10 = matches bcryptjs default)
    const passwordHash = await bcrypt.hash('password123', 10);

    // Upsert admin user (idempotent)
    const admin = {
      id: 1,
      first_name: 'Admin',
      second_name: 'User',
      email: 'admin@example.org',
      organisation: 'NGO Logistics',
      role: 'admin',
      password_hash: passwordHash
    };

    await conn.query(`
      INSERT INTO users (id, first_name, second_name, email, organisation, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        second_name = VALUES(second_name),
        email = VALUES(email),
        organisation = VALUES(organisation),
        role = VALUES(role),
        password_hash = VALUES(password_hash)
    `, [
      admin.id,
      admin.first_name,
      admin.second_name,
      admin.email,
      admin.organisation,
      admin.role,
      admin.password_hash
    ]);

    console.log('✅ Seeded: admin@example.org (password123)');
  } catch (err) {
    console.error('❌ Seeder failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();
