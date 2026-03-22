# Calliope IDE - Deployment Guide

This guide covers deploying Calliope IDE to staging and production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Python 3.8+ and Node.js 18+ (for non-Docker deployment)
- Gemini API key from Google AI Studio

---

## Environment Variables

### Required Variables

The following environment variables **MUST** be set before deployment. The application will **fail to start** if these are missing:

#### Backend (Python/Flask)

```bash
# Generate secure keys using:
python -c "import secrets; print(secrets.token_hex(32))"

SECRET_KEY=<your-flask-secret-key>              # Flask session encryption key
JWT_SECRET_KEY=<your-jwt-secret-key>            # JWT token signing key
GEMINI_API_KEY=<your-gemini-api-key>            # Google Gemini API key
```

**Security Note**: Never use the hardcoded fallback values (`'dev-secret-key-change-in-production'`, `'your-jwt-secret-key'`) in production. These have been removed and will cause the application to fail on startup if not properly configured.

### Optional Variables

```bash
# Backend
FLASK_ENV=production                            # Environment mode (default: production)
PORT=5000                                       # Backend port (default: 5000)
DATABASE_URL=sqlite:///data/calliope.db         # Database connection string
JWT_ACCESS_TOKEN_EXPIRES=3600                   # Access token TTL in seconds (default: 1 hour)
JWT_REFRESH_TOKEN_EXPIRES=2592000               # Refresh token TTL in seconds (default: 30 days)
CORS_ORIGINS=http://localhost:3000              # Allowed CORS origins (comma-separated)
RATE_LIMIT_ENABLED=true                         # Enable rate limiting (default: true)
RATE_LIMIT_PER_MINUTE=60                        # Rate limit threshold (default: 60/min)

# Frontend
FRONTEND_PORT=3000                              # Frontend port (default: 3000)
NEXT_PUBLIC_API_URL=http://localhost:5000       # Backend API URL
```

---

## Local Development

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# Generate secure keys
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"

# Add to .env
cat > .env <<EOF
SECRET_KEY=<generated-secret-key>
JWT_SECRET_KEY=<generated-jwt-key>
GEMINI_API_KEY=<your-gemini-api-key>
FLASK_ENV=development
DATABASE_URL=sqlite:///./data/calliope.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### 3. Run Application

**Backend:**
```bash
cd server
export $(cat ../.env | xargs)
python -m server.start
```

**Frontend:**
```bash
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## Docker Deployment

### 1. Create Environment File

```bash
# .env.production
SECRET_KEY=<generate-with-secrets.token_hex(32)>
JWT_SECRET_KEY=<generate-with-secrets.token_hex(32)>
GEMINI_API_KEY=<your-gemini-api-key>
FLASK_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose --env-file .env.production up --build -d

# Check service health
docker-compose ps
docker-compose logs -f backend

# Verify backend health
curl http://localhost:5000/health
```

Expected health response:
```json
{
  "status": "healthy",
  "service": "Calliope IDE",
  "authentication": "enabled",
  "version": "1.0.0"
}
```

### 3. Stop Services

```bash
docker-compose down              # Stop services
docker-compose down -v           # Stop and remove volumes (WARNING: deletes database)
```

---

## Production Deployment

### Cloud Platform Examples

#### Docker-based (DigitalOcean, AWS ECS, Azure Container Instances)

1. **Build images:**
   ```bash
   docker build -t calliope-frontend:latest .
   docker build -t calliope-backend:latest ./server
   ```

2. **Push to registry:**
   ```bash
   docker tag calliope-backend:latest <your-registry>/calliope-backend:latest
   docker push <your-registry>/calliope-backend:latest
   ```

3. **Set environment variables** in your cloud platform's UI or CLI

4. **Deploy using the platform's container service**

#### Platform-Specific Notes

**Heroku:**
- Set buildpack: `heroku/python` for backend
- Configure environment variables via `heroku config:set`
- Database: Use Heroku Postgres add-on (update `DATABASE_URL`)

**Render:**
- Create Web Service for backend (Python)
- Create Static Site for frontend (Node.js)
- Add environment variables in dashboard
- Auto-deploy on Git push

**Vercel (Frontend only):**
- Deploy Next.js app: `vercel --prod`
- Set `NEXT_PUBLIC_API_URL` to backend URL
- Backend must be deployed separately

---

## Health Checks

### Endpoints

**Backend Health Check:**
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "Calliope IDE",
  "authentication": "enabled",
  "version": "1.0.0"
}
```

**Backend API Info:**
```bash
GET /api/info
```

### Docker Compose Health Checks

The `docker-compose.yml` includes health checks for both services:

- **Backend**: Checks `/health` endpoint every 30s
- **Frontend**: Checks root page every 30s
- **Dependencies**: Frontend waits for backend to be healthy before starting

---

## Troubleshooting

### Application Won't Start

**Error:** `EnvironmentError: JWT_SECRET_KEY environment variable is not set`

**Solution:**
```bash
# Generate and set required keys
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export GEMINI_API_KEY=<your-api-key>
```

### Port Collision

**Error:** `OSError: [Errno 98] Address already in use`

**Solution:**
```bash
# Find process using the port
sudo lsof -i :5000

# Kill the process or change PORT in .env
export PORT=5001
```

### Database Errors

**Error:** `sqlite3.OperationalError: unable to open database file`

**Solution:**
```bash
# Ensure data directory exists
mkdir -p data

# Check permissions
chmod 755 data
```

### Docker: Container Exits Immediately

**Solution:**
```bash
# Check logs
docker-compose logs backend

# Ensure all required env vars are set in .env file
docker-compose config  # Validates compose file and shows resolved variables
```

### CORS Errors

**Error:** Frontend cannot reach backend API

**Solution:**
```bash
# Add frontend URL to CORS_ORIGINS
export CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

---

## Security Checklist

Before deploying to production:

- [ ] All `SECRET_KEY` and `JWT_SECRET_KEY` are randomly generated (32+ bytes)
- [ ] No hardcoded secrets in source code
- [ ] `GEMINI_API_KEY` is set and valid
- [ ] `CORS_ORIGINS` is restricted to your frontend domain(s)
- [ ] Rate limiting is enabled (`RATE_LIMIT_ENABLED=true`)
- [ ] Database backups are configured
- [ ] HTTPS is enabled (use reverse proxy like Nginx or Traefik)
- [ ] Environment variables are stored securely (not in Git)

---

## Performance Optimization

### Production Settings

```bash
# Use production WSGI server (gunicorn is included in requirements.txt)
gunicorn --bind 0.0.0.0:5000 --workers 4 server.start:app

# Enable production mode
FLASK_ENV=production

# Optimize Next.js build
npm run build
npm start
```

### Scaling

- **Horizontal scaling**: Run multiple backend instances behind a load balancer
- **Database**: Migrate from SQLite to PostgreSQL for multi-instance support
- **Caching**: Add Redis for session storage and rate limiting
- **CDN**: Serve frontend static assets via CDN (Cloudflare, CloudFront)

---

## Rollback Procedure

If deployment fails:

1. **Docker:**
   ```bash
   docker-compose down
   git checkout <previous-commit>
   docker-compose up --build -d
   ```

2. **Restore database backup** (if schema changed)

3. **Verify health check** returns 200 OK

---

For additional support, see:
- [Contributing Guide](CONTRIBUTING.md)
- [GitHub Issues](https://github.com/Nabhay/ColliopeIDE/issues)
