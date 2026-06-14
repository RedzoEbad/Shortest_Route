# RideFinder Backend

Express + MongoDB API for user auth and shortest-route finding.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- MongoDB Atlas cluster (or local MongoDB)

## Setup

1. **Install dependencies**

   ```bash
   cd Server
   npm install
   ```

2. **Configure environment**

   Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable       | Description                                      |
   |----------------|--------------------------------------------------|
   | `PORT`         | Server port (default `8000`)                   |
   | `MONGODB_URI`  | MongoDB connection string with database name     |
   | `JWT_SECRET`   | Secret used to sign auth tokens                  |

3. **Start the server**

   ```bash
   # Development (auto-restart on file changes)
   npm run dev

   # Production
   npm start
   ```

   The API runs at `http://localhost:8000`.

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/health`             | Health check             |
| POST   | `/api/auth/register`      | Register a new user      |
| POST   | `/api/auth/login`         | Log in                   |
| POST   | `/api/auth/find-routes`   | Find K shortest routes   |
| GET    | `/api/protected`          | Protected route (JWT)    |

### Register / Login body

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "Passenger"
}
```

`role` must be `"Passenger"` or `"Rider"`.

### Find routes body

```json
{
  "startCoords": [67.0011, 24.8607],
  "endCoords": [67.0288, 24.8934],
  "K": 3
}
```

Coordinates are `[longitude, latitude]`.

## Deploy to Vercel

1. Set `MONGODB_URI` and `JWT_SECRET` in the Vercel project environment variables.
2. Deploy the `Server` folder (uses `vercel.json`).

## Troubleshooting

- **MongoDB connection failed** — Check `MONGODB_URI`, whitelist your IP in Atlas, and ensure the database name is in the URI (e.g. `/ridefinder`).
- **Module not found** — Run `npm install` again inside `Server/`.
- **Port in use** — Change `PORT` in `.env` or stop the process using port 8000.
