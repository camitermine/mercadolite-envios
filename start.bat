@echo off
setlocal
chcp 65001 >nul
title MercadoLite - lanzador

rem Todas las rutas son relativas a la carpeta donde está este archivo
cd /d "%~dp0"
set "ROOT=%~dp0"

echo.
echo  ==============================================
echo   MercadoLite + MercadoLite Envios
echo  ==============================================
echo.

rem ---- 1. Requisitos -------------------------------------------------------
where java >nul 2>nul
if errorlevel 1 (
  echo  [X] No se encontro Java. Instala el JDK 21: https://adoptium.net
  goto :fail
)
where node >nul 2>nul
if errorlevel 1 (
  echo  [X] No se encontro Node.js. Instala Node 22 o superior: https://nodejs.org
  goto :fail
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo  pnpm no esta instalado. Intentando habilitarlo con corepack...
  call corepack enable >nul 2>nul
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo  [X] No se pudo habilitar pnpm. Instalalo con:  npm install -g pnpm
    goto :fail
  )
)
echo  [OK] Java, Node y pnpm

rem ---- 2. Puertos libres ---------------------------------------------------
for %%P in (8080 5173 5174) do (
  netstat -ano | findstr /r /c:":%%P .*LISTENING" >nul
  if not errorlevel 1 (
    echo  [X] El puerto %%P ya esta en uso. Cerra lo que lo este usando o corre stop.bat
    goto :fail
  )
)
echo  [OK] Puertos 8080, 5173 y 5174 libres

rem ---- 3. Dependencias (solo la primera vez) -------------------------------
if not exist "envios\node_modules" (
  echo.
  echo  Instalando dependencias de Envios ^(React^)...
  pushd envios
  call pnpm install
  if errorlevel 1 ( popd & goto :fail )
  popd
)
if not exist "tienda\node_modules" (
  echo.
  echo  Instalando dependencias de la Tienda ^(PelelaJS^)...
  pushd tienda
  call pnpm install
  if errorlevel 1 ( popd & goto :fail )
  popd
)
echo  [OK] Dependencias instaladas

rem ---- 4. Levantar las tres apps, cada una en su ventana --------------------
rem El perfil "demo" carga ordenes y envios de ejemplo en el backend
set "SPRING_PROFILES_ACTIVE=demo"
echo.
echo  Levantando las apps (se abren tres ventanas)...
start "MercadoLite API 8080" /d "%ROOT%backend" cmd /k ""%ROOT%backend\gradlew.bat" bootRun"
start "MercadoLite Envios 5173" /d "%ROOT%envios" cmd /k pnpm dev
start "MercadoLite Tienda 5174" /d "%ROOT%tienda" cmd /k pnpm dev

rem ---- 5. Esperar al backend y abrir el navegador ---------------------------
echo  Esperando a que arranque la API (la primera vez Gradle descarga todo y puede tardar unos minutos)...
set /a TRIES=0
:wait
curl -s -o nul http://localhost:8080/carriers
if not errorlevel 1 goto :ready
set /a TRIES+=1
if %TRIES% geq 200 (
  echo  [X] La API no respondio. Revisa la ventana "MercadoLite API 8080".
  goto :fail
)
ping -n 3 127.0.0.1 >nul
goto :wait

:ready
echo  [OK] API lista en http://localhost:8080
start "" http://localhost:5174
start "" http://localhost:5173

echo.
echo  ----------------------------------------------
echo   Tienda (cliente)    http://localhost:5174
echo   Envios (operador)   http://localhost:5173
echo   API REST            http://localhost:8080
echo  ----------------------------------------------
echo   Para cerrar todo: stop.bat
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1
