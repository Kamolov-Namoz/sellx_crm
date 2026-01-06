# ProSell Production Deployment Guide

## Domain: prosell.prox.uz

## Tez boshlash (Quick Start)

### 1. VPS ga ulanish
```bash
ssh root@your-vps-ip
```

### 2. Loyihani yuklash
```bash
cd /opt
git clone your-repo-url prosell
cd prosell/deploy
```

### 3. Environment sozlash
```bash
cp .env.example .env
nano .env
```

`.env` faylida quyidagilarni o'zgartiring:
- `MONGO_ROOT_PASSWORD` - MongoDB root paroli
- `MONGO_PASSWORD` - MongoDB app paroli  
- `JWT_SECRET` - JWT secret key (64+ belgi)

JWT secret yaratish:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Deploy qilish
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## Manual Deployment (Docker siz)

### 1. Node.js o'rnatish
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. MongoDB o'rnatish
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. PM2 o'rnatish
```bash
sudo npm install -g pm2
```

### 4. Backend sozlash
```bash
cd /opt/prosell/backend
npm ci --only=production
npm run build

# .env.production ni .env ga nusxalash
cp .env.production .env
nano .env  # O'zgaruvchilarni to'ldiring

# PM2 bilan ishga tushirish
pm2 start dist/index.js --name prosell-backend
pm2 save
```

### 5. Frontend sozlash
```bash
cd /opt/prosell/frontend
npm ci
npm run build

# PM2 bilan ishga tushirish
pm2 start npm --name prosell-frontend -- start
pm2 save
```

### 6. PM2 startup
```bash
pm2 startup
pm2 save
```

### 7. Nginx sozlash
```bash
sudo cp /opt/prosell/deploy/nginx.conf /etc/nginx/sites-available/prosell
sudo ln -s /etc/nginx/sites-available/prosell /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL sertifikat
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d prosell.prox.uz
```

---

## Foydali buyruqlar

### Loglarni ko'rish
```bash
# Docker
docker-compose logs -f

# PM2
pm2 logs
```

### Servislarni qayta ishga tushirish
```bash
# Docker
docker-compose restart

# PM2
pm2 restart all
```

### Database backup
```bash
# Docker
docker exec prosell-mongodb mongodump --out /backup

# Local
mongodump --db sales-automation --out /backup
```

### Database restore
```bash
mongorestore --db sales-automation /backup/sales-automation
```

---

## Xavfsizlik tekshiruvi

- [ ] JWT_SECRET kamida 64 belgi
- [ ] MongoDB parollari kuchli
- [ ] CORS faqat prosell.prox.uz ga ruxsat
- [ ] SSL sertifikat o'rnatilgan
- [ ] Firewall sozlangan (80, 443 portlar ochiq)

---

## Muammolarni hal qilish

### Backend ishlamayapti
```bash
# Loglarni tekshiring
pm2 logs prosell-backend
# yoki
docker-compose logs backend
```

### MongoDB ulanish xatosi
```bash
# MongoDB ishlayaptimi?
sudo systemctl status mongod

# Connection string to'g'rimi?
mongosh "mongodb://localhost:27017/sales-automation"
```

### SSL xatosi
```bash
# Sertifikatni yangilash
sudo certbot renew --dry-run
```
