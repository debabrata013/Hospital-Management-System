# Super Admin Backend — README

This file documents the changes and steps taken to implement the **Super Admin backend** in the Hospital Management System project. Save this as `README.md` in your project for future reference.

---

## Overview

The backend (Express API on port **5002**) was extended to add **Super Admin** functionality. A user with the `super-admin` role can now:
- View and search all users
- Create users with different roles
- Activate or deactivate accounts
- Change roles of existing users
- View system KPIs for the dashboard

The Next.js frontend already proxies `/api/*` requests to this backend, ensuring smooth integration.

---

## Changes Made

### 1) Environment Setup
- Added `.env` file in `backend/` with:
  ```env
  PORT=5002
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=hospital_db
  DB_USER=root
  DB_PASSWORD=your_db_password
  JWT_SECRET=change_this_to_a_long_random_value
  ```
- Verified DB connection using `backend/test-db.js`.

### 2) Dependencies
- Installed backend dependencies inside `/backend` using:
  ```bash
  npm install
  ```
- Started backend server with:
  ```bash
  npm run dev
  ```

### 3) Middleware
- Created `backend/middleware/authorize.js`:
  - Verifies user’s role from JWT.
  - Restricts access to Super Admin-only routes.

### 4) Super Admin Routes
- Created `backend/routes/superAdmin.js` with endpoints:
  - `GET /api/super-admin/users` → List/search users with filters & pagination.
  - `POST /api/super-admin/users` → Create new users.
  - `PATCH /api/super-admin/users/:id/status` → Activate/deactivate accounts.
  - `PATCH /api/super-admin/users/:id/role` → Change a user’s role.
  - `GET /api/super-admin/kpis` → Dashboard KPIs (total users, active users, breakdown by role).

### 5) Server Integration
- Updated `backend/server.js`:
  ```js
  const { authenticate } = require('./middleware/auth')
  const { authorizeRoles } = require('./middleware/authorize')
  const superAdminRoutes = require('./routes/superAdmin')

  app.use('/api/super-admin', authenticate, authorizeRoles('super-admin'), superAdminRoutes)
  ```
- Ensures only authenticated `super-admin` users can access the routes.

### 6) Testing & Usage
- Used `/api/auth/register` and `/api/auth/login` to create/login as a `super-admin`.
- Tested routes with JWT tokens using Postman or curl.
- Verified successful JSON responses (`success: true`).

### 7) Frontend Connection
- Next.js frontend automatically proxies requests to backend.
- Example: `fetch('/api/super-admin/users')` → hits the Express route.
- Dashboard now uses these APIs for user management and KPIs.

---

## How to Run

1. Navigate to backend folder:
   ```bash
   cd backend
   npm install
   ```

2. Add `.env` file with DB + JWT values.

3. Start backend:
   ```bash
   npm run dev
   ```

4. Register or login as a Super Admin, then copy the JWT token.

5. Use the token to test endpoints with Postman, curl, or frontend.

---

## Completed ✅

You now have:
- Super Admin-only protected routes
- Role-based access control
- User management features
- KPIs available for dashboard

This completes the **Super Admin backend setup**.
