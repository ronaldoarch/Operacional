'use client'

import { useState, useEffect } from 'react'

interface Client {
  _id: string
  name: string
  status: string
  contractValue: number
  contractCurrency: string
}

interface OperationalMetrics {
  pmt: number
  pmedt: number
  pb: number
  onboarding: number
  renewed: number
  notRenewed: number
  totalContractValue: number
  totalClients: number
  mmr: number
  churnRate: number
  byResponsible: Array<{
    responsible: string
    revenue: number
    cost: number
    clientCount: number
    revenuePercentage: number
    costPercentage: number
    contracts: Array<{
      clientName: string
      value: number
      status: string
      renewed: boolean
    }>
  }>
}

interface DashboardData {
  totalClients: number
  totalContractValue: number
  totalAccounts: number
  alerts: number
  clients: Client[]
  operationalMetrics: OperationalMetrics | null
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClients: 0,
    totalContractValue: 0,
    totalAccounts: 0,
    alerts: 0,
    clients: [],
    operationalMetrics: null
  })
  const [loading, setLoading] = useState(true)

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    // Para valores da planilha, já estão em reais, não em centavos
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar clientes
      const clientsResponse = await fetch('/api/clients')
      const clientsData = await clientsResponse.json()
      
      // Carregar contas
      const accountsResponse = await fetch('/api/meta/adaccounts?clientId=1')
      const accountsData = await accountsResponse.json()
      
      // Carregar métricas operacionais
      const metricsResponse = await fetch('/api/dashboard/metrics')
      const metricsData = await metricsResponse.json()
      
      if (clientsData.ok) {
        const clients = clientsData.clients || []
        const totalAccounts = accountsData.ok ? accountsData.count || 0 : 0
        
        setDashboardData({
          totalClients: clients.length,
          totalContractValue: metricsData.ok ? metricsData.metrics.totalContractValue : 0,
          totalAccounts,
          alerts: 0, // TODO: implementar alertas
          clients: clients.slice(0, 5), // Mostrar apenas os primeiros 5
          operationalMetrics: metricsData.ok ? metricsData.metrics : null
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Operacional
        </h1>
        
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(dashboardData.totalContractValue)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">MMR</h3>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData.operationalMetrics ? formatCurrency(dashboardData.operationalMetrics.mmr) : 'R$ 0,00'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Taxa de Churn</h3>
            <p className="text-2xl font-bold text-red-600">
              {dashboardData.operationalMetrics ? `${dashboardData.operationalMetrics.churnRate.toFixed(2)}%` : '0%'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contas Meta</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData.totalAccounts}</p>
          </div>
        </div>

        {/* Métricas Operacionais */}
        {dashboardData.operationalMetrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status/Tracking */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Operacional</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PMT:</span>
                    <span className="font-bold text-blue-600">{dashboardData.operationalMetrics.pmt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PMEDT:</span>
                    <span className="font-bold text-blue-600">{dashboardData.operationalMetrics.pmedt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PB:</span>
                    <span className="font-bold text-blue-600">{dashboardData.operationalMetrics.pb}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ONBOARDING:</span>
                    <span className="font-bold text-blue-600">{dashboardData.operationalMetrics.onboarding}</span>
                  </div>
                </div>
              </div>

              {/* Renovação */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Renovação</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Renova:</span>
                    <span className="font-bold text-green-600">{dashboardData.operationalMetrics.renewed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">N Renova:</span>
                    <span className="font-bold text-red-600">{dashboardData.operationalMetrics.notRenewed}</span>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Clientes:</span>
                    <span className="font-bold text-gray-900">{dashboardData.operationalMetrics.totalClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receita Total:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(dashboardData.operationalMetrics.totalContractValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Receita por Responsável */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Receita por Responsável</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % ao Faturamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.operationalMetrics.byResponsible.map((item, index) => (
                      <tr key={index} className={item.costPercentage > 15 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.responsible}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.costPercentage > 15 ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.costPercentage.toFixed(2)}%
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.revenuePercentage > 40 ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.revenuePercentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        R$ 88.150,00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        R$ 8.500,00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        9,64%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        100.00%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.clients.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum cliente encontrado. <a href="/clients" className="text-blue-600 hover:text-blue-800">Importar planilha</a>
              </div>
            ) : (
              dashboardData.clients.map((client) => (
                <div key={client._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-500">
                      Contrato: {formatCurrency(client.contractValue, client.contractCurrency)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === 'running' ? 'bg-green-100 text-green-800' :
                    client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    client.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status === 'running' ? 'Rodando' :
                     client.status === 'paused' ? 'Pausado' :
                     client.status === 'completed' ? 'Concluído' :
                     'Não Iniciado'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
