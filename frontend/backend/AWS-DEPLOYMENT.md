# AWS Deployment Guide - Structure Guard API

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌─────────────────────▼────────────────────────────────────┐
│         Application Load Balancer (ALB)                  │
│              (Port 443/80)                               │
└──────────────────┬──────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────────────┐      ┌────────▼───────┐
│ ECS Cluster    │      │  Auto Scaling  │
│ (Fargate)      │      │    Group       │
│                │      │                │
│ ┌────────────┐ │      └────────────────┘
│ │ Container  │ │
│ │ Task (API) │ │
│ └────────────┘ │
└────────┬───────┘
         │
    ┌────▼─────────────────┐
    │  RDS PostgreSQL      │
    │  (with PostGIS)      │
    │  Multi-AZ failover   │
    └──────────────────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Docker installed locally
- AWS credentials configured

## Step 1: Prepare Container Image

### Create AWS ECR Repository

```bash
# Set AWS region
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Create ECR repository
aws ecr create-repository \
  --repository-name structure-guard-api \
  --region $AWS_REGION

# Enable image scanning
aws ecr put-image-scanning-configuration \
  --repository-name structure-guard-api \
  --image-scanning-configuration scanOnPush=true \
  --region $AWS_REGION
```

### Build and Push Image

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Build image
docker build -t structure-guard-api:latest .

# Tag for ECR
docker tag structure-guard-api:latest \
  $ECR_REGISTRY/structure-guard-api:latest

# Push to ECR
docker push $ECR_REGISTRY/structure-guard-api:latest

# View pushed images
aws ecr describe-images \
  --repository-name structure-guard-api \
  --region $AWS_REGION
```

## Step 2: Setup RDS Database

### Create PostgreSQL Instance

```bash
# Variables
export DB_INSTANCE_ID="structure-guard-db"
export DB_ALLOCATED_STORAGE=20
export DB_ENGINE_VERSION="17.1"
export DB_INSTANCE_CLASS="db.t3.micro"  # t3.small for production
export DB_MASTER_USERNAME="structure_guard"
export DB_MASTER_PASSWORD="ChangeMe123!@#"  # Use AWS Secrets Manager

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier $DB_INSTANCE_ID \
  --db-instance-class $DB_INSTANCE_CLASS \
  --engine postgres \
  --engine-version $DB_ENGINE_VERSION \
  --master-username $DB_MASTER_USERNAME \
  --master-user-password "$DB_MASTER_PASSWORD" \
  --allocated-storage $DB_ALLOCATED_STORAGE \
  --storage-type gp3 \
  --storage-encrypted \
  --enable-cloudwatch-logs-exports postgresql \
  --enable-iam-database-authentication \
  --multi-az \
  --region $AWS_REGION

# Wait for database to be available
aws rds wait db-instance-available \
  --db-instance-identifier $DB_INSTANCE_ID \
  --region $AWS_REGION

# Get database endpoint
aws rds describe-db-instances \
  --db-instance-identifier $DB_INSTANCE_ID \
  --region $AWS_REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### Enable PostGIS Extension

```bash
# Get endpoint
export DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier $DB_INSTANCE_ID \
  --region $AWS_REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Connect and enable PostGIS
psql -h $DB_ENDPOINT \
  -U $DB_MASTER_USERNAME \
  -d postgres \
  -c "CREATE DATABASE structure_guard;"

psql -h $DB_ENDPOINT \
  -U $DB_MASTER_USERNAME \
  -d structure_guard \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Verify installation
psql -h $DB_ENDPOINT \
  -U $DB_MASTER_USERNAME \
  -d structure_guard \
  -c "SELECT postgis_version();"
```

### Store Credentials in AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name structure-guard/rds/master-user \
  --description "RDS Master User Password" \
  --secret-string "{\"username\":\"${DB_MASTER_USERNAME}\",\"password\":\"${DB_MASTER_PASSWORD}\"}" \
  --region $AWS_REGION

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id structure-guard/rds/master-user \
  --region $AWS_REGION
```

## Step 3: Create ECS Resources

### Create ECS Cluster

```bash
export CLUSTER_NAME="structure-guard-cluster"

aws ecs create-cluster \
  --cluster-name $CLUSTER_NAME \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --region $AWS_REGION
```

### Create CloudWatch Log Group

```bash
export LOG_GROUP="/ecs/structure-guard-api"

aws logs create-log-group \
  --log-group-name $LOG_GROUP \
  --region $AWS_REGION

# Set retention to 7 days
aws logs put-retention-policy \
  --log-group-name $LOG_GROUP \
  --retention-in-days 7 \
  --region $AWS_REGION
```

### Create ECS Task Execution Role

```bash
# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRoleStructureGuard \
  --assume-role-policy-document file://trust-policy.json \
  --region $AWS_REGION

# Attach policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRoleStructureGuard \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Add Secrets Manager permissions
aws iam put-role-policy \
  --role-name ecsTaskExecutionRoleStructureGuard \
  --policy-name SecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:*:*:secret:structure-guard/*"
      }
    ]
  }' \
  --region $AWS_REGION
```

### Create ECS Task Definition

```bash
# Create task definition file
cat > task-definition.json << 'EOF'
{
  "family": "structure-guard-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRoleStructureGuard",
  "containerDefinitions": [
    {
      "name": "structure-guard-api",
      "image": "REGISTRY/structure-guard-api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/structure-guard-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "API_HOST",
          "value": "0.0.0.0"
        },
        {
          "name": "API_PORT",
          "value": "8000"
        },
        {
          "name": "API_ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "CORS_ORIGINS",
          "value": "https://app.example.com,https://admin.example.com"
        },
        {
          "name": "LOG_LEVEL",
          "value": "INFO"
        },
        {
          "name": "POSTGRES_HOST",
          "value": "structure-guard-db.xxxxxx.us-east-1.rds.amazonaws.com"
        },
        {
          "name": "POSTGRES_PORT",
          "value": "5432"
        },
        {
          "name": "POSTGRES_DB",
          "value": "structure_guard"
        }
      ],
      "secrets": [
        {
          "name": "POSTGRES_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:structure-guard/rds/master-user:password::"
        },
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:structure-guard/database-url:::"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Update with your values
sed -i "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" task-definition.json
sed -i "s|REGISTRY|$ECR_REGISTRY|g" task-definition.json

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region $AWS_REGION
```

## Step 4: Create Application Load Balancer

### Create Load Balancer

```bash
# Create security group
export VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" \
  --query 'Vpcs[0].VpcId' --output text)

export ALB_SG=$(aws ec2 create-security-group \
  --group-name structure-guard-alb-sg \
  --description "ALB for Structure Guard API" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS (configure SSL certificate first)
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create ALB
export ALB_ARN=$(aws elbv2 create-load-balancer \
  --name structure-guard-alb \
  --subnets $(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text | tr '\t' ' ') \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Create target group
export TG_ARN=$(aws elbv2 create-target-group \
  --name structure-guard-api-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

### Create ECS Service

```bash
# Get subnets
export SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ' ')

# Create security group for ECS tasks
export ECS_SG=$(aws ec2 create-security-group \
  --group-name structure-guard-ecs-sg \
  --description "ECS tasks for Structure Guard API" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

# Allow traffic from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp \
  --port 8000 \
  --source-group $ALB_SG

# Create ECS service
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name structure-guard-api-service \
  --task-definition structure-guard-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS// /,}],securityGroups=$ECS_SG,assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=$TG_ARN,containerName=structure-guard-api,containerPort=8000 \
  --region $AWS_REGION
```

### Configure Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/structure-guard-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region $AWS_REGION

# Create scaling policy for CPU
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling-policy \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/structure-guard-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=70,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=300,ScaleInCooldown=300" \
  --region $AWS_REGION

# Create scaling policy for memory
aws application-autoscaling put-scaling-policy \
  --policy-name memory-scaling-policy \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/structure-guard-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=80,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization},ScaleOutCooldown=300,ScaleInCooldown=300" \
  --region $AWS_REGION
```

## Step 5: Configure DNS (Route 53)

```bash
# Get ALB DNS name
export ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

# Get hosted zone ID
export HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name example.com \
  --query 'HostedZones[0].Id' \
  --output text)

# Create alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

## Step 6: Configure SSL/TLS

### Request Certificate from ACM

```bash
aws acm request-certificate \
  --domain-name api.example.com \
  --subject-alternative-names "*.api.example.com" \
  --validation-method DNS \
  --region $AWS_REGION
```

### Add HTTPS Listener

```bash
export CERT_ARN=$(aws acm list-certificates \
  --region $AWS_REGION \
  --query 'CertificateSummaryList[0].CertificateArn' \
  --output text)

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

## Step 7: Setup Monitoring

### Create CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name structure-guard-api-high-cpu \
  --alarm-description "Alert when CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:alerts

# Task count alarm
aws cloudwatch put-metric-alarm \
  --alarm-name structure-guard-api-low-task-count \
  --alarm-description "Alert when task count is low" \
  --metric-name RunningCount \
  --namespace AWS/ECS \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:alerts
```

### Create CloudWatch Dashboard

```bash
aws cloudwatch put-dashboard \
  --dashboard-name StructureGuardAPI \
  --dashboard-body file://dashboard.json
```

## Step 8: Backup and Disaster Recovery

### RDS Backup Configuration

```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier $DB_INSTANCE_ID \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --apply-immediately

# Create DB snapshot
aws rds create-db-snapshot \
  --db-instance-identifier $DB_INSTANCE_ID \
  --db-snapshot-identifier structure-guard-db-snapshot-$(date +%Y%m%d)
```

## Verification Checklist

- [ ] ECR repository created and image pushed
- [ ] RDS instance created and PostGIS installed
- [ ] ECS cluster created with Fargate capacity
- [ ] Task definition registered successfully
- [ ] Service running with desired task count
- [ ] Load balancer health checks passing
- [ ] ALB DNS name resolving
- [ ] HTTPS certificate valid
- [ ] Auto-scaling policies active
- [ ] CloudWatch alarms configured
- [ ] Monitoring dashboard created
- [ ] Backups enabled and tested

## Troubleshooting

### Task Failed to Start
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks <task-id> \
  --region $AWS_REGION

# View container logs
aws logs tail /ecs/structure-guard-api --follow
```

### Database Connection Timeout
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids $ECS_SG

# Test connection from ECS task
# Execute command in running task
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task <task-id> \
  --container structure-guard-api \
  --interactive \
  --command "/bin/bash"
```

### Load Balancer Health Checks Failing
```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn $TG_ARN

# Verify API endpoint
curl http://<task-ip>:8000/health
```

## Cost Estimation (Monthly)

| Service | Configuration | Estimated Cost |
|---------|---------------|-----------------|
| ECS | 2 tasks × 256 CPU × 512 MB | $15-25 |
| RDS | db.t3.small × Multi-AZ | $80-100 |
| ALB | 1 load balancer + data | $15-20 |
| Data Transfer | Minimal | $5-10 |
| CloudWatch Logs | 1GB/month | $5 |
| **Total** | | **$120-160** |

## References

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PostgreSQL.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
