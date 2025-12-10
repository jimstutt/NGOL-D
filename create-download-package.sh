#!/bin/bash

# NGO Logistics Management System - Complete Package Creator
echo "Creating complete NGO Logistics Management System package..."

# Create temporary directory
PACKAGE_DIR="NGOLogisticsD-complete"
ZIP_FILE="NGOLogisticsD-complete.zip"

# Clean up any existing package
rm -rf "$PACKAGE_DIR"
rm -f "$ZIP_FILE"

echo "📦 Creating directory structure..."
mkdir -p "$PACKAGE_DIR/Backend/config"
mkdir -p "$PACKAGE_DIR/Backend/middleware"
mkdir -p "$PACKAGE_DIR/Backend/models"
mkdir -p "$PACKAGE_DIR/Backend/routes"
mkdir -p "$PACKAGE_DIR/Backend/sockets"
mkdir -p "$PACKAGE_DIR/App/src/views"
mkdir -p "$PACKAGE_DIR/App/src/components"
mkdir -p "$PACKAGE_DIR/App/src/stores"
mkdir -p "$PACKAGE_DIR/App/src/router"
mkdir -p "$PACKAGE_DIR/App/src/layouts"
mkdir -p "$PACKAGE_DIR/App/src/styles"
mkdir -p "$PACKAGE_DIR/App/public"

echo "🚀 Adding all 16 files plus Dashboard.vue..."

# 1. README.md
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# NGO Logistics Management System

A comprehensive web-based logistics management platform designed specifically for humanitarian organizations operating in Less Developed Countries (LDCs). The system provides real-time tracking of shipments, inventory management, and supply chain coordination capabilities.

## Key Features

- **Real-time Shipment Tracking**: Interactive Google Maps integration with live status updates
- **Inventory Management**: Multi-warehouse inventory tracking with geographic visualization
- **User Management**: Role-based access control with organization segregation
- **Analytics & Reporting**: Performance metrics and risk assessment tools
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Stock Validation**: Prevents shipments exceeding available quantities
- **Real-time Updates**: Socket.IO for live inventory and shipment updates

## Technology Stack

### Frontend
- Vue.js 3.5.21 with Composition API
- Vite 4.5.14 build tool
- Bootstrap 5 for responsive UI
- Google Maps JavaScript API
- Chart.js for analytics
- Socket.IO Client for real-time updates

### Backend
- Node.js with Express.js 4.18.2
- SQLite database
- JWT for authentication
- Socket.IO for real-time updates
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js 14.0 or higher
- SQLite3
- Google Maps API key

### Installation
See [INSTALL.md](INSTALL.md) for detailed setup instructions.

### Development
1. Start the backend server:
```bash
cd Backend
npm install
npm run dev
