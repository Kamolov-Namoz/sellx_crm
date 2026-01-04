# SellX CRM + PM

Savdogarlar uchun CRM + PM tizimi - Mijozlarni boshqarish, zakazlar va follow-up eslatmalar.

## 🚀 Xususiyatlar

- 📱 PWA (Progressive Web App) - telefondan o'rnatish mumkin
- 👥 Mijozlarni boshqarish (CRUD)
- 📦 Zakazlar boshqaruvi (yangi / jarayonda / tugallangan)
- 📅 Follow-up eslatmalar va bildirishnomalar
- 💬 Mijoz bilan suhbat tarixi (matn, audio, rasm, video)
- 🗺️ Xaritadan manzil tanlash (latitude/longitude)
- 📍 GPS orqali joylashuvni aniqlash
- 🔔 Push notifications
- 📴 Offline rejim qo'llab-quvvatlash
- 🔐 JWT autentifikatsiya
- 👨‍💼 Admin panel

## 👥 Rollar

- **Admin** - barcha userlar, mijozlar, zakazlarni ko'rish, xaritada mijozlar
- **User (Savdogar)** - o'z mijozlari va zakazlarini boshqarish

## 🛠️ Texnologiyalar

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (xarita)
- Zustand (state management)
- PWA

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Multer (fayl yuklash)
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

## 📁 Loyiha strukturasi

```
sellx_crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── client.model.ts
│   │   │   ├── order.model.ts
│   │   │   ├── conversation.model.ts
│   │   │   └── reminder.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── client.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── conversation.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── upload.routes.ts
│   │   ├── services/
│   │   └── types/
│   └── uploads/
│       ├── images/
│       ├── videos/
│       └── audios/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── services/
│       └── types/
└── deploy/
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish (firstName, lastName, username, phoneNumber, password)
- `POST /api/auth/login` - Kirish

### Clients
- `GET /api/clients` - Barcha mijozlar
- `GET /api/clients/stats` - Statistika
- `GET /api/clients/:id` - Bitta mijoz
- `POST /api/clients` - Yangi mijoz (location: {latitude, longitude, address})
- `PUT /api/clients/:id` - Mijozni yangilash
- `DELETE /api/clients/:id` - Mijozni o'chirish

### Orders (Zakazlar)
- `GET /api/orders` - Barcha zakazlar
- `GET /api/orders/stats` - Zakaz statistikasi
- `GET /api/orders/:id` - Bitta zakaz
- `POST /api/orders` - Yangi zakaz
- `PUT /api/orders/:id` - Zakazni yangilash
- `DELETE /api/orders/:id` - Zakazni o'chirish

### Conversations (Chat)
- `GET /api/conversations/:clientId` - Suhbatlar
- `POST /api/conversations` - Yangi suhbat
- `DELETE /api/conversations/:id` - O'chirish

### Upload
- `POST /api/upload` - Fayl yuklash (images/, videos/, audios/ papkalariga)

### Admin (faqat admin uchun)
- `GET /api/admin/stats` - Umumiy statistika
- `GET /api/admin/users` - Barcha userlar
- `GET /api/admin/users/:id` - User tafsilotlari
- `GET /api/admin/clients` - Barcha mijozlar
- `GET /api/admin/clients/map` - Xaritada mijozlar
- `GET /api/admin/orders` - Barcha zakazlar

## 📊 Statuslar

### Mijoz statuslari
- `new` - Yangi
- `thinking` - O'ylab ko'raman
- `agreed` - Roziman
- `rejected` - Rad etdi
- `callback` - Keyinroq bog'lanish

### Zakaz statuslari
- `new` - Yangi
- `in_progress` - Jarayonda
- `completed` - Tugallangan

## 🔒 Environment Variables

### Backend (.env)
```
PORT=9999
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
