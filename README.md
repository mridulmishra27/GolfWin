# 🏌️‍♂️ GolfWin Platform
**Premium Golf Draw & Charity Fundraising Management System**  
*JavaScript · React · Node.js · Supabase (PostgreSQL) · Express.js · Vite*

A full-stack golf draw platform where golfers log Stableford scores, compete in monthly jackpot draws, and can donate a percentage of their winnings to real-world charities.

> **⚠️ Important Note (Time Constraints):**  
> Due to strict time constraints, **Stripe (for subscription billing) and system email notifications (SMTP/Nodemailer)** have not been fully integrated into the live experience. However, the **complete boilerplate code** for both features (controllers, webhook handlers, UI components) are fully prepared and ready for future activation.

---

## 🎯 What Is This?
GolfWin is a premium web application built for golf clubs and charity fundraising events. Users participate in a fully automated draw engine every month. Winners are determined by how closely their scores match the randomly generated numbers. Meanwhile, users can allocate a chosen percentage of their winnings to be directly routed to a charity of their choice.

The platform features a stunning dark-mode, glassmorphic "Bento Box" UI, detailed analytical dashboards, score tracking, charity management, and a complete admin control suite.

## 🔑 Core Concepts
| Concept | How It Works |
| :--- | :--- |
| **Score Logging** | Users log their Stableford scores (1–45) to participate. |
| **Monthly Draw** | Admin runs the engine; 5 random numbers are generated & matched against scores. |
| **Prize Tiers** | 3 matches = Tier 3, 4 matches = Tier 4, 5 matches = Jackpot. |
| **Charity Impact** | Users can select a charity to route a configurable percentage of their winnings. |
| **Jackpot Carry** | If no 5-match winner exists, the jackpot carries forward to the next month. |

---

## 🚀 Key Features

### 👤 For Users
* **🔐 Account Registration & Auth** — JWT-secured login with persistent sessions.
* **🎯 Score Logging** — Log Stableford scores to enter the monthly draw.
* **🏆 Winnings Dashboard** — Track prize wins, amounts, and historical payouts.
* **❤️ Charity Selection** — Choose and change your supported charity anytime.
* **📊 Overview Dashboard** — Bento grid with statistics, scores, and historical wins.

### 🛡️ For Admins
* **🎰 Draw Engine Control** — Create drafts, simulate payouts, and publish monthly draws.
* **👥 User Management** — Search users and update roles.
* **🏅 Winner Verification** — Review and process winner claims.
* **🏦 Charity Management** — Create, edit, and track donation totals per charity.

### 🌟 Platform-Wide Features
* **🎨 Premium Dark UI** — Glassmorphic "Bento Box" layout with animated gradients (Framer Motion).
* **📱 Responsive Layouts** — CSS Grid bento system adapts perfectly across all screen sizes.
* **🔔 Toast Notification System** — Smooth, styled toasts for all user actions (`react-toastify`).

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Recharts, React Router v7, Lucide React, React Toastify.  
**Backend:** Node.js, Express.js, Supabase (PostgreSQL), JWT, Bcrypt, Cloudinary, Zod Validation.

---

## 📁 Project Structure

```text
GolfWin/
├── 🔧 backend/
│   ├── controllers/         # Auth, User, Draw, Charity, Score, Winner, Subscription
│   ├── routes/              # Express API Routes
│   ├── middlewares/         # JWT protect, Admin Role guard
│   ├── config/              # Supabase, DB, Env settings
│   ├── utils/               # Draw Engine, Prize Calculator, AppError
│   └── server.js            # Entry point
│
└── 💻 frontend/
    ├── src/
    │   ├── context/         # AuthContext (Global user state)
    │   ├── api/             # Axios instance setup
    │   ├── components/      # Navbar, GlassCard, GlowButton, Hero, Skeletons
    │   ├── pages/
    │   │   ├── auth/        # Login, Register
    │   │   ├── dashboard/   # User Bento stats, Scores, Charity, Winnings
    │   │   └── admin/       # Global control center, Draw engine, User/Charity management
    │   ├── index.css        # Global dark theme + bento grid system
    │   └── App.jsx          # Router configuration
    └── package.json
```

---

## 🚀 End-to-End Setup

### 📋 Prerequisites
* Node.js 18+
* Supabase Account / PostgreSQL database
* npm 8+

### ⚙️ Backend Setup
1. Navigate and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` file (see Environment Variables below).
3. Start the server:
   ```bash
   npm run dev
   ```
   *Server running on port 4000. API routes available at `http://localhost:4000/api/*`*

### 💻 Frontend Setup
1. Navigate and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file with `VITE_API_URL=http://localhost:4000/api`.
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## 🔧 Environment Variables

### `backend/.env`
```env
# Server
PORT=4000
NODE_ENV=development

# Supabase (PostgreSQL)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# JWT Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary (winner proofs/images)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Boilerplate Variables (Not fully integrated)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MONTHLY_PRICE_ID=price_monthly_id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🎰 Draw Engine Logic

The draw engine (`src/utils/drawEngine.js`) securely handles winner allocation.  
Prize Tiers are configured seamlessly:

| Matches | Tier | Prize Allocation |
| :--- | :--- | :--- |
| **5** | **Jackpot** | 40% of total pool |
| **4** | **Tier 2** | 35% of total pool |
| **3** | **Tier 3** | 25% of total pool |
| **0 winners** | **Carry Forward** | Jackpot rolls to next month |

---

## 🔒 Security
* ✅ **JWT Authentication** — All protected routes verify bearer tokens.
* ✅ **Password Hashing** — Bcrypt payload encryption.
* ✅ **Role Guards** — `adminOnly` middleware blocks restricted endpoints.
* ✅ **CORS** — Configured origin restriction.
* ✅ **Zod Validation** — Strict request body schema-validation natively.

---

## 🗺️ Roadmap
**Phase 1 (Completed) ✅**
* JWT auth with role-based access.
* Score logging with draw eligibility gates.
* Draw engine & Tiered prize pool calculator.
* Charity selection and automatic donation tracking.
* Premium dark-mode bento glassmorphic UI.

**Phase 2 (Planned) 🔄**
* Complete Stripe payment gateway activation.
* Email and SMS notification triggers.
* Recharts analytics advanced dashboard.
* Advanced PDF prize certificate generation.

---

## 📧 Contact & Support
Need help or have questions?

* 🐙 **GitHub:** [github.com/mridulmishra27](https://github.com/mridulmishra27)

*Found this project helpful? Give it a ⭐ on GitHub!*

⛳ **Where Every Swing Supports a Cause**  
*Made with 💙 and ☕. Good Luck, and Happy Golfing!* 🏆
