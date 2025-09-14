@echo off
echo Cleaning build directories...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo Setting build environment...
set NEXT_STATIC_BUILD=true
set STATIC_BUILD=true
set NODE_ENV=production

echo Running Next.js build...
npx next build

echo Build completed!
pause