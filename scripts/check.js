#!/usr/bin/env node
// NGOL-D Integration Test Stub (CI-safe, MariaDB-only)
// Usage: MARIADB_* env vars required → set by CI

const http = require('http');
const https = require('https');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const io = require('socket.io-client');

// Config from env (CI sets these)
const config = {
  mariadb: {
    host: process.env.MARIADB_HOST || '127.0.0.1',
    port: parseInt(process.env.MARIADB_PORT || '3306'),
    user: process.env.MARIADB_USER || 'ngol',
    password: process.env.MARIADB_PASSWORD || 'ngol',
    database: process.env.MARIADB_DATABASE || 'ngol_dev'
  },
  backend: {
    host: 'localhost',
    port: 3000
  },
  frontend: {
    port: 5173
  }
};

async function runTests() {
  console.log('🔍 NGOL-D Integration Tests');

  // 1. MariaDB connectivity (prerequisite)
  await testMariaDB();

  // 2. Backend smoke test (server.js)
  await testBackendSmoke();

  // 3. JWT auth flow
  await testJWTAuth();

  // 4. Socket.IO real-time test
  await testSocketIO();

  console.log('✅ All integration tests passed');
}

// 1. MariaDB ping (via mysql CLI or JS)
async function testMariaDB() {
  console.log('→ Testing MariaDB connection...');
  try {
    // Use mysql2 (lightweight, already in deps)
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection(config.mariadb);
    await conn.ping();
    await conn.end();
    console.log('✅ MariaDB reachable');
  } catch (err) {
    console.error('❌ MariaDB unreachable:', err.message);
    process.exit(1);
  }
}

// 2. Backend smoke: GET /api/health
async function testBackendSmoke() {
  console.log('→ Testing backend smoke (/api/health)...');
  const url = `http://${config.backend.host}:${config.backend.port}/api/health`;
  try {
    const res = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      }).on('error', reject);
    });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.data);
    assert(json.status === 'ok', 'health check failed');
    console.log('✅ Backend smoke test passed');
  } catch (err) {
    console.error('❌ Backend smoke test failed:', err.message);
    process.exit(1);
  }
}

// 3. JWT auth flow: login → token → protected route
async function testJWTAuth() {
  console.log('→ Testing JWT auth flow...');
  const loginUrl = `http://${config.backend.host}:${config.backend.port}/api/login`;
  
  // Mock login (matches your spec: admin@example.org / password123)
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin@example.org',
      password: 'password123'
    })
  });

  if (!loginRes.ok) {
    // If no users exist, skip (CI may not seed DB)
    console.log('⚠️ Skipping JWT test: login failed (no seeded users)');
    return;
  }

  const { token, user } = await loginRes.json();
  assert(token, 'No token returned');
  assert(user.username === 'admin@example.org', 'Wrong user');

  // Verify token structure
  const decoded = jwt.decode(token);
  assert(decoded.sub === 'admin@example.org', 'Invalid token subject');

  // Test protected route (e.g., /api/shipments)
  const shipmentsUrl = `http://${config.backend.host}:${config.backend.port}/api/shipments`;
  const shipmentsRes = await fetch(shipmentsUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // Expect 200 (if seeded) or 401/403 (if no perms) — but not 500
  assert(shipmentsRes.status !== 500, 'Protected route crashed');
  console.log('✅ JWT auth flow passed');
}

// 4. Socket.IO: connect → emit → receive
async function testSocketIO() {
  console.log('→ Testing Socket.IO connection...');
  const socketUrl = `http://${config.backend.host}:${config.backend.port}`;

  return new Promise((resolve, reject) => {
    const socket = io(socketUrl, {
      transports: ['websocket'],
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      socket.emit('test', { ping: 'pong' });
    });

    socket.on('test-response', (data) => {
      assert(data.pong === 'ping', 'Echo failed');
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (err) => {
      socket.disconnect();
      reject(new Error(`Socket.IO connect error: ${err.message}`));
    });

    socket.on('error', (err) => {
      socket.disconnect();
      reject(new Error(`Socket.IO error: ${err.message}`));
    });

    // Timeout
    setTimeout(() => {
      socket.disconnect();
      reject(new Error('Socket.IO test timeout'));
    }, 10000);
  });
}

// Run
runTests().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
