@echo off
echo Building Hospital Management System with Static API support...

:: Set environment variables for build
set NEXT_STATIC_BUILD=true
set STATIC_BUILD=true
set NEXT_PHASE=phase-export

:: Run build
npx next build

echo Build completed!
pause