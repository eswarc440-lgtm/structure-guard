# Structure Guard API - Deployment Guide

## Overview

Structure Guard API is a FastAPI-based backend service for AI-powered infrastructure risk monitoring. This guide covers deployment preparation and containerization.

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for development)
- PostgreSQL 17+ with PostGIS extension
- Environment variables configured (see Configuration section)

## Environment Variables

### Required Variables

```
# Database Configuration
DATABASE_URL=postgresql+psycopg2://user:password@host:port/dbname
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=structure_guard
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=structure_guard

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_ENVIRONMENT=production|development|staging

# CORS Configuration
CORS_ORIGINS=https://example.com,https://app.example.com

# ML Model
ML_MODEL_PATH=app/ml/models/risk_model.joblib

# Logging
LOG_LEVEL=INFO|DEBUG|WARNING|ERROR
```

See `.env.example` for complete list of variables.

## Local Development

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd structure-guard-backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with local values
   ```

4. Load environment:
   ```bash
   export $(cat .env.development | xargs)
   # or on Windows: type .env.development | findstr /v "^#" | findstr /v "^$"
   ```

5. Run the application:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. Access API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   - Health Check: http://localhost:8000/health

## Docker Deployment

### Build Image

```bash
docker build -t structure-guard-api:latest .
```

### Run Container

```bash
docker run -p 8000:8000 \
  --env-file .env.development \
  --name structure-guard-api \
  structure-guard-api:latest
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Database Setup

### Initialize Schema

The application automatically creates tables on startup if they don't exist.

### Connection String Format

```
postgresql+psycopg2://user:password@host:port/database
```

For Docker Compose, use service name as hostname:
```
postgresql+psycopg2://structure_guard:password@postgis:5432/structure_guard
```

## Health Check

### Endpoint

- **URL**: `/health`
- **Method**: `GET`
- **Response**:

```json
{
  "status": "healthy",
  "service": "Structure Guard API",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected"
}
```

### Docker Health Check

The Dockerfile includes a built-in health check:

```bash
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)"
```

## CORS Configuration

### Setting Origins

Update `CORS_ORIGINS` environment variable with comma-separated URLs:

```
CORS_ORIGINS=https://app.example.com,https://admin.example.com,http://localhost:3000
```

### Wildcard Usage

For development only, you can use wildcard (NOT recommended for production):

```
CORS_ORIGINS=*
```

## Logging

### Log Levels

- `DEBUG`: Verbose logging for development
- `INFO`: General application information
- `WARNING`: Warning messages for potential issues
- `ERROR`: Error messages for failures

### Configure Log Level

```bash
export LOG_LEVEL=INFO
```

## ML Model Loading

### Model Path

The ML model is loaded from the path specified in `ML_MODEL_PATH` environment variable.

Default: `app/ml/models/risk_model.joblib`

### Error Handling

If the model file is not found, the application will:
1. Log an error with the missing path
2. Fail to start
3. Exit with an error status

Ensure the model file exists before deployment.

## Production Deployment Checklist

- [ ] Environment variables configured in production system
- [ ] Database credentials stored in secure vault (AWS Secrets Manager, etc.)
- [ ] CORS origins configured for production domain
- [ ] ML model file exists and is accessible
- [ ] Log level set to INFO or WARNING
- [ ] Health check endpoint verified
- [ ] Database connection tested
- [ ] API endpoints tested
- [ ] SSL/TLS configured (reverse proxy recommended)
- [ ] Rate limiting configured (if needed)
- [ ] Monitoring and alerting configured
- [ ] Backup strategy for database configured
- [ ] Docker image scanning completed (security)

## Deployment to AWS

### Using AWS Elastic Container Service (ECS)

1. **Push image to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag structure-guard-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/structure-guard-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/structure-guard-api:latest
   ```

2. **Create ECS Task Definition**:
   - Container image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/structure-guard-api:latest`
   - Port mappings: 8000:8000
   - Environment variables from AWS Secrets Manager

3. **Configure RDS for PostgreSQL**:
   - Engine: PostgreSQL 17
   - Add PostGIS extension
   - Configure security groups for ECS access

4. **Create ECS Service**:
   - Task definition: structure-guard-api
   - Launch type: FARGATE or EC2
   - Load balancer: Application Load Balancer (ALB)
   - Health check path: `/health`

### Using AWS Lambda + RDS

Not recommended for this workload (long-running API), use ECS instead.

### Using Elastic Beanstalk

1. **Create Dockerfile** (already provided)

2. **Create `.ebextensions/docker.config`**:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:docker:
       GuestPort: 8000
     aws:elasticbeanstalk:application:environment:
       DATABASE_URL: <RDS-connection-string>
   ```

3. **Deploy**:
   ```bash
   eb init -p docker structure-guard-api
   eb create production
   eb deploy
   ```

## Monitoring

### Application Metrics

- Request rate and latency
- Error rates by endpoint
- Database connection pool usage
- ML model prediction time

### Database Monitoring

- Connection count
- Slow queries
- Replication lag (if applicable)
- Disk usage

### Recommended Tools

- CloudWatch (AWS)
- Datadog
- New Relic
- Prometheus + Grafana

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all configuration
3. **Store credentials** in secure vault (AWS Secrets Manager, HashiCorp Vault)
4. **Enable HTTPS** with valid SSL certificate
5. **Use strong database passwords** (min 16 characters, mixed case, numbers, symbols)
6. **Restrict CORS origins** to known domains only
7. **Set appropriate log levels** (avoid logging sensitive data)
8. **Use non-root user** in Docker (already configured)
9. **Scan Docker images** for vulnerabilities
10. **Keep dependencies updated** regularly

## Troubleshooting

### Database Connection Failed

```
Error: could not translate host name "postgis" to address
```

**Solution**: Ensure postgis service is running and healthy

```bash
docker-compose ps
docker-compose logs postgis
```

### Model Not Found

```
FileNotFoundError: ML model not found at app/ml/models/risk_model.joblib
```

**Solution**: Verify model file exists and path is correct

```bash
ls -la app/ml/models/risk_model.joblib
export ML_MODEL_PATH=$(pwd)/app/ml/models/risk_model.joblib
```

### Health Check Failing

```
Health check failed: database disconnected
```

**Solution**: Verify database is running and connection string is correct

```bash
docker-compose logs api
# Check DATABASE_URL variable
echo $DATABASE_URL
```

### CORS Errors

```
Access-Control-Allow-Origin header missing
```

**Solution**: Add your frontend URL to CORS_ORIGINS

```bash
export CORS_ORIGINS=https://yourapp.com,http://localhost:3000
```

## Performance Tuning

### Database Connection Pool

Adjust in `docker-compose.yml` or environment:

```python
# In database.py
engine = create_engine(
    database_url,
    pool_size=20,          # Connections to keep open
    max_overflow=40,       # Additional connections allowed
    pool_recycle=3600,     # Recycle connections every hour
)
```

### API Workers

For production, use multiple workers:

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## Maintenance

### Backup Strategy

```bash
# Backup PostgreSQL database
pg_dump -h localhost -U structure_guard -d structure_guard > backup.sql

# Restore
psql -h localhost -U structure_guard -d structure_guard < backup.sql
```

### Updates

1. Test updates in staging environment
2. Backup database before updating
3. Update requirements.txt and rebuild Docker image
4. Deploy to production during maintenance window
5. Monitor application after deployment

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review error messages in application logs
3. Verify environment variables are set correctly
4. Check database connectivity
5. Verify ML model file exists

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
