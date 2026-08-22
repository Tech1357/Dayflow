# HRMS Backend Setup Guide

## 🗄️ MySQL Database Setup

### Step 1: Create Database in MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server (usually `localhost:3306`)
3. Create a new database:

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Create MySQL User (Optional but Recommended)

```sql
-- Create a dedicated user for the HRMS application
CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'hrms_password_2024';

-- Grant all privileges on the hrms_db database
GRANT ALL PRIVILEGES ON hrms_db.* TO 'hrms_user'@'localhost';

-- Reload privileges
FLUSH PRIVILEGES;
```

### Step 3: Update Database Connection

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your MySQL credentials:

**Option A: Using root user (simpler for development):**
```
DATABASE_URL="mysql://root:your_mysql_root_password@localhost:3306/hrms_db"
```

**Option B: Using dedicated user (recommended):**
```
DATABASE_URL="mysql://hrms_user:hrms_password_2024@localhost:3306/hrms_db"
```

## 🚀 Backend Installation & Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Create Database Tables
```bash
npx prisma db push
```

### Step 4: Seed Database with Sample Data
```bash
npm run db:seed
```

### Step 5: Start the Backend Server
```bash
npm run dev
```

The backend will be running on: `http://localhost:5000`

## 🔐 Default Login Credentials

After running the seed script, you can use these credentials:

**Admin Account:**
- Email: `admin@dayflow.com`
- Password: `admin123`

**Employee Account:**
- Email: `employee@dayflow.com` 
- Password: `employee123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `GET /api/employees/meta/departments` - Get departments

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `GET /api/attendance/status/today` - Get today's status

### Time Off
- `GET /api/timeoff/requests` - Get time off requests
- `POST /api/timeoff/requests` - Submit time off request
- `PATCH /api/timeoff/requests/:id` - Approve/Reject request
- `GET /api/timeoff/balance` - Get time off balance
- `GET /api/timeoff/calendar` - Get time off calendar

### Profile
- `PUT /api/profile/basic` - Update basic profile
- `PUT /api/profile/private` - Update private info
- `PUT /api/profile/bank` - Update bank details
- `PUT /api/profile/salary/:employeeId` - Update salary (Admin)
- `POST /api/profile/skills` - Add skill
- `PUT /api/profile/skills/:id` - Update skill
- `DELETE /api/profile/skills/:id` - Delete skill
- `PUT /api/profile/password` - Change password

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Database operations
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Seed database with sample data

# View database
npx prisma studio        # Open database in browser
```

## 📂 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding script
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── employees.js     # Employee management
│   ├── attendance.js    # Attendance tracking
│   ├── timeoff.js       # Time off management
│   └── profile.js       # Profile management
├── middleware/
│   └── auth.js          # Authentication middleware
├── lib/
│   └── db.js            # Database connection
├── server.js            # Main server file
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## 🔧 Troubleshooting

### Database Connection Issues

1. **Check MySQL Service:**
   - Ensure MySQL is running on your system
   - Check if you can connect via MySQL Workbench

2. **Verify Credentials:**
   - Make sure the username/password in `.env` are correct
   - Test connection in MySQL Workbench

3. **Database Exists:**
   - Ensure `hrms_db` database exists
   - Check database name spelling in connection string

4. **Port Issues:**
   - Default MySQL port is 3306
   - If using a different port, update the connection string

### Common Prisma Errors

1. **"Database does not exist":**
   ```bash
   # Create the database first in MySQL Workbench, then run:
   npx prisma db push
   ```

2. **"Migration failed":**
   ```bash
   # Reset database (WARNING: This will delete all data)
   npx prisma db push --force-reset
   npm run db:seed
   ```

3. **"Prisma Client not generated":**
   ```bash
   npx prisma generate
   ```

## 📦 Production Deployment

1. Update environment variables for production
2. Use proper MySQL credentials (not root)
3. Enable SSL for database connection
4. Set `NODE_ENV=production`
5. Use PM2 or similar for process management

## 🔒 Security Notes

- Change default passwords before production
- Use environment variables for all secrets
- Enable MySQL SSL in production
- Implement proper logging and monitoring
- Regular database backups