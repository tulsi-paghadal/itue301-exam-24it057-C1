
# DriveEasy Car Rental System

DriveEasy is a web-based car rental application built using React, Express.js, and MongoDB with Mongoose. Customers can log in, browse available vehicles, make bookings, and view their bookings.

## Features

- Customer login with token-based authentication
- Vehicle fleet listing from the backend API
- Filter vehicles by Hatchback, Sedan, and SUV
- Book a vehicle using pickup and return dates
- View personal bookings
- Admin dashboard with fleet availability information
- Protected routes using React Router
- REST API built with Express.js
- MongoDB database with Mongoose schemas

## Technology Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express.js
- Database: MongoDB
- ODM: Mongoose
- Authentication: JSON Web Token (JWT)

## Project Structure

```text
AWDF_Exam/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   ├── createCustomer.js
│   └── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection URI

## Database Setup

1. Start MongoDB.
2. Create a database named `driveeasy`.
3. Configure the backend environment variables in `backend/.env`.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/driveeasy
JWT_SECRET=replace_with_a_local_secret
```

Never commit your real `.env` file or production secrets to GitHub.

## Run the Backend

Open a terminal:

```bash
cd backend
npm install
npm start
```

The backend runs on `http://localhost:5000`, provided the server starts successfully.

## Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/login` | Customer login |
| GET | `/api/v1/vehicles` | List vehicles |
| POST | `/api/v1/bookings` | Create a booking |
| GET | `/api/v1/bookings/my` | View customer bookings |
| PATCH | `/api/v1/bookings/:id/status` | Update booking status |

## Security

- Keep environment variables in `.env`.
- Commit `.env.example` without real credentials.
- Do not publish database passwords or JWT secrets.

## Academic Project

Course: ITUE301 — Advanced Web Development Frameworks  
Project: DriveEasy Car Rental System  
Institution: CHARUSAT — CSPIT
