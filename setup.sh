#!/bin/bash

# 🏥 Arogya Hospital Management System - Development Setup Script
# This script sets up the development environment for the hospital management system

echo "🏥 Setting up Arogya Hospital Management System..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  .env.local file not found!"
    echo "📝 Creating .env.local template..."
    
    cat > .env.local << EOL
# MongoDB Configuration
MONGODB_URI=mongodb+srv://pattnaikd833:WCpNo7zqKCZ7oLET@cluster0.zbyg6hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Database Name
DATABASE_NAME=arogya_hospital

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Application Settings
NODE_ENV=development
EOL
    
    echo "✅ .env.local template created"
    echo "🔧 Please update the environment variables as needed"
else
    echo "✅ .env.local file exists"
fi

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p backups
mkdir -p reports
mkdir -p temp

echo "✅ Directories created"

# Set up Git hooks (if .git exists)
if [ -d ".git" ]; then
    echo ""
    echo "🔧 Setting up Git hooks..."
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOL'
#!/bin/bash
# Pre-commit hook for Arogya Hospital Management System

echo "🔍 Running pre-commit checks..."

# Check for sensitive data
if grep -r "password\|secret\|key\|token" --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules .; then
    echo "❌ Potential sensitive data found in code!"
    echo "Please review and remove sensitive data before committing."
    exit 1
fi

# Check for patient data
if find . -name "*patient*" -o -name "*medical*" -type f | grep -v node_modules | grep -v .git; then
    echo "⚠️  Files with patient/medical data found!"
    echo "Please ensure no actual patient data is being committed."
    read -p "Continue with commit? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed"
EOL

    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks configured"
fi

# Test database connection
echo ""
echo "🔌 Testing database connection..."
if npm run dev &> /dev/null & 
then
    DEV_PID=$!
    sleep 5
    
    if curl -s http://localhost:3000/api/test-db > /dev/null; then
        echo "✅ Database connection test passed"
    else
        echo "⚠️  Database connection test failed"
        echo "Please check your MongoDB connection string"
    fi
    
    kill $DEV_PID 2>/dev/null
else
    echo "⚠️  Could not start development server for testing"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Review and update .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see your application"
echo "4. Check the database connection at http://localhost:3000/api/test-db"
echo ""
echo "📚 Documentation:"
echo "- README.md - Project overview"
echo "- DATABASE_SETUP.md - Database configuration"
echo "- MODELS_DOCUMENTATION.md - Database models"
echo "- GIT_WORKFLOW.md - Git workflow guidelines"
echo ""
echo "Happy coding! 🏥💻"
