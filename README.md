# HealthNova

A healthcare web application built with vanilla HTML, CSS, JavaScript (frontend) and Node.js/Express (backend).

---

## 🚀 Getting Started (Local Setup)

1. **Clone the repository**

   ```bash
   git clone https://github.com/KhanAdnan20-dev/healthnova-miniproject.git
   cd healthnova-miniproject
   ```

2. **Install backend dependencies**

   Navigate into the `backend` folder and install packages:

   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file inside the `backend` folder with your database credentials:

   ```env
   DB_PASSWORD=your_database_password
   ```

4. **Start the server**

   ```bash
   npm start
   ```

5. Open the frontend HTML files (e.g., `frontend/login/login.html`) in your browser to use the app.

---

## 📱 How to Add This Repository in GitHub Mobile

GitHub Mobile lets you browse, manage, and contribute to repositories directly from your phone.

### Steps to Add / View This Repository on GitHub Mobile

1. **Download GitHub Mobile**
   - [iOS (App Store)](https://apps.apple.com/app/github/id1477376905)
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=com.github.android)

2. **Sign in** to your GitHub account in the app.

3. **Find this repository**
   - Tap the **Search** (🔍) icon at the bottom of the screen.
   - Search for `healthnova-miniproject` or `KhanAdnan20-dev/healthnova-miniproject`.
   - Tap the repository from the search results to open it.

4. **Star / Watch the repository** *(optional)*
   - Tap the **Star** button to bookmark it for quick access later.
   - Tap **Watch** to receive notifications for new issues, pull requests, and releases.

5. **Clone via GitHub Mobile**
   - On the repository page, tap **Code** (the green button).
   - Copy the HTTPS or SSH URL.
   - Use a Git client app (e.g., Working Copy on iOS or Termux on Android) to clone it to your device.

6. **Access your starred / watched repositories**
   - Tap the **profile** icon → **Your repositories** to quickly jump back to any repo you own or have starred.

---

## 📁 Project Structure

```
healthnova-miniproject/
├── backend/
│   ├── controllers/      # Request handlers (auth, hospital)
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API route definitions
│   ├── db.js              # Database connection
│   ├── server.js          # Express server entry point
│   └── package.json
└── frontend/
    ├── assets/            # Images and static assets
    ├── dashboard/         # Dashboard page (HTML/CSS/JS)
    ├── login/             # Login page (HTML/CSS/JS)
    └── registration/      # Registration page (HTML/CSS/JS)
```

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (via `.env` credentials)

