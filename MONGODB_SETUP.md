# SYME MongoDB Configuration Guide

## 📋 Overview
This guide explains the MongoDB setup for SYME AI Fitness Architect, transitioning from in-memory mock data to a production-grade MongoDB database.

---

## 🗂️ File Structure

```
syme-ai-fitness-architect/
├── .env.local                    # Environment variables (MongoDB connection)
├── server-mongodb.ts             # Main Express server with MongoDB integration
├── src/
│   ├── config/
│   │   └── mongodb.ts           # MongoDB connection configuration
│   └── models/
│       ├── User.ts              # User schema/model
│       └── UserProfile.ts       # User profile schema/model
└── package.json                  # Dependencies (includes mongoose, dotenv)
```

---

## 🔑 Environment Variables (.env.local)

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://syme_admin:Sash6273!gsk@cluster0.c09ahok.mongodb.net/?appName=Cluster0

# Database Name
MONGODB_DB_NAME=syme_fitness

# Node Environment
NODE_ENV=development

# JWT Secret for token generation
JWT_SECRET=syme_jwt_secret_key_2026_production

# API Port
API_PORT=3000
```

---

## 📦 MongoDB Collections & Schemas

### 1. **Users Collection**
Stores user authentication information.

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique, lowercase),
  password: string (hashed with bcrypt),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

---

### 2. **User Profiles Collection**
Stores user fitness profile and preferences.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  age: number (15-100),
  weight: number (kg, 30-250),
  height: number (cm, 120-250),
  targetWeight: number (kg),
  gender: enum ['male', 'female', 'other'],
  activityLevel: number,
  goal: enum ['hypertrophy', 'strength', 'weight_loss', 'maintenance', 'athletic_performance'],
  experience: enum ['beginner', 'intermediate', 'advanced', 'elite'],
  equipment: string[] (e.g., ['barbell', 'dumbbells', 'bench']),
  injuries: string[],
  subscriptionTier: enum ['free', 'premium', 'elite'],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` (unique)

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

All required packages are already in `package.json`:
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation

### Step 2: Configure Environment
Create/update `.env.local` with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://syme_admin:Sash6273!gsk@cluster0.c09ahok.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=syme_fitness
NODE_ENV=development
JWT_SECRET=syme_jwt_secret_key_2026_production
API_PORT=3000
```

### Step 3: Start Server with MongoDB
```bash
# Using the MongoDB-integrated server
npm run dev

# The server will automatically:
# 1. Connect to MongoDB
# 2. Create collections if they don't exist
# 3. Listen on port 3000
```

### Step 4: Verify Connection
Check the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "✅ Syme Production Server running",
  "mongodb": "✅ Connected",
  "timestamp": "2026-03-20T10:30:00.000Z"
}
```

---

## 🔄 API Endpoints with MongoDB

### Authentication
- `POST /api/auth/register` - Register new user (creates User + UserProfile)
- `POST /api/auth/login` - Login user (returns JWT token)

### Profile Management
- `GET /api/profile` - Get user profile from MongoDB
- `POST /api/profile/update` - Update user profile in MongoDB

### Workouts
- `POST /api/workouts/generate` - Generate workout (uses user profile from DB)
- `POST /api/workouts/log` - Log completed workout

### Nutrition
- `GET /api/nutrition/targets` - Calculate targets (uses user weight/goal from DB)
- `POST /api/nutrition/analyze` - Analyze food (premium feature)

### Progress
- `GET /api/progress/predictions` - Get transformation predictions (uses DB profile)

### Subscription
- `GET /api/subscription/plans` - List subscription plans
- `GET /api/subscription/status` - Get user subscription tier (from DB)

---

## 🔗 MongoDB Connection Flow

```
1. Application Start
   ↓
2. Load environment variables (.env.local)
   ↓
3. connectToMongoDB() called
   ↓
4. Mongoose connects to cluster
   ↓
5. Collections created (if not exist)
   ↓
6. Server ready to accept requests
   ↓
7. Data persisted in MongoDB Atlas
```

---

## 📊 Data Migration (Old to New)

### Migration from Mock Data to MongoDB:

1. **Old (server.ts - In-memory):**
   ```typescript
   const db = { users: [], workoutLogs: [] };
   db.users.push(newUser);
   ```

2. **New (server-mongodb.ts - MongoDB):**
   ```typescript
   const newUser = new User({ name, email, password });
   await newUser.save();
   const userProfile = new UserProfile({ userId, age, weight, ... });
   await userProfile.save();
   ```

---

## 🛡️ Security Best Practices

✅ **Implemented:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiration
- Email validation with regex
- Password minimum length requirement
- MongoDB ObjectId for unique identifiers
- Environment variables for sensitive data

✅ **Recommended (Future):**
- HTTPS/TLS encryption for API
- Rate limiting
- MongoDB user authentication with roles
- API key rotation
- Audit logging

---

## 🧪 Testing MongoDB Connection

```bash
# 1. Check connection
curl http://localhost:3000/api/health

# 2. Register user (creates in MongoDB)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 4. Get user profile (requires token)
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Update profile
curl -X POST http://localhost:3000/api/profile/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "weight": 80,
    "height": 180,
    "goal": "muscle_gain"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:27017`
- **Solution:** Ensure MongoDB URI in `.env.local` is correct and Atlas cluster is active

**Problem:** `MongoServerError: Authentication failed`
- **Solution:** Check username/password in connection string

**Problem:** `Can't connect to MongoDB`
- **Solution:** Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)

### Schema Validation Errors

**Problem:** `ValidationError: age: Path age (15) is less than minimum allowed value (15)`
- **Solution:** Ensure age is between 15-100

---

## 📈 Monitoring & Logs

Check MongoDB Atlas Dashboard:
1. Go to https://cloud.mongodb.com
2. Select Cluster0
3. View real-time metrics
4. Check operation logs

Server logs will show:
```
✅ MongoDB Connected Successfully
📦 Database: syme_fitness
```

---

## 🔄 Switching from Mock Server

### Old Server (server.ts)
```bash
npm run dev  # Uses in-memory data
```

### New Server (server-mongodb.ts)
```bash
# Option 1: Update package.json script
"dev": "tsx server-mongodb.ts"

# Option 2: Run directly
tsx server-mongodb.ts
```

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## ✅ Verification Checklist

- [ ] `.env.local` file created with MongoDB URI
- [ ] MongoDB connection string tested
- [ ] Server starts without errors
- [ ] Health endpoint returns MongoDB status
- [ ] User registration creates entry in MongoDB
- [ ] User login retrieves data from MongoDB
- [ ] Profile update persists in MongoDB
- [ ] JWT tokens generated correctly
- [ ] Authentication middleware works
- [ ] All API endpoints respond with DB data

---

**Last Updated:** March 20, 2026  
**Version:** 1.0.0 - MongoDB Integration Release
