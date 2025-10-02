'use client'

import { useState, useEffect } from 'react'

interface Client {
  _id: string
  name: string
  email: string
  company?: string
  contractValue: number
  contractCurrency: string
  responsible: string
  priority: number
  referralPotential: string
  renewed: boolean
  renewalResponsible: string
  tracking: string
  status: 'not_started' | 'running' | 'paused' | 'completed'
  statusComments: Array<{
    status: string
    comment: string
    createdAt: string
    updatedBy: string
  }>
  totalSpend: number
  totalRevenue: number
  roi: number
  lastRoiUpdate?: string
  niche: string
  notes: string
  createdAt: string
}

const statusLabels = {
  not_started: 'Não Iniciado',
  running: 'Rodando',
  paused: 'Pausado',
  completed: 'Concluído'
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800',
  running: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800'
}

const getPriorityLabel = (priority: number): string => {
  const labels: { [key: number]: string } = {
    0: 'Baixa',
    1: 'Média', 
    2: 'Alta'
  }
  return labels[priority] || 'Não definido'
}

const getPriorityColor = (priority: number): string => {
  const colors: { [key: number]: string } = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-yellow-100 text-yellow-800',
    2: 'bg-red-100 text-red-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  // Estados para modais de adicionar/remover
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showRoiModal, setShowRoiModal] = useState(false)
  const [importing, setImporting] = useState(false)
  
  // Form states
  const [contractValue, setContractValue] = useState('')
  const [responsible, setResponsible] = useState('')
  const [niche, setNiche] = useState('generic')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('not_started')
  const [statusComment, setStatusComment] = useState('')
  
  // Novos estados para perfil
  const [satisfaction, setSatisfaction] = useState('neutral')
  const [behaviorTraits, setBehaviorTraits] = useState<string[]>([])
  const [communicationTraits, setCommunicationTraits] = useState<string[]>([])
  const [paymentTraits, setPaymentTraits] = useState<string[]>([])
  const [nextPaymentDate, setNextPaymentDate] = useState('')
  
  // Estados para adicionar cliente
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientContractValue, setNewClientContractValue] = useState('')
  const [newClientResponsible, setNewClientResponsible] = useState('')
  const [newClientPriority, setNewClientPriority] = useState('2')
  const [newClientNiche, setNewClientNiche] = useState('generic')
  const [newClientNotes, setNewClientNotes] = useState('')

  const niches = [
    { value: 'generic', label: 'Genérico' },
    { value: 'casino', label: 'Cassino' },
    { value: 'rifa', label: 'Rifa' },
    { value: 'afiliado', label: 'Afiliado' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'massagem', label: 'Casa de Massagens' }
  ]

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    const amount = value / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const loadClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      if (data.ok) {
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContract = async () => {
    if (!selectedClient) return

    try {
      const response = await fetch('/api/clients/update-contract', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient._id,
          contractValue: parseFloat(contractValue),
          responsible,
          niche,
          notes
        })
      })

      if (response.ok) {
        await loadClients()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating contract:', error)
    }
  }

  const updateStatus = async () => {
    if (!selectedClient) return

    try {
      const response = await fetch('/api/clients/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient._id,
          status,
          comment: statusComment,
          updatedBy: 'Usuário'
        })
      })

      if (response.ok) {
        await loadClients()
        setShowStatusModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const calculateROI = async (client: Client) => {
    try {
      const response = await fetch('/api/clients/calculate-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client._id })
      })

      if (response.ok) {
        await loadClients()
        setShowRoiModal(false)
      }
    } catch (error) {
      console.error('Error calculating ROI:', error)
    }
  }

  const importFromSheet = async () => {
    setImporting(true)
    try {
      const response = await fetch('/api/clients/import-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Importação concluída! ${data.summary.imported} novos clientes, ${data.summary.updated} atualizados.`)
        await loadClients()
      }
    } catch (error) {
      console.error('Error importing from sheet:', error)
      alert('Erro ao importar dados da planilha')
    } finally {
      setImporting(false)
    }
  }

  const syncWithSheet = async () => {
    setImporting(true)
    try {
      const response = await fetch('/api/clients/sync-sheet', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`🔄 Sincronização concluída! ${data.summary.imported} novos, ${data.summary.updated} atualizados, ${data.summary.errors} erros`)
        await loadClients()
      }
    } catch (error) {
      console.error('Error syncing with sheet:', error)
      alert('Erro ao sincronizar com a planilha')
    } finally {
      setImporting(false)
    }
  }

  const addClient = async () => {
    if (!newClientName.trim()) {
      alert('Nome do cliente é obrigatório')
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/clients/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          contractValue: parseFloat(newClientContractValue) || 0,
          responsible: newClientResponsible,
          priority: parseInt(newClientPriority),
          niche: newClientNiche,
          notes: newClientNotes
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Cliente "${newClientName}" criado com sucesso!`)
        resetAddClientForm()
        setShowAddModal(false)
        await loadClients()
      } else {
        const errorData = await response.json()
        alert('Erro ao criar cliente: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Erro ao criar cliente')
    } finally {
      setImporting(false)
    }
  }

  const deleteClient = async () => {
    if (!clientToDelete) return

    setImporting(true)
    try {
      const response = await fetch('/api/clients/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientToDelete._id })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`🗑️ Cliente "${clientToDelete.name}" removido com sucesso!`)
        setShowDeleteModal(false)
        setClientToDelete(null)
        await loadClients()
      } else {
        const errorData = await response.json()
        alert('Erro ao remover cliente: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Erro ao remover cliente')
    } finally {
      setImporting(false)
    }
  }

  const resetAddClientForm = () => {
    setNewClientName('')
    setNewClientEmail('')
    setNewClientContractValue('')
    setNewClientResponsible('')
    setNewClientPriority('2')
    setNewClientNiche('generic')
    setNewClientNotes('')
  }

  const openDeleteModal = (client: Client) => {
    setClientToDelete(client)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setContractValue('')
    setResponsible('')
    setNiche('generic')
    setNotes('')
    setStatus('not_started')
    setStatusComment('')
    setSelectedClient(null)
  }

  const openEditModal = (client: Client) => {
    setSelectedClient(client)
    setContractValue((client.contractValue / 100).toString())
    setResponsible(client.responsible)
    setNiche(client.niche)
    setNotes(client.notes)
    setShowModal(true)
  }

  const openStatusModal = (client: Client) => {
    setSelectedClient(client)
    setStatus(client.status)
    setStatusComment('')
    setShowStatusModal(true)
  }

  const openRoiModal = (client: Client) => {
    setSelectedClient(client)
    setShowRoiModal(true)
  }

  useEffect(() => {
    loadClients()
  }, [])

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie informações de contratos, status e métricas dos clientes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={importing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            ➕ Adicionar Cliente
          </button>
          
          <button
            onClick={importFromSheet}
            disabled={importing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            {importing ? 'Importando...' : 'Importar Planilha'}
          </button>
          
          <button
            onClick={syncWithSheet}
            disabled={importing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            {importing ? 'Sincronizando...' : '🔄 Sincronizar'}
          </button>
          
          <button
            onClick={loadClients}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Valor Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Renovação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Nenhum cliente encontrado. Clique em &quot;Importar Planilha&quot; para carregar os dados.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {client.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.tracking || 'Sem tracking'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(client.priority)}`}>
                            {getPriorityLabel(client.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(client.contractValue, client.contractCurrency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{client.responsible || 'Não definido'}</div>
                            {client.referralPotential && (
                              <div className="text-xs text-gray-500">
                                Indicação: {client.referralPotential}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>
                            {statusLabels[client.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className={`font-medium ${client.renewed ? 'text-green-600' : 'text-red-600'}`}>
                              {client.renewed ? 'Renovado' : 'Não Renovado'}
                            </div>
                            {client.renewalResponsible && (
                              <div className="text-xs text-gray-500">
                                {client.renewalResponsible}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className={`font-medium ${(client.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(client.roi || 0).toFixed(2)}%
                            </div>
                            {client.lastRoiUpdate && (
                              <div className="text-xs text-gray-500">
                                {new Date(client.lastRoiUpdate).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(client)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar informações"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => openStatusModal(client)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Alterar status"
                            >
                              🔄
                            </button>
                            <button
                              onClick={() => openRoiModal(client)}
                              className="text-green-600 hover:text-green-900"
                              title="Calcular ROI"
                            >
                              📊
                            </button>
                            <button
                              onClick={() => openDeleteModal(client)}
                              className="text-red-600 hover:text-red-900"
                              title="Remover cliente"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Cliente: {selectedClient.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Contrato (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsável</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nicho</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {niches.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Nível de Satisfação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Satisfação</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSatisfaction('satisfied')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                        satisfaction === 'satisfied'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      😊 Satisfeito
                    </button>
                    <button
                      type="button"
                      onClick={() => setSatisfaction('neutral')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                        satisfaction === 'neutral'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      😐 Neutro
                    </button>
                    <button
                      type="button"
                      onClick={() => setSatisfaction('unsatisfied')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                        satisfaction === 'unsatisfied'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      😡 Insatisfeito
                    </button>
                  </div>
                </div>
                
                {/* Características */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-1">Comportamento:</div>
                    <div className="flex flex-wrap gap-1">
                      {['Carente', 'Exigente', 'Tranquilo', 'Legal'].map((trait) => (
                        <button
                          key={trait}
                          type="button"
                          onClick={() => {
                            setBehaviorTraits(prev =>
                              prev.includes(trait)
                                ? prev.filter(t => t !== trait)
                                : [...prev, trait]
                            )
                          }}
                          className={`px-2 py-1 rounded text-xs transition ${
                            behaviorTraits.includes(trait)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-1 mt-2">Pagamento:</div>
                    <div className="flex flex-wrap gap-1">
                      {['Pontual', 'Atrasado', 'Negociador'].map((trait) => (
                        <button
                          key={trait}
                          type="button"
                          onClick={() => {
                            setPaymentTraits(prev =>
                              prev.includes(trait)
                                ? prev.filter(t => t !== trait)
                                : [...prev, trait]
                            )
                          }}
                          className={`px-2 py-1 rounded text-xs transition ${
                            paymentTraits.includes(trait)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Data do Próximo Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Próximo Pagamento</label>
                  <input
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateContract}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Status */}
      {showStatusModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Alterar Status: {selectedClient.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="not_started">Não Iniciado</option>
                    <option value="running">Rodando</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comentário sobre o status</label>
                  <textarea
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Explique o motivo da mudança de status..."
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateStatus}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
                >
                  Atualizar Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ROI */}
      {showRoiModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Calcular ROI: {selectedClient.name}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Métricas Atuais</h4>
                  <div className="space-y-1 text-sm">
                    <div>Valor do Contrato: {formatCurrency(selectedClient.contractValue)}</div>
                    <div>Total Gasto: {formatCurrency(selectedClient.totalSpend)}</div>
                    <div>Total Receita: {formatCurrency(selectedClient.totalRevenue)}</div>
                    <div className="font-medium">
                      ROI Atual: <span className={(selectedClient.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(selectedClient.roi || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Esta ação irá recalcular o ROI baseado nos dados mais recentes das contas de anúncio e eventos.
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRoiModal(false)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => calculateROI(selectedClient)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Calcular ROI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ➕ Adicionar Novo Cliente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Cliente *</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Contrato (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newClientContractValue}
                    onChange={(e) => setNewClientContractValue(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsável</label>
                  <input
                    type="text"
                    value={newClientResponsible}
                    onChange={(e) => setNewClientResponsible(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                  <select
                    value={newClientPriority}
                    onChange={(e) => setNewClientPriority(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="0">Baixa</option>
                    <option value="1">Média</option>
                    <option value="2">Alta</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nicho</label>
                  <select
                    value={newClientNiche}
                    onChange={(e) => setNewClientNiche(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {niches.map(niche => (
                      <option key={niche.value} value={niche.value}>{niche.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetAddClientForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={addClient}
                  disabled={importing}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {importing ? 'Criando...' : 'Criar Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Exclusão */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                Confirmar Exclusão
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                Tem certeza que deseja remover o cliente <strong>&quot;{clientToDelete.name}&quot;</strong>?
                <br />
                <span className="text-red-600">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setClientToDelete(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteClient}
                  disabled={importing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {importing ? 'Removendo...' : '🗑️ Remover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
