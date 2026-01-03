#!/bin/bash

# ===========================================
# SellX Deployment Script
# Domain: sellx.prox.uz
# ===========================================

set -e

echo "🚀 SellX Deployment Script"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Variables
DOMAIN="sellx.prox.uz"
APP_DIR="/opt/sellx"
DEPLOY_DIR="$APP_DIR/deploy"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
apt-get update
apt-get install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Enable Docker
systemctl enable docker
systemctl start docker

echo -e "${YELLOW}Step 2: Creating application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo -e "${YELLOW}Step 3: Setting up SSL certificate...${NC}"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo -e "${YELLOW}Step 4: Copying Nginx configuration...${NC}"
cp $DEPLOY_DIR/nginx.conf /etc/nginx/sites-available/sellx
ln -sf /etc/nginx/sites-available/sellx /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${YELLOW}Step 5: Setting up environment...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create $DEPLOY_DIR/.env from .env.example"
    exit 1
fi

echo -e "${YELLOW}Step 6: Building and starting containers...${NC}"
cd $DEPLOY_DIR
docker-compose down --remove-orphans || true
docker-compose build --no-cache
docker-compose up -d

echo -e "${YELLOW}Step 7: Waiting for services to start...${NC}"
sleep 10

# Health check
echo -e "${YELLOW}Step 8: Running health checks...${NC}"
if curl -s http://localhost:5000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

echo -e "${YELLOW}Step 9: Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your application is now available at:"
echo "  https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose down             # Stop services"
echo ""
