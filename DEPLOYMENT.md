# Deployment Guide for Painter Timesheet App

This guide will help you deploy the Painter Timesheet application on a Hostinger VPS.

## Prerequisites

1. A Hostinger VPS with Ubuntu installed
2. Domain name pointed to your VPS IP
3. SSH access to your VPS

## Initial Server Setup

1. SSH into your VPS:
```bash
ssh root@your-server-ip
```

2. Update system packages:
```bash
apt update && apt upgrade -y
```

3. Install required software:
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install Nginx
apt install -y nginx

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

## Database Setup

1. Secure MySQL installation:
```bash
mysql_secure_installation
```

2. Create database and user:
```sql
mysql -u root -p
CREATE DATABASE painter_timesheet;
CREATE USER 'painter_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON painter_timesheet.* TO 'painter_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

3. Import database schema:
```bash
mysql -u painter_user -p painter_timesheet < /var/www/painter-timesheet/backend/src/database/init.sql
```

## Application Deployment

1. Create application directory:
```bash
mkdir -p /var/www/painter-timesheet
cd /var/www/painter-timesheet
```

2. Clone repository:
```bash
git clone your-repository-url .
```

3. Install dependencies and build:
```bash
# Backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# Frontend
cd ../frontend
npm install
npm run build
```

4. Configure PM2:
```bash
cd /var/www/painter-timesheet
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Configuration

1. Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/painter-timesheet
```

2. Add the configuration (see nginx.conf in the repository)

3. Enable the site:
```bash
ln -s /etc/nginx/sites-available/painter-timesheet /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
systemctl restart nginx
```

## SSL Configuration

1. Obtain SSL certificate:
```bash
certbot --nginx -d your-domain.com
```

## Environment Setup

1. Configure backend environment variables:
```bash
nano /var/www/painter-timesheet/backend/.env
```

Add the following with your values:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret
DB_HOST=localhost
DB_USER=painter_user
DB_PASSWORD=your_strong_password
DB_NAME=painter_timesheet
CORS_ORIGIN=https://your-domain.com
```

## Maintenance and Monitoring

1. View logs:
```bash
# Application logs
pm2 logs

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

2. Restart services:
```bash
# Restart application
pm2 restart all

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql
```

## Backup Setup

1. Create backup directory:
```bash
mkdir -p /var/backups/painter-timesheet
```

2. Create backup script:
```bash
nano /root/backup-painter.sh
```

Add the following content:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/painter-timesheet"

# Database backup
mysqldump -u painter_user -p'your_password' painter_timesheet > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Application backup
tar -czf "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" /var/www/painter-timesheet

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -exec rm {} \;
```

3. Make script executable and set up cron job:
```bash
chmod +x /root/backup-painter.sh
crontab -e
```

Add this line to run backup daily at 2 AM:
```
0 2 * * * /root/backup-painter.sh
```

## Security Considerations

1. Configure UFW firewall:
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

2. Set up fail2ban:
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## Troubleshooting

1. Check application status:
```bash
pm2 status
pm2 logs
```

2. Check Nginx status:
```bash
systemctl status nginx
nginx -t
```

3. Check MySQL status:
```bash
systemctl status mysql
```

4. View error logs:
```bash
tail -f /var/www/painter-timesheet/backend/logs/error.log
```
