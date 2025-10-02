# 🤖 Traffic Ops Telegram Bot

Bot do Telegram para integração com o sistema Traffic Ops.

## 🚀 Instalação

1. **Instalar dependências:**
```bash
cd telegram-bot
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Configurar o bot:**
```bash
npm run setup
```

4. **Iniciar o bot:**
```bash
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Token do bot (obtido do @BotFather)
TELEGRAM_BOT_TOKEN=8396159417:AAGgLAZDj2MPPfmrZvocRKozS7du6gpQ8hY

# URL da API do sistema principal
SYSTEM_API_URL=http://localhost:3001/api

# Usuários autorizados (IDs do Telegram)
AUTHORIZED_USERS=123456789,987654321

# Porta do servidor
PORT=3002
```

### Como obter seu ID do Telegram:

1. Envie uma mensagem para @userinfobot
2. Copie seu ID numérico
3. Adicione no arquivo .env

## 📱 Comandos Disponíveis

### Comandos Básicos
- `/start` - Iniciar bot e ver mensagem de boas-vindas
- `/help` - Ver ajuda e lista de comandos

### Gestão de Tarefas
- `/criar_tarefa "Título" prioridade cliente:id` - Criar nova tarefa
  - Exemplo: `/criar_tarefa "Verificar conta PixRaspa" alta cliente:1`
- `/listar_tarefas` - Ver todas as tarefas ativas
- `/listar_tarefas cliente:1` - Ver tarefas de um cliente específico

### Dashboard e Relatórios
- `/dashboard` - Ver métricas principais do sistema
- `/alertas` - Ver alertas ativos (saldo baixo, etc.)
- `/relatorio hoje` - Relatório do dia atual

## 🔒 Segurança

- ✅ Apenas usuários autorizados podem usar o bot
- ✅ Token do bot deve ser mantido seguro
- ✅ Validação de todos os comandos
- ✅ Rate limiting para evitar spam

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
telegram-bot/
├── index.js          # Arquivo principal do bot
├── config.js         # Configurações
├── setup.js          # Script de configuração inicial
├── package.json      # Dependências
└── README.md         # Este arquivo
```

### Adicionar Novos Comandos

1. Adicione o comando em `index.js`:
```javascript
bot.onText(/\/novo_comando/, (msg) => {
  // Lógica do comando
});
```

2. Registre o comando em `setup.js`:
```javascript
{ command: 'novo_comando', description: 'Descrição do comando' }
```

## 📊 Integração com Sistema

O bot se conecta com as seguintes APIs do sistema principal:

- `GET /api/dashboard/metrics` - Métricas do dashboard
- `GET /api/meta/adaccounts` - Lista de contas e tarefas
- `POST /api/accounts/add-task` - Criar nova tarefa
- `GET /api/clients` - Lista de clientes

## 🚨 Troubleshooting

### Bot não responde
1. Verifique se o token está correto
2. Confirme se você está na lista de usuários autorizados
3. Verifique se o sistema principal está rodando

### Erro de conexão com API
1. Confirme se a URL da API está correta
2. Verifique se o sistema principal está acessível
3. Teste a conexão manualmente

### Comandos não funcionam
1. Execute `npm run setup` novamente
2. Verifique se o bot está configurado corretamente
3. Teste com `/start` primeiro

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console
2. Teste a conexão com as APIs
3. Confirme as configurações do .env

