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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "App directory: $APP_DIR"
echo "Deploy directory: $SCRIPT_DIR"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
apt-get update
apt-get install -y docker.io docker-compose certbot curl

# Enable Docker
systemctl enable docker
systemctl start docker

echo -e "${YELLOW}Step 2: Setting up SSL certificate...${NC}"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    # Stop any service on port 80
    docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down 2>/dev/null || true
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo -e "${YELLOW}Step 3: Setting up environment...${NC}"
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create $SCRIPT_DIR/.env from .env.example"
    echo ""
    echo "Example:"
    echo "  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
    echo "  nano $SCRIPT_DIR/.env"
    exit 1
fi

# Validate required env vars
source "$SCRIPT_DIR/.env"
if [ -z "$JWT_SECRET" ] || [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${RED}ERROR: JWT_SECRET must be at least 32 characters${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 4: Building and starting containers...${NC}"
cd "$SCRIPT_DIR"
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo -e "${YELLOW}Step 5: Waiting for services to start...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}Step 6: Running health checks...${NC}"

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is healthy${NC}"
else
    echo -e "${RED}✗ MongoDB health check failed${NC}"
fi

# Check Backend
if curl -sf http://localhost:9000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Checking logs..."
    docker-compose logs --tail=20 backend
fi

# Check Frontend
if curl -sf http://localhost:9001 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    echo "Checking logs..."
    docker-compose logs --tail=20 frontend
fi

# Check Nginx
if curl -sf -k https://localhost > /dev/null 2>&1 || curl -sf http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Nginx is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Nginx may need SSL certificate${NC}"
fi

echo -e "${YELLOW}Step 7: Setting up SSL auto-renewal...${NC}"
# Add cron job for SSL renewal
CRON_CMD="0 3 * * * certbot renew --quiet --deploy-hook 'docker restart sellx-nginx'"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your application should be available at:"
echo "  https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  cd $SCRIPT_DIR"
echo "  docker-compose logs -f          # View all logs"
echo "  docker-compose logs -f backend  # View backend logs"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose down             # Stop services"
echo "  docker-compose ps               # Check status"
echo ""
