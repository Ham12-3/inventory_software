# 🐳 Docker Setup for Inventory Management System

This Docker setup completely eliminates Python version compatibility issues by using a controlled environment.

## Prerequisites

- Docker Desktop installed and running
- Git (to clone/download the project)

## Quick Start

### Windows
```cmd
docker-start.bat
```

### Linux/macOS
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Manual Start
```bash
docker-compose up --build
```

## What Docker Does for Us

✅ **Solves Python 3.13 Issues**: Uses Python 3.11 in container  
✅ **No Manual Dependencies**: All packages install automatically  
✅ **Consistent Environment**: Same setup on any machine  
✅ **No Virtual Environment**: Docker handles isolation  
✅ **Fast Compilation**: Pre-built base images  

## Services

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

## Available Commands

```bash
# Start services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart a service
docker-compose restart backend

# Run commands in container
docker-compose exec backend python -c "print('Hello from container!')"
```

## Development Workflow

1. **Code Changes**: Edit files normally - changes sync automatically
2. **Backend Changes**: Container auto-reloads (FastAPI dev mode)
3. **Frontend Changes**: Container auto-reloads (Next.js dev mode)
4. **New Dependencies**: 
   - Add to `app/backend/requirements.txt`
   - Run `docker-compose up --build`

## Database

- **Default**: SQLite (no setup needed)
- **File Location**: `./app/backend/data/inventory.db`
- **PostgreSQL**: Uncomment postgres service in `docker-compose.yml`

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
docker-compose down
# Or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# Clean rebuild
docker-compose down
docker-compose up --build --force-recreate
```

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Reset Everything
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Production Notes

- Change `JWT_SECRET_KEY` in docker-compose.yml
- Use PostgreSQL instead of SQLite
- Set up proper environment variables
- Use Docker Swarm or Kubernetes for scaling

## File Structure
```
inventory_software/
├── Dockerfile              # Backend container definition
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore           # Files to exclude from builds
├── docker-start.bat        # Windows quick start
├── docker-start.sh         # Unix quick start
└── app/
    ├── backend/            # FastAPI application
    └── frontend/           # Next.js application
```

## Benefits Over Local Setup

| Local Setup | Docker Setup |
|-------------|--------------|
| Python version conflicts | ✅ Controlled Python 3.11 |
| Manual dependency install | ✅ Automatic installation |
| Platform-specific issues | ✅ Consistent across OS |
| Complex troubleshooting | ✅ Simple container reset |
| Multiple setup steps | ✅ Single command start | 