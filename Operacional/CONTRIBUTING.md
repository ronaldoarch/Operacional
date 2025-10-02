# Guia de Contribuição - Traffic Ops

## Como Contribuir

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone <repo-url>
cd traffic-ops

# Instale dependências
npm install

# Configure variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais

# Execute o projeto
npm run dev
```

### 2. Estrutura do Projeto

```
traffic-ops/
├── app/                    # Next.js App Router
│   ├── (accounts)/        # Páginas de contas
│   ├── (settings)/        # Páginas de configuração
│   ├── (metrics)/         # Páginas de métricas
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout principal
├── src/
│   ├── lib/               # Bibliotecas utilitárias
│   ├── models/            # Models MongoDB
│   └── services/          # Serviços de negócio
├── SPEC.md                # Especificação técnica
└── CONTRIBUTING.md        # Este arquivo
```

### 3. Padrões de Código

#### TypeScript
- Use tipos explícitos
- Prefira interfaces para objetos
- Documente funções complexas

```typescript
interface AdAccount {
  accountId: string
  name: string
  currency: string
  amountSpent: number
}

function formatCurrency(value: number, currency = "BRL"): string {
  // Implementação
}
```

#### React Components
- Use componentes funcionais
- Prefira hooks personalizados
- Implemente loading states

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [loading, setLoading] = useState(false)
  
  // Implementação
}
```

#### API Routes
- Valide inputs obrigatórios
- Use try/catch para erros
- Retorne JSON consistente

```typescript
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { clientId, accessToken } = await req.json()
    
    if (!clientId || !accessToken) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Lógica da API
    
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 4. Convenções de Nomenclatura

#### Arquivos
- `kebab-case` para arquivos: `meta-accounts.ts`
- `PascalCase` para componentes: `AccountsPage.tsx`
- `camelCase` para funções: `syncAdAccounts()`

#### Variáveis
- `camelCase` para variáveis: `clientId`, `accessToken`
- `UPPER_CASE` para constantes: `GRAPH_API_URL`
- Prefixos descritivos: `isLoading`, `hasError`

#### Banco de Dados
- `camelCase` para campos: `accountStatus`, `lastSyncAt`
- `PascalCase` para models: `AdAccount`, `Client`
- Índices apropriados para queries frequentes

### 5. Fluxo de Desenvolvimento

#### 1. Criar Branch
```bash
git checkout -b feature/nova-funcionalidade
```

#### 2. Desenvolver
- Implemente a funcionalidade
- Adicione testes se necessário
- Documente mudanças importantes

#### 3. Testar
```bash
# Lint
npm run lint

# Build
npm run build

# Teste manual
npm run dev
```

#### 4. Commit
```bash
git add .
git commit -m "feat: adiciona sincronização automática de contas"
```

#### 5. Pull Request
- Descreva as mudanças
- Referencie issues relacionadas
- Solicite review

### 6. Tipos de Commits

Use [Conventional Commits](https://conventionalcommits.org/):

```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### 7. Testes

#### Testes Unitários
```typescript
// src/lib/__tests__/currency.test.ts
import { toMinor, fromMinor } from '../currency'

describe('Currency utils', () => {
  test('converts to minor units', () => {
    expect(toMinor(10.50)).toBe(1050)
  })
  
  test('converts from minor units', () => {
    expect(fromMinor(1050)).toBe(10.50)
  })
})
```

#### Testes de Integração
```typescript
// Teste de API
test('POST /api/meta/connect', async () => {
  const response = await request(app)
    .post('/api/meta/connect')
    .send({ clientId: '123', accessToken: 'token' })
  
  expect(response.status).toBe(200)
  expect(response.body.ok).toBe(true)
})
```

### 8. Documentação

#### Código
- Comente funções complexas
- Use JSDoc para APIs públicas
- Mantenha README atualizado

#### APIs
- Documente endpoints
- Inclua exemplos de request/response
- Especifique códigos de erro

### 9. Performance

#### Otimizações
- Use `React.memo` para componentes pesados
- Implemente paginação em listas grandes
- Cache resultados de APIs quando possível

#### Monitoramento
- Log queries lentas do MongoDB
- Monitore uso de memória
- Acompanhe tempo de resposta das APIs

### 10. Segurança

#### Boas Práticas
- Nunca commite credenciais
- Valide todos os inputs
- Use HTTPS em produção
- Implemente rate limiting

#### Tokens
- Armazene tokens criptografados
- Implemente rotação automática
- Monitore expiração

### 11. Deploy

#### Ambiente de Desenvolvimento
```bash
npm run dev
```

#### Ambiente de Produção
```bash
npm run build
npm start
```

#### Variáveis de Ambiente
- Configure todas as variáveis necessárias
- Use secrets manager para produção
- Monitore logs de erro

### 12. Issues e Bugs

#### Reportar Bugs
1. Verifique se já existe issue similar
2. Use template de bug report
3. Inclua logs e steps para reproduzir

#### Sugerir Features
1. Verifique roadmap atual
2. Descreva caso de uso
3. Explique benefícios

### 13. Code Review

#### Como Review
- Verifique lógica de negócio
- Confirme testes
- Valide segurança
- Confirme documentação

#### Receber Review
- Responda feedback construtivamente
- Faça mudanças solicitadas
- Teste após mudanças

### 14. Recursos Úteis

#### Documentação
- [Next.js](https://nextjs.org/docs)
- [MongoDB](https://docs.mongodb.com/)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)

#### Ferramentas
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/) para testar APIs
- [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer)

### 15. Contato

- Issues: Use GitHub Issues
- Discussões: GitHub Discussions
- Emergências: [Seu contato]

---

Obrigado por contribuir com o Traffic Ops! 🚀
