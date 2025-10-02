#!/bin/bash

# Script de configuração rápida para Railway
# Execute este script após configurar as variáveis de ambiente no Railway

echo "🚀 Traffic Ops - Setup Railway"
echo "================================"
echo ""

# Verificar se as variáveis essenciais estão configuradas
if [ -z "$MONGODB_URI" ]; then
    echo "❌ ERRO: MONGODB_URI não está configurada!"
    echo "Configure as variáveis de ambiente no painel do Railway"
    exit 1
fi

if [ -z "$META_APP_ID" ]; then
    echo "❌ ERRO: META_APP_ID não está configurada!"
    exit 1
fi

if [ -z "$META_APP_SECRET" ]; then
    echo "❌ ERRO: META_APP_SECRET não está configurada!"
    exit 1
fi

echo "✅ Variáveis essenciais configuradas"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build
echo "🔨 Fazendo build da aplicação..."
npm run build

echo ""
echo "✅ Setup concluído com sucesso!"
echo "Execute 'npm start' para iniciar o servidor"


