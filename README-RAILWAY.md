# 🚀 Traffic Ops - Deploy na Railway

Sistema operacional para gestão de campanhas Meta Ads com bot do Telegram integrado.

## 🏗️ Arquitetura

- **Sistema Principal**: Next.js API + Dashboard
- **Bot do Telegram**: Node.js + Express
- **Banco de Dados**: MongoDB
- **Deploy**: Railway (2 projetos separados)

## 📦 Estrutura do Projeto

```
traffic-ops/
├── app/                    # Sistema principal (Next.js)
│   ├── api/               # APIs REST
│   ├── accounts/          # Página de contas
│   ├── clients/           # Página de clientes
│   └── metrics/           # Página de métricas
├── telegram-bot/          # Bot do Telegram
│   ├── index.js           # Código principal do bot
│   ├── config.js          # Configurações
│   └── package.json       # Dependências do bot
├── src/                   # Código fonte
│   ├── models/            # Modelos MongoDB
│   ├── services/          # Serviços
│   └── lib/               # Utilitários
├── railway.json           # Config Railway (sistema principal)
├── telegram-bot/railway.json  # Config Railway (bot)
└── DEPLOY.md              # Instruções de deploy
```

## 🔧 Configuração Railway

### Projeto 1: Sistema Principal

1. **Criar projeto** na Railway
2. **Conectar repositório Git**
3. **Configurar variáveis**:
   ```bash
   MONGODB_URI=mongodb+srv://...
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   NODE_ENV=production
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=your_secret_key
   ```
4. **Deploy automático**

### Projeto 2: Bot do Telegram

1. **Criar segundo projeto** na Railway
2. **Conectar mesmo repositório**
3. **Configurar pasta raiz**: `telegram-bot/`
4. **Configurar variáveis**:
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token
   SYSTEM_API_URL=https://your-main-app.railway.app/api
   AUTHORIZED_USERS=5767285166
   NODE_ENV=production
   ```
5. **Deploy automático**

## 🌐 URLs de Produção

### Sistema Principal
- **Dashboard**: `https://your-main-app.railway.app`
- **API**: `https://your-main-app.railway.app/api`
- **Health Check**: `https://your-main-app.railway.app/api/test`

### Bot do Telegram
- **Webhook**: `https://your-bot-app.railway.app/webhook`
- **Health Check**: `https://your-bot-app.railway.app/health`

## 🤖 Comandos do Bot

- `/start` - Iniciar bot
- `/help` - Ajuda completa
- `/clientes` - Listar clientes
- `/criar_tarefa "Título" prioridade cliente:id` - Criar tarefa
- `/listar_tarefas` - Ver tarefas
- `/dashboard` - Métricas do sistema
- `/alertas` - Alertas ativos

## 🔄 Webhook do Telegram

Configure o webhook após o deploy:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-bot-app.railway.app/webhook"}'
```

## 📊 Monitoramento

### Logs
- Railway Dashboard → Logs em tempo real
- Health checks configurados

### Métricas
- Railway Metrics → CPU, Memória, Rede
- Custom metrics → `/api/dashboard/metrics`

## 🛠️ Desenvolvimento Local

```bash
# Sistema principal
npm run dev

# Bot do Telegram
cd telegram-bot
npm run dev
```

## 🔧 Troubleshooting

### Build Fail
- Verificar logs no Railway
- Verificar variáveis de ambiente
- Verificar dependências

### Bot não responde
- Verificar token do Telegram
- Verificar webhook configurado
- Verificar logs do bot

### API não conecta
- Verificar SYSTEM_API_URL
- Verificar se sistema principal está rodando
- Verificar CORS

## 📝 Notas Importantes

- **Domínios**: Railway fornece domínios automáticos
- **SSL**: Automático via Railway
- **Escalabilidade**: Automática
- **Backup**: Configure backup do MongoDB Atlas

## 🆘 Suporte

- **Logs**: Railway Dashboard
- **Documentação**: [Railway Docs](https://docs.railway.app)
- **Telegram Bot API**: [Bot API Docs](https://core.telegram.org/bots/api)
