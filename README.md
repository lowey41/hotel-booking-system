# 🏨 StayWise - Advanced Hotel Booking System (2026)

A full-featured, production-ready hotel booking platform built with cutting-edge 2026 technologies. Think Airbnb/Booking.com with AI-powered recommendations, real-time features, and seamless payment processing.

---

## 📸 Features at a Glance

| Feature | Status |
|---|---|
| 👤 User Auth (JWT + Google OAuth) | ✅ |
| 🏨 Hotel Listings with Advanced Filters | ✅ |
| 🤖 AI-Powered Recommendations | ✅ |
| 💳 Stripe Payment Integration | ✅ |
| 📱 QR Code Check-in | ✅ |
| 🌙 Dark Mode | ✅ |
| 🔔 Real-time Notifications (WebSockets) | ✅ |
| 📧 Email Notifications | ✅ |
| 🏠 Hotel Owner Dashboard | ✅ |
| 🛡️ Admin Panel | ✅ |
| 📖 Booking Management | ✅ |
| ❤️ Wishlist / Favorites | ✅ |
| ⭐ Reviews & Ratings | ✅ |
| 📲 Progressive Web App (PWA) | ✅ |
| 🐳 Docker Setup | ✅ |

---

## 🧠 Tech Stack

**Frontend:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + ShadCN UI
- Zustand (state management)
- TanStack Query (server state)
- Framer Motion (animations)
- Stripe React SDK

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication + Refresh Tokens
- Socket.io (real-time)
- Stripe (payments)
- Nodemailer (emails)
- Winston (logging)
- Zod (validation)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **PostgreSQL** v14+ (or use Docker)
- **npm** v9+

---

### Option A: Local Development (Recommended)

#### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd hotel-booking-system
npm run install:all
```

#### 2. Set Up Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values (see Configuration section below)
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values
```

#### 3. Set Up PostgreSQL Database

If you don't have PostgreSQL installed, use Docker:

```bash
docker run --name staywise-postgres \
  -e POSTGRES_DB=staywise_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### 4. Run Database Migrations & Seed

```bash
npm run db:setup
```

This will:
- Create all tables
- Seed sample data (hotels, users, bookings)

#### 5. Start Development Servers

```bash
# Start both frontend and backend simultaneously
npm run dev
```

Or run separately:
```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

#### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health
- **Prisma Studio:** `npm run db:studio`

---

### Option B: Docker Compose

```bash
# Copy and configure env file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Fill in required values in both .env files, then:
docker-compose up -d

# Run migrations inside container
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend ts-node prisma/seed.ts
```

Access at http://localhost (port 80 via Nginx)

---

## 🔑 Demo Login Credentials

After seeding, use these accounts:

| Role | Email | Password |
|---|---|---|
| 👤 User | john@example.com | Password123! |
| 🏨 Hotel Owner | owner@grandhotel.com | Password123! |
| 🛡️ Admin | admin@staywise.com | Password123! |

---

## ⚙️ Configuration

### Required Environment Variables

**Backend `.env`:**

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/staywise_db"

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your_super_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Stripe (test mode from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...

# Email (use Mailtrap for development: https://mailtrap.io)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
```

**Frontend `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Optional Services

| Service | Purpose | Get Key |
|---|---|---|
| Google OAuth | Social login | [Google Console](https://console.cloud.google.com) |
| Cloudinary | Image uploads | [Cloudinary](https://cloudinary.com) |
| Mapbox | Map integration | [Mapbox](https://mapbox.com) |
| Mailtrap | Dev email testing | [Mailtrap](https://mailtrap.io) |

---

## 📁 Project Structure

```
hotel-booking-system/
├── frontend/                  # Next.js App
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── hotels/            # Hotel listing & detail
│   │   ├── auth/              # Login & register
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin panel
│   │   └── owner/             # Hotel owner dashboard
│   ├── components/
│   │   ├── ui/                # ShadCN base components
│   │   ├── hotel/             # Hotel-specific components
│   │   ├── booking/           # Booking components
│   │   ├── layout/            # Navbar, Footer
│   │   └── providers/         # Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # API client, utilities
│   ├── store/                 # Zustand stores
│   └── styles/                # Global CSS
│
├── backend/                   # Express API
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── routes/            # API routes
│       ├── middleware/        # Auth, errors
│       ├── services/          # Business logic
│       ├── lib/               # Prisma client
│       └── utils/             # Logger, helpers
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
│
├── nginx/                     # Reverse proxy config
├── docker-compose.yml         # Container orchestration
└── README.md
```

---

## 🛠️ API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/google` | Google OAuth |

### Hotels
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hotels` | List hotels (with filters) |
| GET | `/api/hotels/:id` | Get hotel details |
| GET | `/api/hotels/availability` | Check room availability |
| GET | `/api/hotels/recommendations` | AI recommendations |
| POST | `/api/hotels` | Create hotel (owner) |
| PUT | `/api/hotels/:id` | Update hotel (owner) |
| DELETE | `/api/hotels/:id` | Delete hotel (owner) |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | User's bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id` | Booking details |
| POST | `/api/bookings/:id/confirm` | Confirm after payment |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/wishlist` | Get wishlist |
| POST | `/api/users/wishlist/:hotelId` | Toggle wishlist |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/hotels` | All hotels |
| PUT | `/api/admin/hotels/:id/status` | Approve/reject hotel |

---

## 🧪 Testing

```bash
# Run backend tests
npm run test --prefix backend

# Run with coverage
cd backend && npm test -- --coverage
```

---

## 🚀 Deployment

### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
```

**Backend on Railway:**
1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to `backend/`
4. Add environment variables
5. Railway auto-detects Node.js and deploys

**Database on Supabase (PostgreSQL):**
1. Create a Supabase project
2. Copy the connection string
3. Update `DATABASE_URL` in both Railway and locally

### Production Checklist

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origins
- [ ] Set up database backups
- [ ] Enable error monitoring (Sentry)
- [ ] Configure CDN for images
- [ ] Set up log aggregation

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access tokens (15 min) + refresh tokens (7 days)
- ✅ Token rotation on refresh
- ✅ Rate limiting (100 req/15 min general, 10 req/hr auth)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Role-based access control (USER, HOTEL_OWNER, ADMIN)
- ✅ Secure HTTP-only considerations

---

## 📈 Extending the Project

**Add image uploads:**
```bash
npm install cloudinary multer-storage-cloudinary --prefix backend
```

**Add calendar sync (Google Calendar):**
```bash
npm install googleapis --prefix backend
```

**Add map integration:**
```bash
npm install react-map-gl mapbox-gl --prefix frontend
```

**Add voice search:**
```bash
# Use Web Speech API (built into browsers)
# Add voice search component to hotel filters
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Support

- 📧 Email: support@staywise.com
- 📖 Documentation: `/docs`
- 🐛 Issues: GitHub Issues

---

Built with ❤️ for modern travellers — StayWise Team 2026
