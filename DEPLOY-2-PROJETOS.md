# 🚀 Deploy dos 2 Projetos no Railway

## 📦 Visão Geral

Você vai fazer **2 deploys separados**:

1. **Projeto 1**: Sistema Principal (Next.js + API)
2. **Projeto 2**: Bot do Telegram

---

## 🎯 PROJETO 1: Sistema Principal

### Passo 1: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório **"Operacional"**
5. **NÃO** configure Root Directory (deixe vazio)

### Passo 2: Configurar Variáveis

No painel do Railway → **Variables** → Cole isso:

```bash
MONGODB_URI=<sua_string_mongodb_atlas>
META_APP_ID=<seu_app_id>
META_APP_SECRET=<seu_app_secret>
META_ACCESS_TOKEN=<seu_token>
NODE_ENV=production
NEXTAUTH_SECRET=df8a9sd7f89a7sdf897asdf897asdf897asdf897asdf89
CURRENCY_DEFAULT=BRL
LOW_BALANCE_THRESHOLD=50
```

### Passo 3: Deploy

- Railway vai fazer deploy automaticamente
- Aguarde 3-5 minutos
- Quando aparecer **"Success"**, anote a URL:
  - Exemplo: `https://operacional-production.up.railway.app`

### Passo 4: Testar

```bash
# Health check
https://seu-app.railway.app/api/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "...",
  "service": "Traffic Ops API",
  "version": "1.0.0"
}
```

✅ **Projeto 1 concluído!**

---

## 🤖 PROJETO 2: Bot do Telegram

### Passo 1: Criar Segundo Projeto

1. No Railway, clique em **"New Project"** novamente
2. Escolha **"Deploy from GitHub repo"**
3. Selecione o **MESMO repositório** "Operacional"
4. ⚠️ **IMPORTANTE**: Após criar, vá em **Settings**

### Passo 2: Configurar Root Directory

1. No projeto do bot, vá em **Settings**
2. Procure por **"Root Directory"** ou **"Source"**
3. Configure para: `telegram-bot`
4. Salve

### Passo 3: Configurar Variáveis

No painel do Railway (projeto do bot) → **Variables** → Cole isso:

```bash
TELEGRAM_BOT_TOKEN=8396159417:AAGgLAZDj2MPPfmrZvocRKozS7du6gpQ8hY
SYSTEM_API_URL=<URL_DO_PROJETO_1>/api
AUTHORIZED_USERS=5767285166
NODE_ENV=production
PORT=3002
```

**⚠️ IMPORTANTE**: 
- Substitua `<URL_DO_PROJETO_1>` pela URL que você anotou no Projeto 1
- Exemplo: `https://operacional-production.up.railway.app/api`

### Passo 4: Deploy

- Railway vai fazer deploy automaticamente
- Aguarde 2-3 minutos
- Quando aparecer **"Success"**, anote a URL do bot:
  - Exemplo: `https://telegram-bot-production.up.railway.app`

### Passo 5: Configurar Webhook do Telegram

Agora você precisa configurar o Telegram para enviar mensagens para seu bot:

```bash
# Cole isso no navegador (substitua os valores):
https://api.telegram.org/bot8396159417:AAGgLAZDj2MPPfmrZvocRKozS7du6gpQ8hY/setWebhook?url=https://SUA-URL-DO-BOT.railway.app/webhook
```

Exemplo completo:
```
https://api.telegram.org/bot8396159417:AAGgLAZDj2MPPfmrZvocRKozS7du6gpQ8hY/setWebhook?url=https://telegram-bot-production.up.railway.app/webhook
```

Deve retornar:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Passo 6: Testar Bot

1. Abra o Telegram
2. Procure por `@ReidoblackBot`
3. Digite `/start`
4. Deve responder com a mensagem de boas-vindas! 🎉

✅ **Projeto 2 concluído!**

---

## 📋 Resumo das URLs

Após tudo configurado, você terá:

### Sistema Principal
- Dashboard: `https://seu-sistema.railway.app`
- API: `https://seu-sistema.railway.app/api`
- Health: `https://seu-sistema.railway.app/api/health`

### Bot Telegram
- Bot: `@ReidoblackBot`
- Health: `https://seu-bot.railway.app/health`
- Webhook: `https://seu-bot.railway.app/webhook`

---

## ✅ Checklist Final

- [ ] Projeto 1 criado e rodando
- [ ] Variáveis do Projeto 1 configuradas
- [ ] `/api/health` retorna "ok"
- [ ] Projeto 2 criado com Root Directory = `telegram-bot`
- [ ] Variáveis do Projeto 2 configuradas
- [ ] `SYSTEM_API_URL` aponta para URL do Projeto 1
- [ ] Webhook do Telegram configurado
- [ ] Bot responde no Telegram

---

## 🛠️ Comandos do Bot

Depois que tudo estiver rodando, teste estes comandos no Telegram:

```
/start - Iniciar bot
/help - Ajuda completa
/dashboard - Ver métricas
/clientes - Listar clientes
/criar_tarefa "Título" medium cliente:1
/listar_tarefas - Ver tarefas
/alertas - Ver alertas
```

---

## ❓ Troubleshooting

### Problema: Bot não responde

**Solução:**
1. Verificar se webhook foi configurado corretamente
2. Ver logs no Railway (projeto do bot)
3. Testar health check: `https://seu-bot.railway.app/health`

### Problema: Bot dá erro ao criar tarefa

**Solução:**
1. Verificar se `SYSTEM_API_URL` está correto
2. Garantir que o sistema principal está rodando
3. Ver logs de ambos os projetos

### Problema: Unauthorized no bot

**Solução:**
1. Verificar se seu ID do Telegram está em `AUTHORIZED_USERS`
2. Para descobrir seu ID, adicione este código temporário ou use `@userinfobot`

---

## 🎉 Pronto!

Agora você tem:
- ✅ Sistema operacional rodando
- ✅ Bot do Telegram funcionando
- ✅ Tudo integrado e comunicando

**Próximos passos:**
- Adicionar clientes no sistema
- Conectar contas Meta
- Usar o bot para gerenciar tarefas

---

**Boa sorte! 🚀**


