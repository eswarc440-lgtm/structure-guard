# Structure Guard API - Deployment Checklist

## Pre-Deployment Verification

### Code & Configuration
- [x] requirements.txt created with pinned versions
- [x] .env.example created (no real credentials)
- [x] .env.development created for local dev
- [x] Database configuration uses environment variables
- [x] CORS configuration uses environment variables
- [x] ML model path uses environment variable
- [x] Logging configured and structured
- [x] Health endpoint implemented with database check
- [x] No hardcoded credentials found in codebase
- [x] No hardcoded IP addresses (127.0.0.1 removed)
- [x] Application imports successfully
- [x] Async support properly configured

### Docker & Containerization
- [x] Dockerfile created (multi-stage build)
- [x] Dockerfile uses non-root user (appuser)
- [x] Dockerfile includes health check
- [x] docker-compose.yml updated with backend service
- [x] docker-compose includes health checks
- [x] docker-compose uses environment variables
- [x] Networks configured for service communication
- [x] Volumes configured for data persistence
- [x] Database service properly configured

### Environment Variables Required

| Variable | Example Value | Required | Secret |
|----------|---------------|----------|--------|
| `DATABASE_URL` | `postgresql+psycopg2://user:pass@host:5433/dbname` | ✓ | ✓ |
| `POSTGRES_HOST` | `localhost` or `postgis` | ✓ | ✗ |
| `POSTGRES_PORT` | `5433` | ✓ | ✗ |
| `POSTGRES_USER` | `structure_guard` | ✓ | ✗ |
| `POSTGRES_PASSWORD` | `secure_password_here` | ✓ | ✓ |
| `POSTGRES_DB` | `structure_guard` | ✓ | ✗ |
| `API_HOST` | `0.0.0.0` | ✓ | ✗ |
| `API_PORT` | `8000` | ✓ | ✗ |
| `API_ENVIRONMENT` | `production` | ✓ | ✗ |
| `CORS_ORIGINS` | `https://app.com,https://admin.app.com` | ✓ | ✗ |
| `ML_MODEL_PATH` | `app/ml/models/risk_model.joblib` | ✓ | ✗ |
| `LOG_LEVEL` | `INFO` | ✓ | ✗ |

### Local Development Testing

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set environment variables
export $(cat .env.development | xargs)

# 3. Start API
uvicorn app.main:app --reload

# 4. Test health endpoint
curl http://localhost:8000/health

# 5. Test API docs
# Visit http://localhost:8000/docs
```

### Docker Testing

```bash
# 1. Build image
docker build -t structure-guard-api:latest .

# 2. Start services
docker-compose up -d

# 3. Wait for services to be healthy
docker-compose ps

# 4. Test health endpoint
curl http://localhost:8000/health

# 5. View logs
docker-compose logs api

# 6. Stop services
docker-compose down
```

## Production Deployment Steps

### 1. Prepare Secrets
- [ ] Generate secure database password
- [ ] Generate secure API secret key (if needed)
- [ ] Store credentials in secure vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Document credential rotation policy

### 2. Configure Environment
- [ ] Set all required environment variables
- [ ] Set `API_ENVIRONMENT=production`
- [ ] Set `LOG_LEVEL=WARNING` or `INFO`
- [ ] Configure `CORS_ORIGINS` for production domain
- [ ] Verify `DATABASE_URL` points to production database

### 3. Database Setup
- [ ] Provision PostgreSQL 17+ with PostGIS
- [ ] Create database `structure_guard`
- [ ] Create user `structure_guard` with secure password
- [ ] Verify connection from application server
- [ ] Test database connectivity

### 4. Build & Push Image
- [ ] Build Docker image: `docker build -t structure-guard-api:latest .`
- [ ] Tag for registry: `docker tag structure-guard-api:latest <registry>/structure-guard-api:latest`
- [ ] Scan image for vulnerabilities
- [ ] Push to container registry

### 5. Deploy Application
- [ ] Copy `.env.example` to deployment documentation
- [ ] Configure environment variables in deployment system
- [ ] Deploy container (ECS, Kubernetes, etc.)
- [ ] Verify health check passes
- [ ] Test API endpoints

### 6. Post-Deployment Verification
- [ ] Health check endpoint returns `status: healthy`
- [ ] Database connection working
- [ ] CORS headers present in responses
- [ ] Prediction endpoint returns valid results
- [ ] Analytics endpoints working
- [ ] Logs are being generated

### 7. Monitoring & Alerting
- [ ] Set up application monitoring
- [ ] Configure health check alerts
- [ ] Set up error rate alerts
- [ ] Monitor database connections
- [ ] Set up log aggregation
- [ ] Configure backup alerts

### 8. Security Review
- [ ] No secrets in logs or error messages
- [ ] SSL/TLS enabled on all endpoints
- [ ] Rate limiting configured (if needed)
- [ ] Input validation enabled
- [ ] CORS origins restricted to known domains
- [ ] Security headers configured

## Rollback Plan

If deployment fails:

1. **Immediate Actions**:
   - Stop new deployment
   - Keep previous version running
   - Notify team

2. **Investigation**:
   - Check application logs
   - Check database connectivity
   - Verify environment variables
   - Check resource availability

3. **Rollback**:
   ```bash
   docker-compose down
   docker pull <previous-image>
   docker-compose up -d
   ```

4. **Communication**:
   - Update incident status
   - Notify stakeholders
   - Schedule post-mortem

## Performance Baseline

Record baseline metrics after successful deployment:

- **Response Times**:
  - Health check: < 50ms
  - Infrastructure list: < 500ms
  - Prediction: < 1000ms
  
- **Database**:
  - Connection pool size: 10
  - Max overflow: 20
  - Connection timeout: 5s

- **Resource Usage**:
  - CPU: ~10% baseline
  - Memory: ~200MB baseline
  - Disk: ~1GB code + model

## Maintenance Tasks

### Daily
- [ ] Monitor error rates
- [ ] Check disk space
- [ ] Review logs for anomalies

### Weekly
- [ ] Review security logs
- [ ] Check for updates
- [ ] Verify backups completed

### Monthly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning

### Quarterly
- [ ] Major version updates
- [ ] Disaster recovery drill
- [ ] Architecture review

## Support Contacts

| Role | Contact | On-Call |
|------|---------|---------|
| DevOps | team@example.com | Yes |
| Database | dba@example.com | Yes |
| Security | security@example.com | No |
| Product | product@example.com | No |

## Documentation References

- [Deployment Guide](./README-DEPLOY.md)
- [API Documentation](./app/README.md)
- [Architecture](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Sign-Off

- **Prepared By**: _________________  Date: __________
- **Reviewed By**: _________________  Date: __________
- **Approved By**: _________________  Date: __________
