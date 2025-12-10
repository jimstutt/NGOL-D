# NGOLogisticsD/INSTALL.md

# Installation Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 14.0 or higher
- **SQLite3**: Version 3.31 or higher
- **npm**: Version 6.0 or higher
- **Google Maps API Key**: With Maps JavaScript API enabled

### Required Accounts
- Google Cloud Platform account for Maps API
- (Optional) Cloud database service account

## Platform-Specific Installation

### Linux Installation

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install SQLite3
sudo apt-get install sqlite3

# Verify installation
node --version
npm --version
sqlite3 --version

## Prerequisites

### System Requirements
- **Node.js**: Version 14.0 or higher
- **MongoDB**: Version 4.4 or higher
- **npm**: Version 6.0 or higher
- **Google Maps API Key**: With Maps JavaScript API enabled

### Required Accounts
- Google Cloud Platform account for Maps API
- MongoDB Atlas account (optional, for cloud database)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NGOLogisticsD
