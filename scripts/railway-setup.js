#!/usr/bin/env node

/**
 * Script de configuração para Railway
 * Executa verificações e configurações iniciais
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Traffic Ops para Railway...\n');

// Verificar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'MONGODB_URI',
  'META_APP_ID',
  'META_APP_SECRET',
  'TELEGRAM_BOT_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nConfigure essas variáveis no painel da Railway.');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas');

// Verificar se o build foi feito
const buildPath = path.join(__dirname, '..', '.next');
if (!fs.existsSync(buildPath)) {
  console.log('📦 Executando build...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído');
  } catch (error) {
    console.error('❌ Erro no build:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Build já existe');
}

// Verificar conectividade com MongoDB
async function testMongoConnection() {
  try {
    const mongoose = require('mongoose');
    console.log('🔌 Testando conexão com MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Conexão com MongoDB estabelecida');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    process.exit(1);
  }
}

// Verificar API do Telegram
async function testTelegramAPI() {
  try {
    const axios = require('axios');
    console.log('🤖 Testando API do Telegram...');
    
    const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
    
    if (response.data.ok) {
      console.log(`✅ Bot configurado: @${response.data.result.username}`);
    } else {
      throw new Error('Resposta inválida da API do Telegram');
    }
  } catch (error) {
    console.error('❌ Erro ao testar API do Telegram:', error.message);
    process.exit(1);
  }
}

// Executar verificações
async function runChecks() {
  await testMongoConnection();
  await testTelegramAPI();
  
  console.log('\n🎉 Sistema configurado com sucesso para Railway!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no painel da Railway');
  console.log('2. Faça o deploy do sistema principal');
  console.log('3. Faça o deploy do bot do Telegram');
  console.log('4. Configure o webhook do Telegram');
  console.log('\n📖 Consulte DEPLOY.md para instruções detalhadas');
}

runChecks().catch(error => {
  console.error('❌ Erro durante a configuração:', error);
  process.exit(1);
});



