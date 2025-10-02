const axios = require('axios');
const config = require('./config');

async function setupBot() {
  console.log('🔧 Configurando Telegram Bot...');
  
  try {
    // Configurar comandos do bot
    const commands = [
      { command: 'start', description: 'Iniciar bot' },
      { command: 'help', description: 'Ajuda' },
      { command: 'dashboard', description: 'Ver métricas do sistema' },
      { command: 'criar_tarefa', description: 'Criar nova tarefa' },
      { command: 'listar_tarefas', description: 'Ver tarefas ativas' },
      { command: 'alertas', description: 'Ver alertas ativos' },
      { command: 'relatorio', description: 'Gerar relatório' }
    ];

    const setCommandsUrl = `https://api.telegram.org/bot${config.BOT_TOKEN}/setMyCommands`;
    await axios.post(setCommandsUrl, { commands });
    
    console.log('✅ Comandos configurados com sucesso!');
    
    // Obter informações do bot
    const botInfoUrl = `https://api.telegram.org/bot${config.BOT_TOKEN}/getMe`;
    const botInfo = await axios.get(botInfoUrl);
    
    console.log(`🤖 Bot: @${botInfo.data.result.username}`);
    console.log(`📱 Nome: ${botInfo.data.result.first_name}`);
    console.log(`🆔 ID: ${botInfo.data.result.id}`);
    
    // Configurar descrição do bot
    const description = `🤖 Traffic Ops Bot

Sistema operacional para gestão de campanhas Meta Ads.

📋 Funcionalidades:
• Criar e gerenciar tarefas
• Ver métricas em tempo real
• Receber alertas automáticos
• Gerar relatórios

💡 Digite /help para ver todos os comandos.`;
    
    const setDescriptionUrl = `https://api.telegram.org/bot${config.BOT_TOKEN}/setMyDescription`;
    await axios.post(setDescriptionUrl, { description });
    
    console.log('✅ Descrição configurada!');
    
    // Testar conexão com API do sistema
    try {
      const systemHealth = await axios.get(`${config.SYSTEM_API_URL.replace('/api', '')}/api/test`);
      console.log('✅ Conexão com sistema principal: OK');
    } catch (error) {
      console.log('⚠️ Sistema principal não está rodando ou não acessível');
    }
    
    console.log('\n🎉 Setup concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Adicione usuários autorizados no arquivo .env');
    console.log('2. Execute: npm start');
    console.log('3. Teste o bot enviando /start');
    
  } catch (error) {
    console.error('❌ Erro no setup:', error.response?.data || error.message);
  }
}

// Executar setup
setupBot();

