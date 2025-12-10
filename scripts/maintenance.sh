#!/bin/bash
echo "🔧 NGO Logistics Maintenance"
echo "1. Backup database"
sqlite-manage backup
echo "2. Check system health"
curl -s http://localhost:3000/api/health | jq .
echo "3. View recent logs"
tail -20 ~/.pm2/logs/ngo-logistics-out.log
