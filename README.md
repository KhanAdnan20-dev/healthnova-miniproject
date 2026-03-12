

# HealthNova

A healthcare web application that lets users register, log in, search for hospitals, and book appointments.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (open directly in the browser)
- **Backend:** Node.js + Express
- **Database:** MySQL

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MySQL](https://dev.mysql.com/downloads/) 8.0 or later (or [XAMPP](https://www.apachefriends.org/)/[WAMP](https://www.wampserver.com/) which include MySQL)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/KhanAdnan20-dev/healthnova-miniproject.git
cd healthnova-miniproject
```

### 2. Set up the MySQL database

Start your MySQL server, then create the database and tables by running the provided schema file.

**Option A — command line:**
```bash
mysql -u root -p < database/schema.sql
```

**Option B — MySQL Workbench / phpMyAdmin:**  
Open `database/schema.sql` and execute its contents.

This creates the `healthnova` database with three tables (`users`, `hospitals`, `bookings`) and inserts sample hospital data.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `backend/.env` and update the following:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=healthnova
JWT_SECRET=your_super_secret_jwt_key_here_change_this
PORT=5500
```

- **DB_PASSWORD** — your MySQL root (or other user) password
- **JWT_SECRET** — any long random string; used to sign auth tokens

### 5. Start the backend server

```bash
# from inside the backend/ folder
npm start
```

You should see:
```
DB_HOST: localhost
...
Server is running on port 5500
Database connected successfully.
```

### 6. Open the frontend

The frontend is plain HTML — no build step required. Open any page directly in your browser:

| Page | Path |
|------|------|
| Login | `frontend/login/login.html` |
| Register | `frontend/registration/registration.html` |
| Dashboard | `frontend/dashboard/index.html` |

> **Tip:** In VS Code, right-click `login.html` and choose **Open with Live Server** (requires the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)) for a smoother experience.

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in and receive a JWT |
| GET | `/api/hospitals/search` | No | Search hospitals by city / specialty / cost |
| POST | `/api/hospitals/book` | Yes | Book a hospital |
| GET | `/api/hospitals/history/:userId` | Yes | Get booking history |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ER_ACCESS_DENIED_ERROR` | Wrong DB credentials in `.env` |
| `ER_BAD_DB_ERROR` | Run `database/schema.sql` first |
| `ECONNREFUSED` on port 3306 | MySQL server is not running |
| Frontend shows "An error occurred" | Backend server is not running on port 5500 |

