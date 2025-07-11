# Newsor Admin Deployment

## Server Configuration

Your server setup:
- **Backend (Django)**: `192.168.1.36:8000`
- **Frontend (React)**: `192.168.1.36:3000` 
- **Admin (React)**: `192.168.1.36:4000` ← This application

## Quick Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the admin interface
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop the service
docker-compose down
```

The admin interface will be available at: **http://192.168.1.36:4000**

### Using Docker directly

```bash
# Build the image
docker build -t newsor-admin .

# Run the container
docker run -d \
  --name newsor-admin \
  -p 4000:80 \
  -e VITE_API_URL=http://192.168.1.36:8000 \
  -e VITE_GRAPHQL_URL=http://192.168.1.36:8000/graphql \
  newsor-admin

# Check logs
docker logs -f newsor-admin
```

### Development Mode

```bash
# Install dependencies
npm install

# Set environment variables
# Create .env file with:
# VITE_API_URL=http://192.168.1.36:8000
# VITE_GRAPHQL_URL=http://192.168.1.36:8000/graphql

# Start development server
npm run dev
```

## Network Configuration

The nginx configuration automatically:
- Proxies `/api/*` requests to `192.168.1.36:8000/api/*`
- Proxies `/graphql` requests to `192.168.1.36:8000/graphql`
- Handles CORS headers for cross-origin requests
- Serves the React SPA with proper routing support

## Port Usage

| Service | Port | URL |
|---------|------|-----|
| Backend | 8000 | http://192.168.1.36:8000 |
| Frontend | 3000 | http://192.168.1.36:3000 |
| **Admin** | **4000** | **http://192.168.1.36:4000** |

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure your Django backend allows requests from the admin origin:

```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://192.168.1.36:3000",  # Frontend
    "http://192.168.1.36:4000",  # Admin
]

# Or for development only:
CORS_ALLOW_ALL_ORIGINS = True
```

### Network Issues
- Ensure all services can communicate on the `192.168.1.36` network
- Check firewall settings for ports 3000, 4000, and 8000
- Verify backend is accessible from admin container

### Container Issues
```bash
# Check container status
docker ps

# Check container logs
docker logs newsor-admin

# Access container shell
docker exec -it newsor-admin sh

# Test nginx config
docker exec newsor-admin nginx -t
```
