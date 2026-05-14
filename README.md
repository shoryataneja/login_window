# AuthApp — Full-Stack Authentication System

A production-ready authentication system built with React, Node.js, MongoDB, and JWT. Supports email/password signup, Google OAuth, email verification, password reset, and profile management.

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, react-hot-toast, zxcvbn

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Passport.js, Nodemailer, Multer, Helmet, express-rate-limit, express-validator

**Database:** MongoDB Atlas

---

## Features

- Email & password signup / login
- Google OAuth (sign in with Google)
- JWT authentication via HTTP-only cookies
- Persistent login (stays logged in on refresh)
- Email verification on signup
- Forgot password & reset password flow
- Update display name from dashboard
- Change password from dashboard
- Profile picture upload
- Login activity tracking
- Dark / light mode toggle
- Rate limiting & Helmet security headers
- Input validation on all endpoints
- Fully responsive UI

---

## Project Structure

```
login_window/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── passport.js         # Google OAuth strategy
│   ├── controllers/
│   │   ├── authController.js   # signup, login, logout, OAuth, verify, reset
│   │   └── userController.js   # profile, avatar, password, activity
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── error.js            # Global error handler
│   │   └── upload.js           # Multer file upload
│   ├── models/
│   │   └── User.js             # Mongoose user schema
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── user.js             # /api/user routes
│   ├── uploads/                # Uploaded avatars (gitignored)
│   ├── utils/
│   │   ├── email.js            # Nodemailer email sender
│   │   └── token.js            # JWT generation & cookie setter
│   ├── .env                    # Environment variables (not pushed)
│   ├── .gitignore
│   ├── package.json
│   └── server.js               # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with interceptors
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Navbar.jsx
    │   │   └── ui/
    │   │       ├── InputField.jsx
    │   │       └── Spinner.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state
    │   │   └── ThemeContext.jsx # Dark/light mode
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Login.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Signup.jsx
    │   │   └── VerifyEmail.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Local Setup

### Prerequisites

- Node.js v18+
- A [MongoDB Atlas](https://cloud.mongodb.com) free cluster
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth 2.0 credentials
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/login_window.git
cd login_window
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/authdb
JWT_SECRET=generate_a_random_64_char_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

To generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

> The Vite dev server proxies `/api` requests to the backend automatically — no extra config needed locally.

---

### 4. Google OAuth setup (for local testing)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add to **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
4. Copy the Client ID and Secret into your `.env`
5. Go to **OAuth consent screen** → add your test email under **Test users**

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/signup` | Register with email & password | No |
| POST | `/login` | Login with email & password | No |
| POST | `/logout` | Clear auth cookie | No |
| GET | `/me` | Get current logged-in user | Yes |
| GET | `/verify-email/:token` | Verify email address | No |
| POST | `/forgot-password` | Send password reset email | No |
| POST | `/reset-password/:token` | Reset password with token | No |
| GET | `/google` | Initiate Google OAuth | No |
| GET | `/google/callback` | Google OAuth callback | No |

### User — `/api/user` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/profile` | Update display name |
| PUT | `/avatar` | Upload profile picture |
| PUT | `/change-password` | Change account password |
| GET | `/activity` | Get login activity history |

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from your `.env`
7. Update these for production:
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
   ```

### Frontend → Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-app.onrender.com
   ```
4. Update `frontend/src/api/axios.js` baseURL for production:
   ```js
   baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
   ```

### Database → MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Go to **Network Access** → Add `0.0.0.0/0` to allow all IPs
4. Copy the connection string into `MONGO_URI`

### Google OAuth → Production

1. Go to Google Cloud Console → Credentials → your OAuth client
2. Add your Render URL to **Authorized redirect URIs**:
   ```
   https://your-app.onrender.com/api/auth/google/callback
   ```
3. Add your Vercel URL to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HTTP-only cookies (never localStorage)
- CORS restricted to frontend origin only
- Rate limiting on all API and auth routes
- Helmet for HTTP security headers
- Input validation on all endpoints via express-validator
- Token expiry enforced on JWT and reset/verify tokens
- File upload restricted to images only, 2MB max

---

## License

MIT
