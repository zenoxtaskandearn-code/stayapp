#!/bin/bash

# One-time Server Setup Script
# Run this script as ROOT on a fresh Ubuntu VPS.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Starting Full Server Setup...${NC}"

# 1. Update System
echo -e "${BLUE}1/6 Updating system packages...${NC}"
apt update && apt upgrade -y

# 2. Install Core Tools (Git, Curl)
echo -e "${BLUE}2/6 Installing Git, Curl, Build tools...${NC}"
apt install -y git curl build-essential

# 3. Install Node.js (v20 LTS)
echo -e "${BLUE}3/6 Installing Node.js v20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 4. Install Nginx & MySQL
echo -e "${BLUE}4/6 Installing Nginx & MySQL...${NC}"
apt install -y nginx mysql-server

# Start services
systemctl start nginx
systemctl enable nginx
systemctl start mysql
systemctl enable mysql

# 5. Install PM2 (Global)
echo -e "${BLUE}5/6 Installing PM2 (Global)...${NC}"
npm i -g pm2

# 6. Configure Nginx
echo -e "${BLUE}6/6 Configuring Nginx...${NC}"

# Create Web Directory
mkdir -p /var/www/html/rental-app

# Nginx Config
NGINX_CONF="/etc/nginx/sites-available/rental-app"
cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _; # Replace with your domain or IP

    root /var/www/html/rental-app;
    index index.html;

    # API Proxy (Send requests to Node Backend)
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (React)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable Config
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup Firewall (UFW)
echo "Configuring Firewall..."
ufw allow ssh
ufw allow http
ufw allow https
echo "y" | ufw enable

echo -e "${GREEN}✅ Server Setup Complete! 🎉${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure your database: 'sudo mysql_secure_installation'"
echo "2. Run the deploy script: './deploy.sh'"
