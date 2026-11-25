@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Cerrando MercadoLite...
taskkill /fi "WINDOWTITLE eq MercadoLite API 8080*" /t /f >nul 2>nul
taskkill /fi "WINDOWTITLE eq MercadoLite Envios 5173*" /t /f >nul 2>nul
taskkill /fi "WINDOWTITLE eq MercadoLite Tienda 5174*" /t /f >nul 2>nul

rem El daemon de Gradle queda vivo aunque se cierre la ventana: se lo frena aparte
call "%~dp0backend\gradlew.bat" -p "%~dp0backend" --stop >nul 2>nul

echo Listo.
timeout /t 2 >nul
