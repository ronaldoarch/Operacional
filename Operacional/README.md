# Traffic Ops 🚀

Sistema operacional completo para gestão de campanhas Meta Ads com integração, alertas automáticos e métricas por nicho.

## ✨ Funcionalidades

### 🔗 Integração Meta Ads
- Conexão via Meta App com token de longa duração
- Sincronização automática de contas de anúncio
- Monitoramento de saldo e status de pagamento
- Detecção de contas bloqueadas/suspensas

### 🚨 Alertas Automáticos
- Saldo baixo configurável (< R$50)
- Contas bloqueadas ou com problemas
- Webhook para Slack/Telegram
- Execução via cron ou manual

### 📊 Métricas por Nicho
- **🎰 Cassino**: FTDs, Depósitos, ROI/ROAS
- **🎫 Rifa**: Tickets vendidos, Ticket médio
- **🔥 Hot**: Leads, Conversão, CPA
- **📈 Genérico**: Métricas básicas de tráfego

### 🔌 Ingestão Externa
- Webhook para BeMob, n8n e outras plataformas
- Eventos manuais via API
- Suporte a múltiplos tipos de eventos (FTD, TICKET_SOLD, DEPOSIT)

## 🚀 Quick Start

### Deploy em Produção

**Railway** (Recomendado) ou **VPS** (Docker):
- 📖 [**DEPLOY-2-PROJETOS.md**](DEPLOY-2-PROJETOS.md) - Deploy Railway (Sistema + Bot)
- 📖 [**GUIA-DEPLOY.md**](GUIA-DEPLOY.md) - Instruções completas e troubleshooting
- 📄 [**VARIAVEIS-RAILWAY.txt**](VARIAVEIS-RAILWAY.txt) - Variáveis prontas para copiar
- ✅ Healthcheck otimizado para Railway
- 🐳 Dockerfile pronto para VPS
- 🤖 Bot do Telegram integrado

### 1. Instalação Local
```bash
# Clone o repositório
git clone <repo-url>
cd traffic-ops

# Instale dependências
npm install

# Configure variáveis de ambiente
cp env.example .env.local
```

### 2. Configuração
Edite `.env.local`:
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/traffic_ops

# Meta App
META_APP_ID=YOUR_APP_ID
META_APP_SECRET=YOUR_APP_SECRET
META_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN

# Alertas (opcional)
ALERTS_WEBHOOK_URL=https://hooks.slack.com/...
LOW_BALANCE_THRESHOLD=50
```

### 3. Executar
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📋 Pré-requisitos

### Meta App
Crie uma Meta App com as seguintes permissões:
- `ads_management`
- `business_management`
- `ads_read`

### Token de Acesso
Use um token de longa duração (60 dias) ou System User Token para operação estável.

## 🎯 Como Usar

### 1. Configurar Integração
1. Acesse **Configurações**
2. Insira suas credenciais Meta
3. Salve as configurações

### 2. Sincronizar Contas
1. Vá para **Contas**
2. Clique em "Sincronizar Agora"
3. Visualize status, saldos e formas de pagamento

### 3. Configurar Métricas
1. Acesse **Métricas**
2. Selecione cliente e nicho
3. Visualize métricas específicas

### 4. Ingerir Eventos Externos
```bash
# Exemplo: FTD de cassino
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "123",
    "type": "FTD",
    "amount": 15000,
    "qty": 1,
    "meta": {"source": "casino", "player_id": "player123"}
  }'
```

## 🔧 APIs

### Meta Integration
```bash
# Conectar cliente
POST /api/meta/connect
{
  "clientId": "123",
  "accessToken": "token",
  "metaAppId": "app_id",
  "metaAppSecret": "secret"
}

# Sincronizar contas
GET /api/meta/adaccounts?clientId=123&sync=true
```

### Alertas
```bash
# Executar alertas
POST /api/alerts/run
```

### Eventos
```bash
# Ingerir evento
POST /api/events/ingest
{
  "clientId": "123",
  "type": "FTD",
  "amount": 15000,
  "qty": 1
}
```

### Métricas
```bash
# Agregar métricas
GET /api/metrics/aggregate?clientId=123&niche=casino
```

## 🏗️ Arquitetura

### Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Integração**: Meta Graph API v19.0

### Estrutura
```
traffic-ops/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   └── (pages)/        # Páginas do dashboard
├── src/
│   ├── lib/            # Utilitários
│   ├── models/         # Models MongoDB
│   └── services/       # Serviços de negócio
└── docs/               # Documentação
```

## 📊 Métricas por Nicho

### 🎰 Cassino
- **FTDs**: First Time Deposits
- **Depósitos**: Valor total depositado
- **ROI**: Return on Investment
- **ROAS**: Return on Ad Spend

### 🎫 Rifa
- **Tickets Vendidos**: Quantidade total
- **Ticket Médio**: Valor médio por ticket
- **Conversão**: Taxa de conversão
- **Receita Total**: Valor total arrecadado

### 🔥 Hot
- **Leads**: Leads gerados
- **Conversão**: Taxa de conversão
- **CPA**: Custo por aquisição
- **LTV**: Lifetime Value

## 🚨 Alertas

### Saldo Baixo
- Monitora saldo disponível em contas pré-pagas
- Para pós-pago: usa sobra de `spend_cap - amount_spent`
- Threshold configurável (padrão: R$50)

### Contas Bloqueadas
- Detecta status diferentes de ACTIVE
- Categoriza por tipo de problema
- Cria tasks automáticas

## 🔌 Integração Externa

### Webhook Payload
```json
{
  "clientId": "123",
  "type": "FTD",
  "amount": 15000,
  "qty": 1,
  "meta": {
    "source": "bemob",
    "campaign_id": "123456",
    "external_id": "event_789"
  },
  "happenedAt": "2024-01-15T10:30:00Z"
}
```

### Tipos de Eventos
- `FTD`: First Time Deposit
- `TICKET_SOLD`: Ticket vendido
- `DEPOSIT`: Depósito
- `WITHDRAW`: Saque
- `LEAD`: Lead gerado
- `SALE`: Venda

## 🛠️ Desenvolvimento

### Scripts
```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run start    # Produção
npm run lint     # Lint
```

### Contribuindo
Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## 📚 Documentação

- [Especificação Técnica](SPEC.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)

## 🔒 Segurança

- Tokens armazenados de forma segura
- Validação de payloads
- Rate limiting
- Logs de auditoria

## 📈 Roadmap

### ✅ Fase 1 (MVP)
- [x] Integração Meta básica
- [x] Alertas de saldo/bloqueio
- [x] Métricas por nicho
- [x] Webhook de eventos

### 🚧 Fase 2 (Próxima)
- [ ] Automação de campanhas
- [ ] Relatórios avançados
- [ ] Integração com mais plataformas
- [ ] Dashboard em tempo real

### 🔮 Fase 3 (Futuro)
- [ ] IA para otimização
- [ ] Mobile app
- [ ] Multi-tenant
- [ ] White-label

## 🤝 Suporte

- **Issues**: [GitHub Issues](link)
- **Discussões**: [GitHub Discussions](link)
- **Email**: [seu@email.com]

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Traffic Ops** - Simplificando a gestão de campanhas Meta Ads 🚀
