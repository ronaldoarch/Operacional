// Configurações do Telegram Bot
module.exports = {
  // Token do bot (mantenha seguro!)
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  
  // URL da API do sistema principal
  SYSTEM_API_URL: process.env.SYSTEM_API_URL || 'http://localhost:3000/api',
  
  // Usuários autorizados (IDs do Telegram)
  AUTHORIZED_USERS: process.env.AUTHORIZED_USERS ? 
    process.env.AUTHORIZED_USERS.split(',').map(id => parseInt(id)) : [5767285166],
  
  // Configurações de comandos
  COMMANDS: {
    START: '/start',
    HELP: '/help',
    DASHBOARD: '/dashboard',
    CREATE_TASK: '/criar_tarefa',
    LIST_TASKS: '/listar_tarefas',
    ALERTS: '/alertas',
    REPORT: '/relatorio'
  },
  
  // Configurações de prioridade
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },
  
  // Configurações de status
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
  },
  
  // Limites e configurações
  LIMITS: {
    LOW_BALANCE_THRESHOLD: 5000, // R$ 50,00 em centavos
    MAX_TASK_TITLE_LENGTH: 100,
    MAX_MESSAGE_LENGTH: 4096
  },
  
  // Mensagens padrão
  MESSAGES: {
    UNAUTHORIZED: '❌ Você não está autorizado a usar este bot.',
    ERROR_GENERIC: '❌ Erro interno. Tente novamente.',
    ERROR_API: '❌ Erro ao conectar com o sistema. Tente novamente.',
    SUCCESS: '✅ Operação realizada com sucesso!'
  }
};
