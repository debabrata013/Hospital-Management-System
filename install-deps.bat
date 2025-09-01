@echo off
echo Installing missing type definitions...
powershell -Command "& {Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; npm install --save-dev @types/d3-color @types/d3-path @types/ms --force}"
echo Installation complete.
pause
