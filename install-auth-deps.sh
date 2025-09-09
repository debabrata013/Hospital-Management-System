#!/bin/bash

echo "🔐 Installing Authentication Dependencies..."

# Install JWT and crypto dependencies
npm install jose bcryptjs

# Install UI components for authentication
npm install @radix-ui/react-alert-dialog @radix-ui/react-avatar

# Install additional utilities
npm install sonner

echo "✅ Authentication dependencies installed successfully!"

echo "📋 Next Steps:"
echo "1. Update your .env.local file with JWT_SECRET"
echo "2. Test login with provided credentials"
echo "3. Access protected dashboards"
echo "4. Use logout functionality"

echo ""
echo "🔑 Test Credentials:"
echo "Super Admin: superadmin@hospital.com / SuperAdmin@123"
echo "Admin: admin@hospital.com / Admin@123"
echo "Doctor: dr.sharma@hospital.com / Doctor@123"
echo ""
echo "📖 See USER_CREDENTIALS.md for complete user list"
