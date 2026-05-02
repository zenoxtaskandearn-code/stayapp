#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Automated Deployment...${NC}"

# 1. Pull latest code
echo -e "${BLUE}📥 Pulling latest code from git...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed! Aborting.${NC}"
    exit 1
fi

# 2. Backend Update & Restart
echo -e "${BLUE}⚙️ Updating Backend...${NC}"
cd server

# Install dependencies
npm install --production

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}⚠️ .env file missing in server directory!${NC}"
    echo "Please copy .env.example to .env and configure it before running."
    exit 1
fi

# Restart or Start PM2 process
echo "Restarting Backend..."
pm2 restart rental-server 2>/dev/null || pm2 start src/app.js --name rental-server

cd ..

# 3. Frontend Update & Build
echo -e "${BLUE}🎨 Building Frontend...${NC}"
cd client

# Install dependencies
npm install

# Build production bundle
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

# Deploy to Nginx directory
echo -e "${BLUE}📦 Deploying to Web Server...${NC}"
# Change this path if your Nginx points to a different folder
sudo cp -r dist/* /var/www/html/rental-app/

cd ..

echo -e "${GREEN}✅ Deployment Successful! 🎉${NC}"
echo -e "${BLUE}Your app is now live.${NC}"
