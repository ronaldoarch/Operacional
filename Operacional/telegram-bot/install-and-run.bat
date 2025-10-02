@echo off
echo 🤖 Instalando Traffic Ops Telegram Bot...
echo.

echo 📦 Instalando dependências...
call npm install

echo.
echo 🔧 Configurando bot...
call npm run setup

echo.
echo 🚀 Iniciando bot...
echo.
echo ✅ Bot iniciado! Agora você pode usar o Telegram Bot.
echo 📱 Envie /start para @ReidoblackBot
echo.
pause

