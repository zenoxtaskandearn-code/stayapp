#!/bin/bash

# ==========================================
# 🚀 StayApp Automated Deployment Script
# ==========================================
# 1. Push this file to GitHub
# 2. Run: ./deploy.sh on your VPS
# ==========================================

# --- CONFIGURATION START ---
DOMAIN="theblueground-rental-property.ref37108542.online"
DB_PASSWORD="SecurePass123!"
EMAIL_USER="info@rented-theblueground.com"
EMAIL_PASS='muie1985A"'
SMTP_HOST="mail.privateemail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
CLOUDINARY_NAME="dyeqav5do"
CLOUDINARY_KEY="452973666565658"
CLOUDINARY_SECRET="6qO_Ai6QEbLhhRF3HQBqtppKfhk"
# --- CONFIGURATION END ---

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo -e "\n${BLUE}🚀 Starting Automated Deployment for ${DOMAIN}...${NC}\n"

# 0. Ensure Script has correct line endings (Fixes Windows CRLF issues)
if [[ -n $(head -1 "$0" | tr -d '\r' | grep -c 'bash$') ]]; then
  log_info "Fixing line endings..."
  sed -i 's/\r$//' "$0"
fi

# 1. Pull Code (Force overwrite local conflicts)
log_info "Pulling latest code..."
git stash --include-untracked 2>/dev/null
git pull origin main
if [ $? -ne 0 ]; then
  log_error "Git pull failed!"
fi

# 2. Backend Setup
log_info "Configuring Backend..."
cat > server/.env << EOF
PORT=5001
NODE_ENV=production
DB_HOST=localhost
DB_USER=rental_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=rental_property
DB_PORT=3306
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=30d
CLIENT_URL=http://${DOMAIN}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=Blueground <${EMAIL_USER}>
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=${SMTP_SECURE}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_SECRET}
EOF
log_success "Created server/.env"

cd server
log_info "Installing Backend dependencies..."
rm -rf node_modules package-lock.json
npm install --omit=dev --quiet

log_info "Checking Database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS rental_property;" 2>/dev/null
mysql -u root -e "CREATE USER IF NOT EXISTS 'rental_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL PRIVILEGES ON rental_property.* TO 'rental_user'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null

# Run Seed if 'users' table is missing
mysql -u rental_user -p"${DB_PASSWORD}" rental_property -e "SELECT 1 FROM users LIMIT 1;" 2>/dev/null || {
    log_info "Database tables not found. Running seed..."
    npm run seed
}

log_info "Starting Backend via PM2..."
pm2 start src/app.js --name rental-server --silent 2>/dev/null || pm2 restart rental-server
pm2 save > /dev/null
cd ..

# 3. Frontend Setup
log_info "Building Frontend..."
cd client
# Fix API URL to use relative path for Nginx
sed -i "s|baseURL:.*|baseURL: '/api',|" src/services/api.js 2>/dev/null || true
npm install --quiet
npm run build
if [ $? -ne 0 ]; then
  log_error "Frontend build failed!"
fi
log_success "Frontend build complete"

log_info "Deploying to Web Server..."
sudo mkdir -p /var/www/html/rental-app
sudo rm -rf /var/www/html/rental-app/*
sudo cp -r dist/* /var/www/html/rental-app/
cd ..

# 4. Nginx Configuration
log_info "Configuring Nginx for ${DOMAIN}..."

# Ensure Nginx is running
sudo systemctl start nginx 2>/dev/null
sudo systemctl enable nginx 2>/dev/null

sudo tee /etc/nginx/sites-available/rental-app > /dev/null << EOF
server {
    listen 80;
    listen 443 ssl;
    server_name ${DOMAIN};
    root /var/www/html/rental-app;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/rental-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t || true
sudo systemctl reload nginx || sudo systemctl restart nginx
log_success "Nginx configured with SSL and reloaded"

# 5. Firewall
sudo ufw allow 80/tcp > /dev/null 2>&1
sudo ufw allow 443/tcp > /dev/null 2>&1

echo -e "\n${GREEN}╔══════════════════════════════════════════╗"
echo -e "║          ✅ DEPLOYMENT SUCCESSFUL!         ║"
echo -e "╚══════════════════════════════════════════╝${NC}"
echo -e "🌐 Access: ${BLUE}https://${DOMAIN}${NC}\n"
