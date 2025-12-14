// NGO Logistics Backend — ESM, TypeScript-ready
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment
dotenv.config();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes (ESM imports — .js extension required)
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import shipmentRoutes from './routes/shipments.js';
import { initShipmentSockets } from './sockets/shipmentSockets.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check (required by spec)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes (per NGOLTechSpec.md)
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shipments', shipmentRoutes);

// Socket.IO (real-time updates — spec requirement)
initShipmentSockets(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`✅ NGO Logistics Backend running on http://localhost:${PORT}`);
});
