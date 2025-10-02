@echo off
echo ========================================
echo  Git Commit e Push - Operacional
echo ========================================
echo.
echo Pressione qualquer tecla para iniciar...
pause >nul
echo.

REM Navegar para a pasta raiz do projeto
cd /d "%~dp0"
echo Diretorio atual: %CD%
echo.

echo [1/4] Verificando Git...
where git >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Git nao encontrado!
    echo.
    echo Solucao:
    echo 1. Baixe o Git: https://git-scm.com/download/win
    echo 2. Instale com as opcoes padrao
    echo 3. Reinicie este arquivo
    echo.
    pause
    exit /b 1
)
echo Git encontrado! OK
echo.

echo [2/4] Adicionando arquivos...
git add -A
if errorlevel 1 (
    echo ERRO ao adicionar arquivos!
    pause
    exit /b 1
)
echo Arquivos adicionados! OK
echo.

echo [3/4] Fazendo commit...
git commit -m "Preparar para deploy Railway - Sistema + Bot"
if errorlevel 1 (
    echo ERRO ao fazer commit!
    pause
    exit /b 1
)
echo Commit realizado! OK
echo.

echo [4/4] Fazendo push para GitHub...
git push origin main
if errorlevel 1 (
    echo ERRO ao fazer push!
    pause
    exit /b 1
)
echo Push concluido! OK
echo.

echo ========================================
echo  SUCESSO!
echo ========================================
echo  Deploy automatico no Railway vai iniciar!
echo  Aguarde 3-5 minutos...
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
