#!/usr/bin/env node

require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import models
const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const Transport = require('../models/Transport');

// Connect to FerretDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.FERRETDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to FerretDB for migration');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Create indexes for better performance
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ organization: 1 });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    
    // Warehouse indexes
    await Warehouse.collection.createIndex({ coordinates: '2dsphere' });
    await Warehouse.collection.createIndex({ organization: 1 });
    await Warehouse.collection.createIndex({ isActive: 1 });
    
    // Inventory indexes
    await Inventory.collection.createIndex({ warehouse: 1 });
    await Inventory.collection.createIndex({ description: 1 });
    await Inventory.collection.createIndex({ coordinates: '2dsphere' });
    await Inventory.collection.createIndex({ status: 1 });
    await Inventory.collection.createIndex({ organization: 1 });
    await Inventory.collection.createIndex({ warehouse: 1, description: 1 });
    
    // Shipment indexes
    await Shipment.collection.createIndex({ shipmentId: 1 }, { unique: true });
    await Shipment.collection.createIndex({ coordinates: '2dsphere' });
    await Shipment.collection.createIndex({ currentLocation: '2dsphere' });
    await Shipment.collection.createIndex({ status: 1 });
    await Shipment.collection.createIndex({ priority: 1 });
    await Shipment.collection.createIndex({ source: 1 });
    await Shipment.collection.createIndex({ organization: 1 });
    await Shipment.collection.createIndex({ status: 1, priority: 1 });
    await Shipment.collection.createIndex({ estimatedDeliveryDate: 1 });
    
    // Transport indexes
    await Transport.collection.createIndex({ organization: 1 });
    await Transport.collection.createIndex({ availability: 1 });
    
    console.log('✅ Database indexes created successfully');
    return true;
  } catch (error) {
    console.error('Error creating indexes:', error);
    return false;
  }
};

// Create migration directory and logs
const setupMigrationEnvironment = async () => {
  try {
    const migrationDir = path.join(__dirname, '..', 'migrations');
    await fs.mkdir(migrationDir, { recursive: true });
    
    const logsDir = path.join(__dirname, '..', 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    console.log('Migration environment setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up migration environment:', error);
    return false;
  }
};

// Validate database structure
const validateDatabase = async () => {
  try {
    console.log('Validating database structure...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Check required collections
    const requiredCollections = ['users', 'warehouses', 'inventories', 'shipments', 'transports'];
    const missingCollections = requiredCollections.filter(
      col => !collections.some(c => c.name === col)
    );
    
    if (missingCollections.length > 0) {
      console.warn(`Missing collections: ${missingCollections.join(', ')}`);
      console.log('Some collections may be created during seeding');
    } else {
      console.log('✅ All required collections exist');
    }
    
    // Get collection counts
    for (const collection of requiredCollections) {
      try {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        console.log(`  ${collection}: ${count} documents`);
      } catch (error) {
        console.log(`  ${collection}: does not exist yet`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating database:', error);
    return false;
  }
};

// Run database migrations
const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    
    // Migration 1: Add organization field to all documents if missing
    console.log('Migration 1: Ensuring organization field exists...');
    
    // Get default organization (create if doesn't exist)
    let defaultOrg = await mongoose.connection.db.collection('organizations').findOne({});
    if (!defaultOrg) {
      defaultOrg = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Default Organization',
        code: 'DEFAULT',
        contactEmail: 'contact@default.org',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await mongoose.connection.db.collection('organizations').insertOne(defaultOrg);
      console.log('  Created default organization');
    }
    
    // Update users without organization
    const userUpdateResult = await User.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: defaultOrg._id } }
    );
    if (userUpdateResult.modifiedCount > 0) {
      console.log(`  Updated ${userUpdateResult.modifiedCount} users with organization`);
    }
    
    // Update warehouses without organization
    const warehouseUpdateResult = await Warehouse.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: defaultOrg._id } }
    );
    if (warehouseUpdateResult.modifiedCount > 0) {
      console.log(`  Updated ${warehouseUpdateResult.modifiedCount} warehouses with organization`);
    }
    
    // Update inventory without organization
    const inventoryUpdateResult = await Inventory.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: defaultOrg._id } }
    );
    if (inventoryUpdateResult.modifiedCount > 0) {
      console.log(`  Updated ${inventoryUpdateResult.modifiedCount} inventory items with organization`);
    }
    
    // Update shipments without organization
    const shipmentUpdateResult = await Shipment.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: defaultOrg._id } }
    );
    if (shipmentUpdateResult.modifiedCount > 0) {
      console.log(`  Updated ${shipmentUpdateResult.modifiedCount} shipments with organization`);
    }
    
    // Update transport without organization
    const transportUpdateResult = await Transport.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: defaultOrg._id } }
    );
    if (transportUpdateResult.modifiedCount > 0) {
      console.log(`  Updated ${transportUpdateResult.modifiedCount} transport providers with organization`);
    }
    
    // Migration 2: Ensure required fields have defaults
    console.log('Migration 2: Setting default values for required fields...');
    
    // Set default status for active documents
    const statusUpdates = await Promise.all([
      User.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } }),
      Warehouse.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } }),
      Inventory.updateMany({ status: { $exists: false } }, { $set: { status: 'available' } }),
      Shipment.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } }),
      Transport.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } }),
    ]);
    
    console.log('  Default values set for all collections');
    
    // Migration 3: Create geospatial indexes if they don't exist
    console.log('Migration 3: Verifying geospatial indexes...');
    
    const indexes = await Warehouse.collection.indexes();
    const hasGeospatialIndex = indexes.some(index => 
      index.key && index.key.coordinates === '2dsphere'
    );
    
    if (!hasGeospatialIndex) {
      console.log('  Creating geospatial indexes...');
      await createIndexes();
    } else {
      console.log('  Geospatial indexes already exist');
    }
    
    console.log('✅ All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
};

// Main migration function
const runDatabaseMigration = async () => {
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Step 1: Connect to database
    const connected = await connectDB();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    // Step 2: Setup environment
    await setupMigrationEnvironment();
    
    // Step 3: Validate current state
    await validateDatabase();
    
    // Step 4: Run migrations
    const migrationSuccess = await runMigrations();
    if (!migrationSuccess) {
      throw new Error('Migrations failed');
    }
    
    // Step 5: Final validation
    console.log('\n🔍 Final validation...');
    await validateDatabase();
    
    console.log('\n✅ Database migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run npm run seed to populate the database with sample data');
    console.log('2. Start the application with npm run dev');
    console.log('3. Access the application at http://localhost:5173');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the migration
runDatabaseMigration();
