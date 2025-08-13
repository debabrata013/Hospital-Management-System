# 🚀 Hostinger Deployment Checklist

## Pre-Deployment Requirements

### ✅ Hostinger Account Setup
- [ ] VPS or Cloud hosting plan (recommended)
- [ ] Domain name configured
- [ ] SSH access enabled
- [ ] Node.js support confirmed

### ✅ Database Setup
- [ ] MongoDB Atlas account created (or local MongoDB)
- [ ] Database connection string ready
- [ ] Database user with proper permissions

### ✅ Environment Configuration
- [ ] `.env.production` file created
- [ ] All environment variables configured
- [ ] JWT secrets generated
- [ ] Email SMTP settings configured

## Deployment Steps

### 1. Server Preparation
```bash
# Connect to your Hostinger VPS
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx (if not installed)
sudo apt install nginx -y
```

### 2. Project Upload
```bash
# Option A: Upload via SCP/FileZilla
# Upload your project folder to /var/www/hospital-management

# Option B: Clone from Git
git clone your-repository-url /var/www/hospital-management
cd /var/www/hospital-management
```

### 3. Application Setup
```bash
# Run the setup script
./hostinger-setup.sh

# Or manually:
npm install --legacy-peer-deps
npm run build
```

### 4. Process Management
```bash
# Start with PM2
pm2 start npm --name "arogya-hospital" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hospital

# Enable the site
sudo ln -s /etc/nginx/sites-available/hospital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## Post-Deployment Verification

### ✅ Application Health Check
- [ ] Website loads at your domain
- [ ] Login functionality works
- [ ] Database connection successful
- [ ] File uploads working
- [ ] API endpoints responding

### ✅ Performance Check
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness verified
- [ ] All routes accessible

### ✅ Security Check
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database access restricted
- [ ] File permissions correct

## Maintenance Commands

```bash
# View application logs
pm2 logs arogya-hospital

# Restart application
pm2 restart arogya-hospital

# Update application
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart arogya-hospital

# Monitor application
pm2 monit
```

## Troubleshooting

### Common Issues:
1. **Port 3000 already in use**: Change PORT in .env.production
2. **Database connection failed**: Check MONGODB_URI
3. **Build errors**: Ensure all dependencies installed
4. **Permission denied**: Check file permissions (chmod 755)

### Support Contacts:
- Hostinger Support: [Hostinger Help Center](https://support.hostinger.com)
- Project Developer: [Your Contact Information]

---

**🏥 आरोग्य अस्पताल Management System**  
**Built with ❤️ for Indian Healthcare**
