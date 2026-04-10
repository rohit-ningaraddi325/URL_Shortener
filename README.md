# 🔗 URL Shortener

A production-ready URL shortener built with **Express.js**, **SQLite** (via `better-sqlite3`), and **nanoid**.

---

## Project Structure

```
url-shortener/
├── src/
│   ├── app.js                  # Entry point
│   ├── routes/
│   │   └── urlRoutes.js        # Route definitions
│   ├── controllers/
│   │   └── urlController.js    # Business logic
│   ├── models/
│   │   ├── db.js               # DB init & connection
│   │   └── urlModel.js         # Query helpers
│   ├── middleware/
│   │   └── errorMiddleware.js  # 404 + global error handler
│   └── utils/
│       └── logger.js           # Lightweight logger
├── data/                       # SQLite DB (auto-created)
├── .env.example
├── Dockerfile
└── package.json
```

---

## API Endpoints

| Method | Path           | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/health`      | Health check                         |
| POST   | `/shorten`     | Shorten a URL                        |
| GET    | `/:id`         | Redirect to original URL             |
| GET    | `/stats/:id`   | Get click stats for a short URL      |
| GET    | `/admin/urls`  | List all stored URLs                 |

### POST `/shorten`

**Request:**
```json
{ "url": "https://www.example.com/some/very/long/path" }
```

**Response (201 Created):**
```json
{
  "shortUrl": "https://your-domain.com/xK3mP2q",
  "id": "xK3mP2q",
  "original": "https://www.example.com/some/very/long/path",
  "clicks": 0,
  "created_at": "2024-04-10 12:00:00",
  "duplicate": false
}
```

> If the same URL was already shortened, returns `200 OK` with `"duplicate": true`.

---

## Running Locally

### Prerequisites
- Node.js ≥ 18

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set BASE_URL to your domain or http://localhost:8080

# 3. Start the server
npm start

# Development (with auto-reload)
npm run dev
```

---

## Running with Docker

```bash
# Build the image
docker build -t url-shortener .

# Run the container
docker run -p 8080:8080 \
  -e BASE_URL=http://localhost:8080 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  url-shortener
```

The `-v` flag mounts a local `data/` folder so the SQLite DB persists across container restarts.

---

## Deploying to Google Cloud Run

```bash
# Build & push to Artifact Registry
docker build -t gcr.io/YOUR_PROJECT/url-shortener .
docker push gcr.io/YOUR_PROJECT/url-shortener

# Deploy
gcloud run deploy url-shortener \
  --image gcr.io/YOUR_PROJECT/url-shortener \
  --platform managed \
  --region us-central1 \
  --set-env-vars BASE_URL=https://YOUR_CLOUD_RUN_URL \
  --allow-unauthenticated
```

> **Note:** Cloud Run is stateless. For production, replace SQLite with a managed database (e.g. Cloud SQL / PlanetScale) or use a Redis store.

---

## Example cURL Requests

```bash
# Shorten a URL
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com/search?q=express+url+shortener"}'

# Follow the redirect
curl -L http://localhost:8080/xK3mP2q

# Get stats
curl http://localhost:8080/stats/xK3mP2q

# List all URLs
curl http://localhost:8080/admin/urls

# Health check
curl http://localhost:8080/health
```
