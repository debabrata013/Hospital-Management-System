@echo off
echo Preparing for clean build...

echo Cleaning build directories...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo Setting build environment variables...
set NEXT_STATIC_BUILD=true
set STATIC_BUILD=true
set NODE_ENV=production

echo Running Next.js build with standalone output...
call npx next build

echo Build completed! Your application files are in .next/standalone
echo To deploy, copy the following directories:
echo   - .next/standalone/
echo   - .next/static/ to .next/standalone/.next/static/
echo   - public/ to .next/standalone/public/

pause