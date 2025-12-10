#!/bin/bash

# NGO Logistics Management System - SQLite Database Startup Script

echo "Starting SQLite Database for NGO Logistics Management System..."

# Create data directory if it doesn't exist
mkdir -p Backend/data

# Check if database exists
if [ ! -f "Backend/data/ngologistics.db" ]; then
    echo "Database not found. Initializing new database..."
    cd Backend
    npm run init-db
    cd ..
else
    echo "Existing database found."
fi

echo ""
echo "================================================"
echo "📊 SQLite Database is ready"
echo "Database path: Backend/data/ngologistics.db"
echo "================================================"
echo "You can interact with the database using:"
echo "sqlite3 Backend/data/ngologistics.db"
echo "================================================"
