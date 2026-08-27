# 💈 Barber Appointment System

A modern, full-stack appointment booking system for barbershops with real-time availability, role-based access control, and email notifications.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 👤 Customer Features
- 📅 **Book Appointments** - Select service, barber, date and time
- 🕐 **Real-time Availability** - See only available time slots
- 📧 **Email Notifications** - Confirmation and reminder emails
- 📱 **Responsive Design** - Works on all devices
- 🔐 **Secure Authentication** - JWT-based auth with Better Auth
- 📝 **Appointment History** - View past and upcoming bookings

### 💼 Barber Features
- 📊 **Dashboard** - View all appointments
- ✅ **Manage Bookings** - Confirm, complete, or cancel appointments
- 🚫 **Time Off Management** - Block unavailable dates/times
- 📈 **Earnings Overview** - Track revenue
- 🔔 **Real-time Updates** - Instant notification of new bookings

### 👨‍💼 Admin Features
- 👥 **Staff Management** - Invite and manage barbers
- 💇 **Service Management** - Add/edit/delete services
- 📅 **Shop Hours** - Configure business hours and holidays
- 📊 **Analytics** - View booking statistics
- ⚙️ **System Settings** - Full control over the platform

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth (JWT)
- **Email**: Supabase Email Service
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Shadcn/ui
- **Routing**: React Router v6
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Notifications**: Sonner

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn
- PostgreSQL database (local or cloud)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd barber_apointment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# - DATABASE_URL: Your PostgreSQL connection string
# - SUPABASE_URL & SUPABASE_SERVICE_KEY: From Supabase dashboard
# - BETTER_AUTH_SECRET: Generate with: openssl rand -base64 32
```

**Run Prisma Migrations**
```bash
npx prisma generate
npx prisma migrate dev
```

**Start Backend**
```bash
npm run start:dev
```

Backend runs on: http://localhost:3000
API Docs: http://localhost:3000/api/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:3000/api
```

**Start Frontend**
```bash
npm run dev
```

Frontend runs on: http://localhost:8080

### 4. Create Admin Account

The first registered user becomes admin automatically. Or use Prisma Studio:

```bash
cd backend
npx prisma studio
```

Navigate to User table and set `role` to `ADMIN`.

## 📁 Project Structure

```
barber_apointment/
├── backend/                    # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Migration history
│   ├── src/
│   │   ├── admin/             # Admin module
│   │   ├── appointments/      # Booking logic & availability
│   │   ├── auth/              # Authentication
│   │   ├── barbers/           # Barber management
│   │   ├── services/          # Service management
│   │   ├── common/            # Guards, decorators, email service
│   │   └── prisma/            # Prisma service
│   ├── .env.example           # Environment template
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # Zustand stores
│   │   ├── lib/               # Utilities & API service
│   │   └── types/             # TypeScript types
│   ├── .env.example           # Environment template
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control** - ADMIN, BARBER, CUSTOMER roles
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **CORS Protection** - Configured origins only
- ✅ **Input Validation** - All API inputs validated
- ✅ **SQL Injection Prevention** - Prisma ORM parameterized queries
- ✅ **Environment Variables** - Secrets never committed to git

## 📊 Database Schema

### Core Tables
- **User** - All system users (customers, barbers, admins)
- **Session** - Authentication sessions
- **Barber** - Barber profiles linked to users
- **Service** - Available barbershop services
- **Appointment** - Booking records
- **BarberTimeOff** - Barber unavailable periods
- **ShopClosure** - Shop-wide closures
- **BarberInvitation** - Email invitations for new barbers

## 🎨 Design System

- **Font Display**: Space Grotesk - Modern geometric sans-serif
- **Font Body**: Inter - Clean and readable
- **Font Mono**: Fira Code - Code and timestamps
- **Color Scheme**: Neutral with primary accent
- **Animations**: Smooth transitions with Framer Motion

## 📧 Email Configuration

Uses Supabase Email Service. To set up:

1. Go to Supabase Dashboard → Project Settings → API
2. Copy your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
3. Add to backend `.env`

Email templates available in: `backend/src/common/services/email.service.ts`

## 🌐 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

### Key Endpoints

#### Authentication
- `POST /api/auth/signup` - Register customer
- `POST /api/auth/signin` - Login
- `POST /api/auth/register-barber` - Register barber via invitation
- `GET /api/auth/session` - Get current session

#### Appointments
- `GET /api/appointments/availability` - Get available time slots
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/me` - Get my appointments
- `PATCH /api/appointments/:id/status` - Update status (barber)

#### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service (admin)
- `PATCH /api/services/:id` - Update service (admin)

#### Barbers
- `GET /api/barbers` - List all barbers
- `POST /api/barbers/time-off` - Add time off (barber)

## 🚀 Deployment

### Deploy to Vercel (Free)

#### Backend
```bash
cd backend
vercel --prod
```

Set environment variables in Vercel dashboard.

#### Frontend
```bash
cd frontend
vercel --prod
```

Update `VITE_API_URL` to your backend Vercel URL.

### Deploy to Render (Free)

1. **Backend**: New Web Service
   - Build: `npm install && npx prisma generate`
   - Start: `npm run start:prod`
   
2. **Database**: New PostgreSQL (Free tier)

3. **Frontend**: New Static Site
   - Build: `npm run build`
   - Publish: `dist`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure database exists and is accessible

### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `backend/src/main.ts`

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (DEV ONLY!)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 8080 (frontend)
npx kill-port 8080
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_SERVICE_KEY="..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:8080"
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for modern barbershops

## 🙏 Acknowledgments

- NestJS Team for the amazing framework
- Vercel for hosting
- Supabase for email service
- Shadcn for beautiful UI components

---

**⭐ Star this repo if you find it helpful!**
