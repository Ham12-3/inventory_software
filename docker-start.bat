@echo off
echo 🐳 Starting Inventory Management System with Docker
echo ================================================

echo 📦 Building and starting containers...
docker-compose up --build

echo.
echo 🎉 Services started!
echo 📍 Backend API: http://localhost:8000
echo 📍 API Documentation: http://localhost:8000/docs
echo 📍 Frontend: http://localhost:3000
echo.
echo To stop: docker-compose down
pause 