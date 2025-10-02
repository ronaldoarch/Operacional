# ✅ Próximos Passos - Deploy Traffic Ops

## 🎉 O que foi preparado?

Seu código está **100% pronto** para deploy! Aqui está o que foi feito:

### 1. ✅ Healthcheck Otimizado
- Criado `/api/health` - endpoint leve que não depende do banco
- Railway vai usar este endpoint para verificar se o app está rodando
- Resolve o problema de "healthcheck failed"

### 2. ✅ Package.json Corrigido
- Removido `postinstall` que causava problemas de build
- Scripts otimizados para produção

### 3. ✅ Railway.json Atualizado
- Comando de build explícito
- Healthcheck configurado corretamente
- Timeout otimizado

### 4. ✅ Docker Pronto
- `Dockerfile` criado para VPS
- `docker-compose.yml` para facilitar deploy
- `.dockerignore` para otimizar build

### 5. ✅ Documentação Completa
- `GUIA-DEPLOY.md` - guia completo passo a passo
- Instruções para Railway E VPS
- Troubleshooting incluído

---

## 🚀 Deploy no Railway (AGORA)

### Passo 1: Fazer Commit e Push

```bash
# Adicionar arquivos novos
git add .

# Commit
git commit -m "Preparar código para deploy em Railway/VPS

- Adicionar healthcheck otimizado (/api/health)
- Corrigir package.json (remover postinstall)
- Atualizar railway.json
- Adicionar Dockerfile e docker-compose
- Incluir documentação completa de deploy"

# Push para GitHub
git push origin main
```

### Passo 2: Configurar Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione seu repositório

### Passo 3: Adicionar Variáveis (IMPORTANTE!)

No painel do Railway, vá em **Variables** e cole:

```bash
MONGODB_URI=sua_connection_string_mongodb_atlas
META_APP_ID=seu_meta_app_id
META_APP_SECRET=seu_meta_app_secret
META_ACCESS_TOKEN=seu_token_long_lived
NODE_ENV=production
NEXTAUTH_SECRET=gere_uma_string_aleatoria_segura
CURRENCY_DEFAULT=BRL
LOW_BALANCE_THRESHOLD=50
```

**IMPORTANTE**: 
- `NEXTAUTH_URL` não precisa - Railway define automaticamente
- Gere `NEXTAUTH_SECRET` com: `openssl rand -base64 32` ou use qualquer string longa e aleatória

### Passo 4: Deploy Automático

- Railway vai detectar as mudanças e fazer deploy automaticamente
- Aguarde 3-5 minutos
- Quando ver **"Success"**, está pronto!

### Passo 5: Testar

```bash
# Teste 1: Healthcheck
https://seu-app.railway.app/api/health

# Teste 2: Conexão com banco
https://seu-app.railway.app/api/test

# Teste 3: Dashboard
https://seu-app.railway.app
```

---

## 🖥️ Ou... Deploy em VPS (Alternativa)

Se preferir usar VPS com Docker:

```bash
# 1. Conectar na VPS
ssh usuario@seu-servidor.com

# 2. Clonar repositório
git clone https://github.com/seu-usuario/Operacional.git
cd Operacional

# 3. Criar arquivo .env
nano .env
# Cole as variáveis de ambiente

# 4. Rodar com Docker Compose
docker-compose up -d

# 5. Ver logs
docker-compose logs -f
```

---

## 📋 Checklist de Variáveis

Antes de fazer deploy, confirme que você tem:

- [ ] MongoDB Atlas configurado
  - [ ] String de conexão (`MONGODB_URI`)
  - [ ] IP do Railway permitido no Atlas (ou 0.0.0.0/0)

- [ ] Meta App criada
  - [ ] `META_APP_ID`
  - [ ] `META_APP_SECRET`
  - [ ] `META_ACCESS_TOKEN` (token de longa duração)

- [ ] NextAuth configurado
  - [ ] `NEXTAUTH_SECRET` gerado

- [ ] (Opcional) Alertas
  - [ ] `ALERTS_WEBHOOK_URL` se for usar

- [ ] (Opcional) Google Sheets
  - [ ] `GOOGLE_SHEETS_API_KEY`
  - [ ] `GOOGLE_SHEETS_SHEET_ID`

---

## 🔧 MongoDB Atlas - Configuração Rápida

### 1. Criar Cluster (Grátis)
1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta grátis
3. Crie um cluster M0 (Free)

### 2. Configurar Acesso
1. **Database Access**: Criar usuário e senha
2. **Network Access**: Adicionar `0.0.0.0/0` (permitir de qualquer IP)

### 3. Obter Connection String
1. Clique em **"Connect"** no cluster
2. Escolha **"Connect your application"**
3. Copie a string: `mongodb+srv://usuario:senha@cluster.mongodb.net/traffic-ops?retryWrites=true&w=majority`
4. Substitua `usuario` e `senha` pelos seus

---

## ❓ FAQ

### Q: Por que não usar o `/api/test` como healthcheck?
**R:** O `/api/test` tenta conectar ao banco, o que pode demorar. O `/api/health` é instantâneo e garante que o app está rodando.

### Q: Preciso do MongoDB rodando localmente?
**R:** Não! Use o MongoDB Atlas (grátis). Assim funciona tanto local quanto em produção.

### Q: O que é NEXTAUTH_SECRET?
**R:** Uma chave secreta para encriptar sessões. Pode ser qualquer string longa e aleatória. Gere com: `openssl rand -base64 32`

### Q: Posso usar o MongoDB da Railway?
**R:** Sim! Mas o MongoDB Atlas tem tier gratuito e é mais fácil de configurar.

### Q: Como gero um token de longa duração da Meta?
**R:** Acesse o [Meta Business Manager](https://business.facebook.com) → Configurações → System Users → Gerar Token

---

## 🆘 Se Algo Der Errado

### Erro: Build Failed
```bash
# Ver logs no Railway Dashboard
# Verificar se todas as variáveis estão configuradas
```

### Erro: Healthcheck Failed
```bash
# Verificar se o app está iniciando:
railway logs

# O novo healthcheck (/api/health) deve resolver isso
```

### Erro: Database Connection
```bash
# Verificar MONGODB_URI
# Verificar se IP está permitido no Atlas (0.0.0.0/0)
# Testar conexão localmente primeiro
```

---

## 📞 Suporte

Leia o **GUIA-DEPLOY.md** completo para mais detalhes!

---

**Pronto! Agora é só fazer o push e ver a mágica acontecer! 🎉**


