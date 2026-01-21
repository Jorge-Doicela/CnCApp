# Docker Setup Guide - CNC Application

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd CnCApp
cp .env.docker .env
```

### 2. Configure Environment
Edit `.env` file and update:
- `POSTGRES_PASSWORD` - Set a secure password
- `JWT_SECRET` - Set a secure random string
- Other settings as needed

### 3. Start All Services
```bash
docker-compose up -d
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Frontend │  │ Backend  │  │Postgres││
│  │  Nginx   │  │ Node.js  │  │   DB   ││
│  │  :80     │  │  :3000   │  │ :5432  ││
│  └──────────┘  └──────────┘  └────────┘│
│       │             │             │     │
│       └─────────────┴─────────────┘     │
│              Docker Network             │
└─────────────────────────────────────────┘
```

---

## Services

### Frontend (Nginx + Angular)
- **Image**: Multi-stage build with nginx:alpine
- **Port**: 80 (configurable via `FRONTEND_PORT`)
- **Features**:
  - Production-optimized Angular build
  - Gzip compression enabled
  - Security headers configured
  - SPA routing support

### Backend (Node.js + Express)
- **Image**: Multi-stage build with node:20-alpine
- **Port**: 3000 (configurable via `BACKEND_PORT`)
- **Features**:
  - TypeScript compiled
  - Prisma ORM with auto-migrations
  - Health check endpoint
  - Non-root user for security

### Database (PostgreSQL)
- **Image**: postgres:15-alpine
- **Port**: 5432 (configurable via `POSTGRES_PORT`)
- **Features**:
  - Persistent volume for data
  - Health checks
  - Automatic initialization

---

## Common Commands

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build
```

### Production

```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View resource usage
docker stats

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

### Database Management

```bash
# Access PostgreSQL CLI
docker exec -it cnc-postgres psql -U postgres -d cnc_db

# Backup database
docker exec cnc-postgres pg_dump -U postgres cnc_db > backup.sql

# Restore database
docker exec -i cnc-postgres psql -U postgres cnc_db < backup.sql

# View database logs
docker-compose logs postgres
```

### Maintenance

```bash
# Remove all containers and volumes (DESTRUCTIVE)
docker-compose down -v

# Clean up unused images
docker image prune -a

# View disk usage
docker system df

# Clean everything (CAREFUL!)
docker system prune -a --volumes
```

---

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `POSTGRES_PASSWORD` | Database password | `postgres` | `MySecurePass123!` |
| `JWT_SECRET` | JWT signing key | - | `random-secret-key-here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_DB` | Database name | `cnc_db` |
| `POSTGRES_PORT` | Database port | `5432` |
| `BACKEND_PORT` | Backend API port | `3000` |
| `FRONTEND_PORT` | Frontend port | `80` |
| `NODE_ENV` | Environment | `production` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |

---

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3000/health  # Backend
curl http://localhost/health        # Frontend
```

---

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Check if ports are in use
netstat -ano | findstr :80
netstat -ano | findstr :3000
netstat -ano | findstr :5432
```

### Database connection issues

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec cnc-postgres pg_isready -U postgres
```

### Frontend not loading

```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Check nginx logs
docker-compose logs frontend

# Verify build completed
docker exec cnc-frontend ls -la /usr/share/nginx/html
```

### Backend API errors

```bash
# Check backend logs
docker-compose logs backend

# Verify Prisma migrations
docker exec cnc-backend npx prisma migrate status

# Restart backend
docker-compose restart backend
```

---

## Security Best Practices

### Production Deployment

1. **Change default passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Use environment-specific configs**
   - Never commit `.env` files
   - Use Docker secrets for sensitive data
   - Enable HTTPS with reverse proxy

3. **Regular updates**
   ```bash
   # Update base images
   docker-compose pull
   docker-compose up -d --build
   ```

4. **Monitor logs**
   ```bash
   # Set up log aggregation
   docker-compose logs -f | tee app.log
   ```

---

## Performance Optimization

### Resource Limits (Production)

The `docker-compose.prod.yml` includes:
- CPU limits per service
- Memory limits per service
- Log rotation configuration

### Build Optimization

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Build with no cache
docker-compose build --no-cache
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Push
  run: |
    docker-compose build
    docker-compose push
```

### Deployment

```bash
# Pull latest images
docker-compose pull

# Deploy with zero downtime
docker-compose up -d --no-deps --build backend
```

---

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec cnc-postgres pg_dump -U postgres cnc_db > backup_$DATE.sql
```

### Recovery

```bash
# Stop backend
docker-compose stop backend

# Restore database
docker exec -i cnc-postgres psql -U postgres cnc_db < backup.sql

# Start backend
docker-compose start backend
```

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Review documentation in `/docs`

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
