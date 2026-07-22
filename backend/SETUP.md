# Barber Appointment Backend - Setup Guide

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
cd backend
npm install @prisma/adapter-pg pg class-validator class-transformer dotenv
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name init
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Start Development Server
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── barbers/           # Barbers management
│   ├── services/          # Services management
│   ├── appointments/      # Appointments management
│   ├── prisma/            # Prisma service
│   ├── common/            # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   └── guards/        # Auth & Role guards
│   └── lib/
│       └── auth.ts        # Better-auth configuration
├── prisma/
│   └── schema.prisma      # Database schema
└── .env                   # Environment variables
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Barbers (Admin only for create/update/delete)
- `GET /api/barbers` - List all barbers
- `GET /api/barbers/:id` - Get barber details
- `GET /api/barbers/:id/available-slots?date=2024-01-01` - Get available slots
- `POST /api/barbers` - Create barber (Admin)
- `PATCH /api/barbers/:id` - Update barber (Admin)
- `DELETE /api/barbers/:id` - Delete barber (Admin)

### Services (Admin only for create/update/delete)
- `GET /api/services` - List all services
- `GET /api/services/active` - List active services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (Admin)
- `PATCH /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Appointments (Requires authentication)
- `GET /api/appointments` - List appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `DELETE /api/appointments/:id` - Delete appointment (Admin only)

---

## 🔑 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

### User Roles
- **CUSTOMER** - Can book and manage their own appointments
- **BARBER** - Can view and manage appointments assigned to them
- **ADMIN** - Full access to all resources

---

## 📝 Example Requests

### 1. Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### 2. Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create Service (Admin)
```bash
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Classic haircut",
  "duration": 30,
  "price": 25.00,
  "isActive": true
}
```

### 4. Create Appointment
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "barberId": "barber_id_here",
  "serviceId": "service_id_here",
  "start": "2024-01-15T10:00:00Z",
  "note": "Please use scissors only"
}
```

---

## 🛠️ Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
npx prisma generate
```

### Issue: "PrismaClient needs adapter"
**Solution:**
```bash
npm install @prisma/adapter-pg pg
```

### Issue: Migration fails
**Solution:**
1. Check DATABASE_URL and DIRECT_URL in .env
2. Make sure Supabase database is running
3. Try: `npx prisma db push` instead

---

## 📦 Environment Variables

Required in `.env` file:

```env
DATABASE_URL="postgresql://..."           # For queries (pooler)
DIRECT_URL="postgresql://..."             # For migrations
BETTER_AUTH_SECRET="your_secret_here"     # Random string
BETTER_AUTH_URL="http://localhost:3000"   # Backend URL
FRONTEND_URL="http://localhost:5173"      # Frontend URL for CORS
PORT=3000                                 # Server port
```

---

## 🎯 Next Steps

1. Run migrations: `npx prisma migrate dev --name init`
2. Start the server: `npm run start:dev`
3. Create an admin user via signup
4. Use Prisma Studio to manually set the user's role to ADMIN
5. Create services and barbers via the API

---

## 📚 Technologies Used

- **NestJS** - Backend framework
- **Prisma 7** - ORM
- **Better-Auth** - Authentication
- **PostgreSQL** - Database (Supabase)
- **TypeScript** - Language
- **Class Validator** - DTO validation
