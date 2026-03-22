#!/bin/bash
# ============================================================
# KaryaSetu — AWS EC2 Setup Script
# Run this on fresh Ubuntu 22.04 EC2 instance
# Usage: bash deploy.sh
# ============================================================

set -e
echo "🚀 KaryaSetu AWS Setup Starting..."

# ── 1. System update ────────────────────────────────────────
echo "📦 Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Node.js 18 ───────────────────────────────────────────
echo "⚙️  Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v

# ── 3. PM2 (process manager) ────────────────────────────────
echo "⚙️  Installing PM2..."
sudo npm install -g pm2

# ── 4. Nginx ────────────────────────────────────────────────
echo "🌐 Installing Nginx..."
sudo apt-get install -y nginx

# ── 5. Clone from GitHub ────────────────────────────────────
echo "📥 Cloning KaryaSetu..."
cd /home/ubuntu
git clone https://github.com/TUMHARA_USERNAME/karyasetu.git
cd karyasetu

# ── 6. Backend setup ────────────────────────────────────────
echo "🔧 Setting up backend..."
cd backend
npm install --production
cp .env.example .env
echo ""
echo "⚠️  IMPORTANT: Edit /home/ubuntu/karyasetu/backend/.env"
echo "   Fill in: MONGODB_URI, JWT_SECRET, SMTP credentials, etc."
echo ""

# ── 7. Frontend build ───────────────────────────────────────
echo "🏗️  Building frontend..."
cd ../frontend
npm install
# Set API URL to same server
echo "REACT_APP_API_URL=/api" > .env.production
npm run build
echo "✅ Frontend build complete"

# ── 8. Nginx config ─────────────────────────────────────────
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/karyasetu > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    # Frontend (React build)
    root /home/ubuntu/karyasetu/frontend/build;
    index index.html;

    # Frontend routes — serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
    }

    # Uploaded files
    location /uploads/ {
        alias /home/ubuntu/karyasetu/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    client_max_body_size 25M;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/karyasetu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx
echo "✅ Nginx configured"

# ── 9. PM2 start backend ────────────────────────────────────
echo "🚀 Starting backend with PM2..."
cd /home/ubuntu/karyasetu/backend
pm2 start src/server.js --name "karyasetu-api" --env production
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

echo ""
echo "============================================"
echo "✅ KaryaSetu deployed!"
echo ""
echo "👉 NEXT STEPS:"
echo "   1. Edit .env: nano /home/ubuntu/karyasetu/backend/.env"
echo "   2. Restart API: pm2 restart karyasetu-api"
echo "   3. Check logs: pm2 logs karyasetu-api"
echo "   4. Open browser: http://$(curl -s ifconfig.me)"
echo "============================================"
