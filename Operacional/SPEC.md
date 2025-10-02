# Traffic Ops - Especificação Técnica

## Visão Geral

Sistema operacional para gestão de campanhas Meta Ads com integração completa, alertas automáticos e métricas por nicho.

## Funcionalidades Principais

### 1. Integração Meta Ads
- ✅ Conexão via Meta App (token de longa duração)
- ✅ Sincronização de contas de anúncio
- ✅ Monitoramento de saldo e status de pagamento
- ✅ Detecção de contas bloqueadas

### 2. Alertas Automáticos
- ✅ Saldo baixo (< R$50 configurável)
- ✅ Contas bloqueadas/suspensas
- ✅ Webhook para Slack/Telegram
- ✅ Execução via cron ou manual

### 3. Métricas por Nicho
- ✅ **Cassino**: FTDs, Depósitos, ROI/ROAS
- ✅ **Rifa**: Tickets vendidos, Ticket médio
- ✅ **Hot**: Leads, Conversão, CPA
- ✅ **Genérico**: Métricas básicas

### 4. Ingestão de Eventos Externos
- ✅ Webhook para BeMob/n8n
- ✅ Eventos manuais via API
- ✅ Tipos: FTD, TICKET_SOLD, DEPOSIT, etc.

## Arquitetura

### Stack Tecnológico
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB com Mongoose
- **Integração**: Meta Graph API v19.0

### Estrutura de Dados

#### Models Principais
```typescript
// Cliente
Client {
  name: string
  metaAccessToken: string
  settings: {
    lowBalanceThreshold: number
    alertsEnabled: boolean
  }
}

// Conta de Anúncio
AdAccount {
  clientId: ObjectId
  accountId: string // act_123
  name: string
  currency: string
  accountStatus: number // 1=ACTIVE
  amountSpent: number // centavos
  spendCap: number // centavos
  balance: number // centavos (pré-pago)
  fundingSourceType: string
  lastSyncAt: Date
}

// Eventos Externos
Event {
  clientId: ObjectId
  type: string // "FTD", "TICKET_SOLD", "DEPOSIT"
  amount: number // centavos
  qty: number
  meta: object
  happenedAt: Date
  source: string // "bemob", "n8n", "webhook"
}

// Configuração por Nicho
NicheMetricConfig {
  clientId: ObjectId
  niche: string // "casino", "rifa", "hot", "generic"
  metrics: [{
    key: string
    label: string
    formula: string
    enabled: boolean
  }]
}
```

## APIs

### Meta Integration
```
POST /api/meta/connect
GET  /api/meta/adaccounts?clientId=X&sync=true
GET  /api/meta/refresh-token?clientId=X
```

### Alertas
```
POST /api/alerts/run
```

### Eventos
```
POST /api/events/ingest
GET  /api/events/ingest?clientId=X&type=FTD
```

### Métricas
```
GET  /api/metrics/aggregate?clientId=X&niche=casino
POST /api/metrics/aggregate (config)
```

## Configuração

### Variáveis de Ambiente
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/traffic_ops

# Meta App
META_APP_ID=YOUR_APP_ID
META_APP_SECRET=YOUR_APP_SECRET
META_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN

# Alertas
ALERTS_WEBHOOK_URL=https://hooks.slack.com/...
LOW_BALANCE_THRESHOLD=50
```

### Permissões Meta App Necessárias
- `ads_management`
- `business_management`
- `ads_read`

## Fluxos Principais

### 1. Sincronização de Contas
1. Cliente configura token Meta
2. Sistema sincroniza contas via Graph API
3. Armazena dados normalizados (centavos)
4. Monitora saldo e status

### 2. Alertas Automáticos
1. Cron executa a cada 30min
2. Verifica saldos baixos
3. Verifica contas bloqueadas
4. Envia webhook se configurado

### 3. Métricas por Nicho
1. Coleta eventos externos
2. Agrega dados Meta + eventos
3. Calcula métricas específicas
4. Exibe dashboard personalizado

### 4. Ingestão de Eventos
1. BeMob/n8n envia webhook
2. Sistema valida payload
3. Armazena evento normalizado
4. Atualiza métricas em tempo real

## Segurança

- Tokens armazenados criptografados
- Validação de payloads webhook
- Rate limiting nas APIs
- Logs de auditoria

## Monitoramento

- Health checks automáticos
- Logs estruturados
- Métricas de performance
- Alertas de erro

## Roadmap

### Fase 1 (MVP) ✅
- [x] Integração Meta básica
- [x] Alertas de saldo/bloqueio
- [x] Métricas por nicho
- [x] Webhook de eventos

### Fase 2 (Próxima)
- [ ] Automação de campanhas
- [ ] Relatórios avançados
- [ ] Integração com mais plataformas
- [ ] Dashboard em tempo real

### Fase 3 (Futuro)
- [ ] IA para otimização
- [ ] Mobile app
- [ ] Multi-tenant
- [ ] White-label

## Troubleshooting

### Problemas Comuns

1. **Token expirado**
   - Verificar validade do token
   - Renovar token de longa duração
   - Configurar System User Token

2. **Saldo não aparece**
   - Conta pode ser pós-pago
   - Usar spend_cap - amount_spent
   - Verificar permissões da App

3. **Webhook não funciona**
   - Verificar URL do webhook
   - Testar payload manualmente
   - Verificar logs de erro

4. **Métricas zeradas**
   - Verificar ingestão de eventos
   - Validar período de consulta
   - Conferir configuração do nicho
