# 🚀 Deploy na Railway - Traffic Ops

## 📋 Pré-requisitos

1. **Conta na Railway**: [railway.app](https://railway.app)
2. **MongoDB**: Use MongoDB Atlas ou Railway MongoDB
3. **Tokens e Chaves**:
   - Token do Telegram Bot
   - Meta App ID e Secret
   - String de conexão MongoDB

## 🔧 Configuração

### 1. Sistema Principal

1. **Criar novo projeto na Railway**
2. **Conectar repositório Git**
3. **Configurar variáveis de ambiente**:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/traffic-ops

# Meta App
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Sistema
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-secret-key

# Alertas
WEBHOOK_URL=https://your-webhook-url.com/webhook
LOW_BALANCE_THRESHOLD=5000
```

4. **Deploy**: Railway fará o build e deploy automaticamente

### 2. Bot do Telegram

1. **Criar segundo projeto na Railway** para o bot
2. **Conectar mesmo repositório Git**
3. **Configurar pasta raiz**: `telegram-bot/`
4. **Configurar variáveis de ambiente**:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
AUTHORIZED_USERS=5767285166

# Sistema Principal (URL do primeiro deploy)
SYSTEM_API_URL=https://your-main-app.railway.app/api

# Ambiente
NODE_ENV=production
```

5. **Deploy**: Railway fará o build e deploy automaticamente

## 🌐 URLs e Webhooks

### Sistema Principal
- **URL**: `https://your-main-app.railway.app`
- **API**: `https://your-main-app.railway.app/api`
- **Health Check**: `https://your-main-app.railway.app/api/test`

### Bot do Telegram
- **URL**: `https://your-bot-app.railway.app`
- **Webhook**: `https://your-bot-app.railway.app/webhook`
- **Health Check**: `https://your-bot-app.railway.app/health`

## 🔗 Configuração do Webhook do Telegram

1. **Obter URL do webhook**: `https://your-bot-app.railway.app/webhook`
2. **Configurar webhook via API**:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-bot-app.railway.app/webhook"}'
```

## 📊 Monitoramento

### Logs
- **Railway Dashboard**: Ver logs em tempo real
- **Health Checks**: URLs de health check configuradas

### Métricas
- **Railway Metrics**: CPU, Memória, Rede
- **Custom Metrics**: Via API `/api/dashboard/metrics`

## 🔄 Atualizações

1. **Push para Git**: Railway detecta mudanças automaticamente
2. **Redeploy**: Automático via Railway
3. **Rollback**: Disponível no dashboard da Railway

## 🛠️ Comandos Úteis

### Verificar Status
```bash
# Sistema Principal
curl https://your-main-app.railway.app/api/test

# Bot do Telegram
curl https://your-bot-app.railway.app/health
```

### Testar Bot
```bash
# No Telegram
/start
/help
/clientes
/criar_tarefa "Teste" high cliente:1
```

## ⚠️ Troubleshooting

### Problemas Comuns

1. **Build Fail**:
   - Verificar logs no Railway Dashboard
   - Verificar variáveis de ambiente
   - Verificar dependências

2. **Bot não responde**:
   - Verificar token do Telegram
   - Verificar webhook configurado
   - Verificar logs do bot

3. **API não conecta**:
   - Verificar SYSTEM_API_URL no bot
   - Verificar se sistema principal está rodando
   - Verificar CORS

### Logs Importantes

```bash
# Sistema Principal
"Database connected successfully"
"Ready in Xms"

# Bot do Telegram
"Traffic Ops Telegram Bot iniciado!"
"Telegram Bot rodando na porta X"
```

## 📝 Notas

- **Domínios**: Railway fornece domínios automáticos
- **SSL**: Automático via Railway
- **Escalabilidade**: Automática via Railway
- **Backup**: Configure backup do MongoDB



