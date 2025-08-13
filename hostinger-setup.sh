#!/bin/bash

echo "🏥 Hostinger Setup for Arogya Hospital Management System"
echo "=================================================="

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version || echo "❌ Node.js not found. Please install Node.js first."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create production environment
echo "⚙️ Setting up production environment..."
if [ ! -f .env.production ]; then
    echo "Creating .env.production from template..."
    cp .env.production.example .env.production
    echo "⚠️  Please edit .env.production with your actual values!"
fi

# Build the application
echo "🔨 Building production version..."
npm run build

# Install PM2 globally (if not installed)
echo "🔄 Installing PM2 process manager..."
npm list -g pm2 || npm install -g pm2

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your database and domain details"
echo "2. Run: pm2 start npm --name 'arogya-hospital' -- start"
echo "3. Configure your domain to point to this server"
echo "4. Set up SSL certificate"
echo ""
echo "Your hospital management system will be available at: http://your-domain.com"
