# Manual Setup Guide - Node.js Environment Fix

## Problem
Your Node.js environment is corrupted, preventing normal package installation and causing TypeScript errors.

## Solution Steps

### Step 1: Reinstall Node.js
1. Go to https://nodejs.org/
2. Download the latest LTS version (20.x or higher)
3. **Important**: During installation, check "Automatically install the necessary tools" option
4. Restart your computer after installation

### Step 2: Verify Installation
Open a new PowerShell window and run:
```powershell
node --version
npm --version
```
Both commands should return version numbers.

### Step 3: Clean Project Directory
Navigate to your project directory and run:
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

### Step 4: Install Dependencies
```powershell
npm install --force
```

### Step 5: Install Missing Type Definitions
```powershell
npm install --save-dev @types/node @types/react @types/react-dom @types/bcryptjs @types/jsonwebtoken @types/uuid @types/validator
```

### Step 6: Start Development Server
```powershell
npm run dev
```

## Alternative: Use Different Package Manager
If npm continues to fail, try using yarn:
```powershell
npm install -g yarn
yarn install
yarn dev
```

## Troubleshooting
- If you get permission errors, run PowerShell as Administrator
- Clear npm cache: `npm cache clean --force`
- Reset npm configuration: `npm config delete prefix`

## Verification
After successful installation, you should see:
- `node_modules` folder with thousands of files
- No TypeScript errors in your IDE
- Development server starting successfully on http://localhost:3000
