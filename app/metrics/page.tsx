'use client'

import { useState, useEffect } from 'react'

interface Metric {
  key: string
  label: string
  value: number | null
}

interface Client {
  _id: string
  name: string
  contractValue: number
  responsible: string
  priority: number
  niche: string
  status: string
}

interface AdAccount {
  _id: string
  accountId: string
  name: string
  currency: string
  balance: number
  clientId: string
  niche: string
}

export default function MetricsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientId, setClientId] = useState('')
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [niche, setNiche] = useState('generic')
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('7')

  const niches = [
    { value: 'generic', label: 'Genérico' },
    { value: 'casino', label: 'Cassino' },
    { value: 'rifa', label: 'Rifa' },
    { value: 'afiliado', label: 'Afiliado' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'massagem', label: 'Casa de Massagens' }
  ]

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      
      if (data.ok) {
        setClients(data.clients || [])
        if (data.clients.length > 0) {
          const firstClient = data.clients[0]
          setSelectedClient(firstClient)
          setClientId(firstClient._id)
          await loadAdAccounts(firstClient._id)
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const normalizeAmount = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return 0
    
    // Se o valor for muito alto (mais de 1 milhão de centavos = R$ 10.000), 
    // provavelmente está em centavos quando deveria estar em reais
    if (amount > 1000000) {
      return Math.round(amount / 100) // Converter de centavos para centavos corretos
    }
    
    return amount
  }

  const loadAdAccounts = async (clientId: string) => {
    try {
      const response = await fetch(`/api/meta/adaccounts?clientId=${clientId}`)
      const data = await response.json()
      
      if (data.ok) {
        // Normalizar valores das contas
        const normalizedAccounts = (data.accounts || []).map((acc: any) => ({
          ...acc,
          balance: normalizeAmount(acc.balance),
          spendCap: normalizeAmount(acc.spendCap)
        }))
        
        setAdAccounts(normalizedAccounts)
        // Selecionar todas as contas por padrão
        setSelectedAccounts(normalizedAccounts?.map((acc: AdAccount) => acc._id) || [])
      }
    } catch (error) {
      console.error('Error loading ad accounts:', error)
    }
  }

  const loadMetrics = async () => {
    if (!selectedAccounts.length) return
    
    setLoading(true)
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))
      
      const params = new URLSearchParams({
        clientId,
        niche,
        accountIds: selectedAccounts.join(','),
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      })

      const response = await fetch(`/api/metrics/aggregate?${params}`)
      const data = await response.json()
      
      if (data.ok) {
        setMetrics(data.metrics || [])
      } else {
        console.error('Error loading metrics:', data.error)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (key: string, value: number | null) => {
    if (value === null) return 'N/A'
    
    switch (key) {
      case 'spend':
      case 'deposits':
      case 'avg_ticket':
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
      case 'roi':
        return `${value.toFixed(2).replace('.', ',')}%`
      case 'roas':
        return value.toFixed(2).replace('.', ',')
      case 'ftd':
        return value.toLocaleString('pt-BR')
      default:
        return value.toLocaleString('pt-BR')
    }
  }

  const getMetricColor = (key: string, value: number | null) => {
    if (value === null) return 'text-gray-500'
    
    switch (key) {
      case 'roi':
        return value > 0 ? 'text-green-600' : 'text-red-600'
      case 'roas':
        return value > 1 ? 'text-green-600' : 'text-red-600'
      default:
        return 'text-gray-900'
    }
  }

  const handleClientChange = async (clientId: string) => {
    const client = clients.find(c => c._id === clientId)
    if (client) {
      setSelectedClient(client)
      setClientId(clientId)
      await loadAdAccounts(clientId)
    }
  }

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const selectAllAccounts = () => {
    setSelectedAccounts(adAccounts.map(acc => acc._id))
  }

  const deselectAllAccounts = () => {
    setSelectedAccounts([])
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedAccounts.length > 0) {
      loadMetrics()
    }
  }, [clientId, niche, dateRange, selectedAccounts])

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Métricas por Nicho</h1>
          <p className="mt-2 text-sm text-gray-700">
            Acompanhe as métricas específicas por tipo de negócio
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              id="clientId"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.contractValue > 0 ? `R$ ${(client.contractValue/100).toLocaleString('pt-BR')}` : 'Sem contrato'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
              Nicho
            </label>
            <select
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {niches.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="1">Último dia</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadMetrics}
              disabled={loading || !selectedAccounts.length}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Seleção de Contas de Anúncios */}
        {adAccounts.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Contas de Anúncios ({selectedAccounts.length}/{adAccounts.length} selecionadas)
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllAccounts}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todas
                </button>
                <button
                  onClick={deselectAllAccounts}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
                >
                  Desmarcar Todas
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {adAccounts.map((account) => (
                <label key={account._id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account._id)}
                    onChange={() => handleAccountToggle(account._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {account.name || account.accountId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.niche}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Informações do Cliente Selecionado */}
      {selectedClient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">{selectedClient.name}</h3>
              <div className="mt-1 text-sm text-blue-700">
                <span className="font-medium">Contrato:</span> {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                }).format(selectedClient.contractValue / 100)} • 
                <span className="font-medium ml-2">Responsável:</span> {selectedClient.responsible || 'Não definido'} • 
                <span className="font-medium ml-2">Status:</span> {selectedClient.status === 'running' ? 'Rodando' : 
                 selectedClient.status === 'paused' ? 'Pausado' : 
                 selectedClient.status === 'completed' ? 'Concluído' : 'Não Iniciado'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Contas Selecionadas:</span> {selectedAccounts.length}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Total de contas disponíveis: {adAccounts.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedAccounts.length ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p>Selecione pelo menos uma conta de anúncios para visualizar as métricas.</p>
          </div>
        ) : metrics.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhuma métrica encontrada para este período e contas selecionadas.
          </div>
        ) : (
          metrics.map((metric) => (
            <div key={metric.key} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {metric.label}
              </h3>
              <p className={`text-3xl font-bold ${getMetricColor(metric.key, metric.value)}`}>
                {formatValue(metric.key, metric.value)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Configuração de Métricas */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Configuração de Métricas
          </h3>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Configurar
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Personalize as métricas exibidas para cada nicho de negócio. Configure alertas automáticos 
          e thresholds específicos para otimizar o acompanhamento.
        </p>
      </div>

      {/* Explicação das Métricas */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Métricas por Nicho
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cassino:</strong> FTDs, Depósitos, ROI/ROAS</li>
                <li><strong>Rifa:</strong> Tickets vendidos, Ticket médio, Conversão</li>
                <li><strong>Afiliado:</strong> Leads, Conversão, CPA, Comissões</li>
                <li><strong>E-commerce:</strong> Vendas, Ticket médio, ROI</li>
                <li><strong>Casa de Massagens:</strong> Agendamentos, Leads, Conversão</li>
                <li><strong>Genérico:</strong> Métricas básicas de tráfego</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
