# 🚀 Guia Completo de Deploy - Traffic Ops

Este guia cobre deploy tanto no **Railway** quanto em **VPS**.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. ✅ Código no GitHub (sem o arquivo `.env`)
2. ✅ Conta MongoDB Atlas (ou MongoDB configurado)
3. ✅ Credenciais da Meta App (App ID e Secret)
4. ✅ Token do Bot do Telegram (se aplicável)

---

## 🛤️ Opção 1: Deploy no Railway

### Passo 1: Criar Projeto

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório `Operacional`

### Passo 2: Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```bash
# MongoDB (OBRIGATÓRIO)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/traffic-ops?retryWrites=true&w=majority

# Meta App (OBRIGATÓRIO)
META_APP_ID=seu_app_id_aqui
META_APP_SECRET=seu_app_secret_aqui
META_ACCESS_TOKEN=seu_token_long_lived_aqui

# Node Environment (OBRIGATÓRIO)
NODE_ENV=production

# NextAuth (RECOMENDADO - gere uma string aleatória segura)
NEXTAUTH_SECRET=sua_chave_secreta_super_segura_aqui
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Configurações Opcionais
CURRENCY_DEFAULT=BRL
LOW_BALANCE_THRESHOLD=50
ALERTS_WEBHOOK_URL=sua_webhook_url_se_tiver

# Google Sheets (se usar)
GOOGLE_SHEETS_API_KEY=sua_api_key
GOOGLE_SHEETS_SHEET_ID=seu_sheet_id
```

### Passo 3: Deploy

1. Railway vai fazer o build automaticamente
2. Aguarde o deploy (pode levar 3-5 minutos)
3. Quando aparecer **"Success"**, clique em **"View Logs"**
4. Teste acessando: `https://seu-app.railway.app/api/health`

### Passo 4: Verificar

Se o endpoint `/api/health` retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T...",
  "service": "Traffic Ops API",
  "version": "1.0.0"
}
```

✅ **Deploy bem-sucedido!**

---

## 🖥️ Opção 2: Deploy em VPS (Docker)

### Pré-requisitos na VPS

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo apt update
sudo apt install docker-compose -y
```

### Passo 1: Clonar Repositório

```bash
# Conectar na VPS via SSH
ssh usuario@seu-servidor.com

# Clonar o projeto
git clone https://github.com/seu-usuario/Operacional.git
cd Operacional
```

### Passo 2: Criar arquivo .env

```bash
nano .env
```

Cole as variáveis:

```bash
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/traffic-ops?retryWrites=true&w=majority
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_ACCESS_TOKEN=seu_token
NODE_ENV=production
NEXTAUTH_SECRET=sua_chave_secreta
NEXTAUTH_URL=https://seu-dominio.com
CURRENCY_DEFAULT=BRL
LOW_BALANCE_THRESHOLD=50
PORT=3000
```

Salve com `CTRL + O`, `ENTER`, `CTRL + X`

### Passo 3: Build da Imagem Docker

```bash
docker build -t traffic-ops .
```

### Passo 4: Rodar Container

```bash
docker run -d \
  --name traffic-ops \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  traffic-ops
```

### Passo 5: Configurar Nginx (Proxy Reverso)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/traffic-ops
```

Cole:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar site:

```bash
sudo ln -s /etc/nginx/sites-available/traffic-ops /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Passo 6: Configurar SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

### Passo 7: Verificar

Acesse: `https://seu-dominio.com/api/health`

---

## 🤖 Deploy do Bot do Telegram (Opcional)

Se você quiser rodar o bot separadamente:

### Railway (Segundo Projeto)

1. Criar novo projeto no Railway
2. Conectar o mesmo repositório
3. Em **Settings** → **Root Directory**, colocar: `telegram-bot`
4. Adicionar variáveis:

```bash
TELEGRAM_BOT_TOKEN=seu_bot_token
SYSTEM_API_URL=https://seu-app-principal.railway.app/api
AUTHORIZED_USERS=5767285166
NODE_ENV=production
```

### VPS (Segundo Container)

```bash
cd telegram-bot

# Criar .env
nano .env
# Cole as variáveis acima

# Rodar
docker build -t telegram-bot .
docker run -d \
  --name telegram-bot \
  --env-file .env \
  --restart unless-stopped \
  telegram-bot
```

---

## 🔍 Troubleshooting

### Problema: Build Falha no Railway

**Solução:**
1. Verificar logs no Railway Dashboard
2. Confirmar que todas as variáveis estão corretas
3. Testar localmente: `npm run build`

### Problema: Healthcheck Failed

**Solução:**
- O novo endpoint `/api/health` é leve e não depende do banco
- Verifique se a aplicação está iniciando: `railway logs`

### Problema: Database Connection Error

**Solução:**
1. Verificar `MONGODB_URI` está correto
2. Confirmar IP da Railway está permitido no MongoDB Atlas
3. Para MongoDB Atlas: **Network Access** → **Allow from anywhere** (0.0.0.0/0)

### Problema: Container não inicia na VPS

**Solução:**
```bash
# Ver logs
docker logs traffic-ops

# Reiniciar
docker restart traffic-ops

# Ver containers rodando
docker ps -a
```

---

## 📊 Comandos Úteis

### Railway

```bash
# Ver logs em tempo real
railway logs

# Redeployar
railway up
```

### Docker (VPS)

```bash
# Ver logs
docker logs -f traffic-ops

# Parar
docker stop traffic-ops

# Iniciar
docker start traffic-ops

# Remover e recriar
docker rm -f traffic-ops
docker build -t traffic-ops .
docker run -d --name traffic-ops --env-file .env -p 3000:3000 --restart unless-stopped traffic-ops

# Atualizar código
git pull
docker build -t traffic-ops .
docker stop traffic-ops
docker rm traffic-ops
docker run -d --name traffic-ops --env-file .env -p 3000:3000 --restart unless-stopped traffic-ops
```

---

## ✅ Checklist Final

- [ ] Código no GitHub sem `.env`
- [ ] MongoDB Atlas configurado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] `/api/health` retorna "ok"
- [ ] `/api/test` conecta ao banco
- [ ] Dashboard acessível
- [ ] (Opcional) Bot do Telegram funcionando

---

## 🆘 Suporte

- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Docker Docs**: https://docs.docker.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Feito! Seu sistema está pronto para produção! 🎉**
