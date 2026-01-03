# SellX CRM

Sales Automation PWA - Mijozlarni boshqarish va follow-up eslatmalar tizimi.

## 🚀 Xususiyatlar

- 📱 PWA (Progressive Web App) - telefondan o'rnatish mumkin
- 👥 Mijozlarni boshqarish (CRUD)
- 📅 Follow-up eslatmalar va bildirishnomalar
- 💬 Mijoz bilan suhbat tarixi (matn, audio, rasm, video)
- 🗺️ Xaritadan manzil tanlash
- 📍 GPS orqali joylashuvni aniqlash
- 🔔 Push notifications
- 📴 Offline rejim qo'llab-quvvatlash
- 🔐 JWT autentifikatsiya

## 🛠️ Texnologiyalar

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (xarita)
- PWA

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication
- Firebase (push notifications)

## 📦 O'rnatish

### Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Production

```bash
cd deploy
cp .env.example .env
# .env faylini to'ldiring
chmod +x deploy.sh
sudo ./deploy.sh
```

## 🌐 Demo

**URL:** https://sellx.prox.uz

## 📁 Loyiha strukturasi

```
sellx_crm/
├── backend/           # Express.js API
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── uploads/
├── frontend/          # Next.js PWA
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── services/
│       └── types/
└── deploy/            # Deployment files
    ├── docker-compose.yml
    ├── nginx.conf
    └── deploy.sh
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish

### Clients
- `GET /api/clients` - Barcha mijozlar
- `GET /api/clients/:id` - Bitta mijoz
- `POST /api/clients` - Yangi mijoz
- `PUT /api/clients/:id` - Mijozni yangilash
- `DELETE /api/clients/:id` - Mijozni o'chirish
- `GET /api/clients/stats` - Statistika

### Conversations
- `GET /api/conversations/:clientId` - Suhbatlar
- `POST /api/conversations` - Yangi suhbat
- `DELETE /api/conversations/:id` - O'chirish

### Upload
- `POST /api/upload` - Fayl yuklash

## 🔒 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://sellx.prox.uz
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://sellx.prox.uz/api
```

## 📄 Litsenziya

MIT License

## 👨‍💻 Muallif

SellX Team
