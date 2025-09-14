@echo off
echo Preparing for deployment build...

echo Setting build environment variables...
set NEXT_STATIC_BUILD=true
set STATIC_BUILD=true
set NODE_ENV=production

echo Running Next.js build...
call npx next build

echo Build completed!
if exist .next\standalone (
  echo Your application is ready in .next\standalone
  echo To deploy, copy:
  echo  - .next\standalone\
  echo  - .next\static\ to .next\standalone\.next\static\
  echo  - public\ to .next\standalone\public\
) else (
  echo Check for any build errors in the console output
)

pause