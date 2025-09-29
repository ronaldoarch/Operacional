require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

// Configurações
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8396159417:AAGgLAZDj2MPPfmrZvocRKozS7du6gpQ8hY';
const SYSTEM_API_URL = process.env.SYSTEM_API_URL || 'http://localhost:3000/api';
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS ? process.env.AUTHORIZED_USERS.split(',') : ['5767285166'];
const NODE_ENV = process.env.NODE_ENV || 'development';

// Criar bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Verificar se usuário está autorizado
function isAuthorized(userId) {
  return AUTHORIZED_USERS.length === 0 || AUTHORIZED_USERS.includes(userId.toString());
}

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  const welcomeMessage = `
🤖 *Traffic Ops Bot*

Bem-vindo ao sistema operacional!

📋 *Comandos disponíveis:*
/help - Ajuda
/criar_tarefa - Criar nova tarefa
/listar_tarefas - Ver tarefas
/dashboard - Métricas do sistema
/alertas - Ver alertas ativos
/relatorio - Relatório diário

💡 Digite /help para mais informações.
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  const helpMessage = `
📖 *Ajuda - Traffic Ops Bot*

🔹 *Criar Tarefa:*
/criar_tarefa "Título da tarefa" prioridade cliente:id
Exemplo: /criar_tarefa "Verificar conta PixRaspa" high cliente:1

📋 *Prioridades válidas:*
• low (baixa)
• medium (média) 
• high (alta)

🔹 *Listar Tarefas:*
/listar_tarefas cliente:id
/listar_tarefas status:pendente
/listar_tarefas (todas)

🔹 *Dashboard:*
/dashboard - Ver métricas principais

🔹 *Alertas:*
/alertas - Ver alertas ativos

🔹 *Relatório:*
/relatorio hoje
/relatorio semana

🔹 *Clientes:*
/clientes - Listar clientes disponíveis

💡 Use os botões interativos quando disponíveis!
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Comando /dashboard
bot.onText(/\/dashboard/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  try {
    // Buscar métricas do sistema
    const response = await axios.get(`${SYSTEM_API_URL}/dashboard/metrics`);
    const metrics = response.data.metrics;

    const dashboardMessage = `
📊 *Dashboard Operacional*

💰 *Total:* R$ ${(metrics.totalContractValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.000,00
📈 *MMR:* R$ ${(metrics.mmr / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.000,00
📉 *Taxa de Churn:* ${metrics.churnRate}%
👥 *Clientes:* ${metrics.totalClients}

📋 *Status Operacional:*
• PMT: ${metrics.pmt}
• PMEDT: ${metrics.pmedt}
• PB: ${metrics.pb}
• ONBOARDING: ${metrics.onboarding}

🔄 *Renovação:*
• Renovados: ${metrics.renewed}
• Não Renovados: ${metrics.notRenewed}
    `;

    bot.sendMessage(chatId, dashboardMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    bot.sendMessage(chatId, '❌ Erro ao carregar dashboard. Tente novamente.');
  }
});

// Comando /criar_tarefa
bot.onText(/\/criar_tarefa (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  try {
    const args = match[1].split(' ');
    const title = args[0].replace(/"/g, '');
    const priority = args[1] || 'medium';
    const clientId = args.find(arg => arg.startsWith('cliente:'))?.split(':')[1] || '1';

    // Primeiro, buscar uma conta real do cliente
    const accountsResponse = await axios.get(`${SYSTEM_API_URL}/meta/adaccounts?clientId=${clientId}`);
    const accounts = accountsResponse.data.accounts || [];
    
    if (accounts.length === 0) {
      bot.sendMessage(chatId, '❌ Nenhuma conta encontrada para este cliente. Configure as contas Meta primeiro.');
      return;
    }

    // Usar a primeira conta encontrada
    const targetAccount = accounts[0];

    const taskData = {
      accountId: targetAccount._id, // Usar o ID real da conta
      title: title,
      description: `Tarefa criada via Telegram Bot por usuário ${userId}`,
      priority: priority
    };

    // Criar tarefa via API do sistema
    const response = await axios.post(`${SYSTEM_API_URL}/accounts/add-task`, taskData);
    
    if (response.data.ok) {
      bot.sendMessage(chatId, `✅ Tarefa criada com sucesso!\n\n📋 *${title}*\n🎯 Prioridade: ${priority}\n👤 Cliente: ${clientId}\n🏢 Conta: ${targetAccount.name}`, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, '❌ Erro ao criar tarefa. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    bot.sendMessage(chatId, '❌ Erro ao criar tarefa. Verifique o formato do comando.\n\n💡 Use: /criar_tarefa "Título" prioridade cliente:id');
  }
});

// Comando /listar_tarefas
bot.onText(/\/listar_tarefas/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  try {
    // Buscar contas e suas tarefas
    const response = await axios.get(`${SYSTEM_API_URL}/meta/adaccounts?clientId=1`);
    const accounts = response.data.accounts || [];

    let tasksMessage = '📋 *Tarefas Ativas*\n\n';
    let hasTasks = false;

    accounts.forEach(account => {
      if (account.tasks && account.tasks.length > 0) {
        hasTasks = true;
        tasksMessage += `🏢 *${account.name}*\n`;
        account.tasks.forEach(task => {
          const status = task.status === 'pending' ? '⏳' : task.status === 'in_progress' ? '🔄' : '✅';
          const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
          tasksMessage += `${status} ${priority} ${task.title}\n`;
        });
        tasksMessage += '\n';
      }
    });

    if (!hasTasks) {
      tasksMessage += '📭 Nenhuma tarefa ativa encontrada.';
    }

    bot.sendMessage(chatId, tasksMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    bot.sendMessage(chatId, '❌ Erro ao carregar tarefas. Tente novamente.');
  }
});

// Comando /clientes
bot.onText(/\/clientes/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  try {
    // Buscar clientes do sistema
    const response = await axios.get(`${SYSTEM_API_URL}/clients`);
    const clients = response.data.clients || [];

    let clientsMessage = '👥 *Clientes Disponíveis*\n\n';
    
    if (clients.length === 0) {
      clientsMessage += '📭 Nenhum cliente encontrado.';
    } else {
      clients.forEach(client => {
        const status = client.status === 'running' ? '🟢' : 
                     client.status === 'paused' ? '🟡' : 
                     client.status === 'completed' ? '🔵' : '⚪';
        
        const contractValue = client.contractValue ? 
          (client.contractValue / 100).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }) : 'R$ 0,00';
        
        clientsMessage += `${status} *${client.name}*\n`;
        clientsMessage += `💰 Contrato: ${contractValue}\n`;
        clientsMessage += `👤 Responsável: ${client.responsible || 'N/A'}\n`;
        clientsMessage += `📊 Status: ${client.status}\n\n`;
      });
    }

    bot.sendMessage(chatId, clientsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    bot.sendMessage(chatId, '❌ Erro ao carregar clientes. Tente novamente.');
  }
});

// Comando /alertas
bot.onText(/\/alertas/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '❌ Você não está autorizado a usar este bot.');
    return;
  }

  try {
    // Buscar contas com saldo baixo
    const response = await axios.get(`${SYSTEM_API_URL}/meta/adaccounts?clientId=1`);
    const accounts = response.data.accounts || [];

    const lowBalanceAccounts = accounts.filter(account => 
      account.balance && account.balance < 5000 // Menos de R$ 50,00
    );

    let alertsMessage = '🚨 *Alertas Ativos*\n\n';

    if (lowBalanceAccounts.length === 0) {
      alertsMessage += '✅ Nenhum alerta ativo.';
    } else {
      lowBalanceAccounts.forEach(account => {
        const balance = (account.balance / 100).toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        });
        alertsMessage += `💰 *${account.name}*\nSaldo baixo: ${balance}\n\n`;
      });
    }

    bot.sendMessage(chatId, alertsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    bot.sendMessage(chatId, '❌ Erro ao carregar alertas. Tente novamente.');
  }
});

// Webhook endpoint para receber updates
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🤖 Telegram Bot rodando na porta ${PORT}`);
  console.log(`📱 Bot: @ReidoblackBot`);
  console.log(`🌐 Webhook: ${NODE_ENV === 'production' ? `https://your-bot-app.railway.app/webhook` : `http://localhost:${PORT}/webhook`}`);
  console.log(`🔧 Ambiente: ${NODE_ENV}`);
});

// Tratar erros
bot.on('error', (error) => {
  console.error('Erro no bot:', error);
});

bot.on('polling_error', (error) => {
  console.error('Erro de polling:', error);
});

console.log('🚀 Traffic Ops Telegram Bot iniciado!');
