# Mentorship App

A full-stack web application for managing mentorship programs, connecting mentors and mentees, scheduling sessions, and handling user authentication.

## Project Structure

```
Mentorship-app/
├── backend/      # Node.js/Express backend API
├── frontend/     # React frontend client
├── components/   # Shared React components (if any)
├── pages/        # Shared React pages (if any)
├── README.md     # This file
└── ...
```

## Features
- User authentication (signup, login)
- Mentor and mentee dashboards
- Session booking and management
- Mentor discovery and profile viewing
- Admin dashboard

---

## Backend (Node.js + Express)

- **Location:** `backend/`
- **Description:** Handles API requests, authentication, session management, and data storage.
- **Main entry:** `backend/src/server.ts`

### Setup & Run
1. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2. Start the development server:
   ```sh
   npm run loadserver
   ```
   The backend will run (by default) on `http://localhost:5000`.

### API Endpoints
- `/api/auth` – Authentication (login, signup)
- `/api/sessions` – Session management
- `/api/users` – User data

> See `backend/src/routes/` for all available endpoints.

---

## Frontend (React)

- **Location:** `frontend/`
- **Description:** User interface for mentors, mentees, and admins. Communicates with the backend API.
- **Main entry:** `frontend/src/App.tsx`

### Setup & Run
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```
   The frontend will run on `http://localhost:3000` and proxy API requests to the backend.

### Build for Production
```sh
npm run build
```
The production build will be in `frontend/build/`.

### Testing
```sh
npm test
```

---

## How Frontend & Backend Work Together
- The frontend makes HTTP requests to the backend API for authentication, user data, and session management.
- Ensure both servers are running locally for full functionality.
- Update API URLs in the frontend if your backend runs on a different port or is deployed elsewhere.

---

## Getting Started (Full Project)
1. Clone the repository:
   ```sh
   git clone https://github.com/NATHANA31/Mentorship-app.git
   cd Mentorship-app
   ```
2. Set up and run the backend (see above).
3. Set up and run the frontend (see above).

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)
