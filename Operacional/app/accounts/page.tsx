'use client'

import { useState, useEffect } from 'react'

interface AdAccount {
  _id: string
  accountId: string
  name: string
  currency: string
  accountStatus: number
  amountSpent: number
  spendCap: number | null
  balance: number | null
  fundingSourceType: string | null
  fundingSourceName: string | null
  lastSyncAt: string
  niche?: string
  notes?: string
  tasks?: Task[]
  displayId?: number
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedClient, setSelectedClient] = useState('1')
  const [selectedNiche, setSelectedNiche] = useState('all')
  const [showTasks, setShowTasks] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [accountNotes, setAccountNotes] = useState('')

  const niches = [
    { value: 'all', label: 'Todos' },
    { value: 'casino', label: 'Cassino' },
    { value: 'rifa', label: 'Rifa' },
    { value: 'afiliado', label: 'Afiliado' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'massagem', label: 'Casa de Massagens' },
    { value: 'generic', label: 'Genérico' }
  ]

  const statusLabels: Record<number, string> = {
    1: "ACTIVE",
    2: "DISABLED",
    3: "UNSETTLED",
    7: "PENDING_RISK_REVIEW",
    8: "PENDING_SETTLEMENT",
    9: "IN_GRACE_PERIOD",
    100: "INTERNAL"
  }

  const getStatusColor = (status: number) => {
    if (status === 1) return "bg-green-100 text-green-800"
    if (status === 2) return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const formatCurrency = (value: number, currency: string) => {
    const amount = value / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getPaymentMethodName = (type: string | null) => {
    if (!type) return 'N/A'
    
    switch (type) {
      case '1':
        return 'PIX'
      case '20':
        return 'Cartão'
      case 'PREPAID':
        return 'Pré-pago'
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'BANK_TRANSFER':
        return 'Transferência'
      case 'PAYPAL':
        return 'PayPal'
      default:
        return `Tipo ${type}`
    }
  }

  const getAvailableBalance = (account: AdAccount) => {
    if (typeof account.balance === "number") {
      return account.balance / 100
    }
    if (typeof account.spendCap === "number" && typeof account.amountSpent === "number") {
      return Math.max(0, (account.spendCap - account.amountSpent) / 100)
    }
    return null
  }

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/meta/adaccounts?clientId=${selectedClient}`)
      const data = await response.json()
      if (data.ok) {
        setAccounts(processAccounts(data.accounts || []))
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncAccounts = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/meta/adaccounts?clientId=${selectedClient}&sync=true`)
      const data = await response.json()
      if (data.ok) {
        setAccounts(processAccounts(data.accounts || []))
        alert(`Sincronização concluída! ${data.count} contas atualizadas.`)
      }
    } catch (error) {
      console.error('Error syncing accounts:', error)
      alert('Erro ao sincronizar contas')
    } finally {
      setSyncing(false)
    }
  }

  // Adicionar ID sequencial e nicho padrão
  const processAccounts = (rawAccounts: any[]) => {
    return rawAccounts.map((account, index) => ({
      ...account,
      displayId: index + 1,
      niche: account.niche || 'generic',
      notes: account.notes || '',
      tasks: account.tasks || [],
      // Normalizar valores que parecem estar incorretos
      balance: normalizeAmount(account.balance),
      spendCap: normalizeAmount(account.spendCap)
    }))
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

  // Filtrar contas por nicho
  const filteredAccounts = accounts.filter(account => 
    selectedNiche === 'all' || account.niche === selectedNiche
  )

  useEffect(() => {
    loadAccounts()
  }, [selectedClient])

  useEffect(() => {
    if (editingAccount) {
      const account = accounts.find(a => a._id === editingAccount);
      setAccountNotes(account?.notes || '');
    }
  }, [editingAccount, accounts])

  const updateAccountNiche = async (accountId: string, niche: string) => {
    try {
      const response = await fetch('/api/accounts/update-niche', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, niche })
      });
      
      if (response.ok) {
        // Atualizar estado local
        setAccounts(prev => prev.map(acc => 
          acc._id === accountId ? { ...acc, niche } : acc
        ));
      }
    } catch (error) {
      console.error('Error updating niche:', error);
    }
  }

  const updatePaymentMethod = async (accountId: string, paymentMethod: string) => {
    try {
      const response = await fetch('/api/accounts/update-payment-method', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, paymentMethod })
      });
      
      if (response.ok) {
        // Mapear nome para código da Meta API
        const paymentMethodMap: { [key: string]: string } = {
          'PIX': '1',
          'Cartão': '20',
          'Pré-pago': 'PREPAID',
          'Cartão de Crédito': 'CREDIT_CARD',
          'Transferência': 'BANK_TRANSFER',
          'PayPal': 'PAYPAL'
        };
        
        const fundingSourceType = paymentMethodMap[paymentMethod] || paymentMethod;
        
        // Atualizar estado local
        setAccounts(prev => prev.map(acc => 
          acc._id === accountId ? { ...acc, fundingSourceType } : acc
        ));
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  }

  const addTask = async (accountId: string, title: string, description: string, priority: string) => {
    try {
      const response = await fetch('/api/accounts/add-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, title, description, priority })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Atualizar estado local
        setAccounts(prev => prev.map(acc => 
          acc._id === accountId ? { ...acc, tasks: [...(acc.tasks || []), data.task] } : acc
        ));
        return true;
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
    return false;
  }

  const updateNotes = async (accountId: string, notes: string) => {
    try {
      const response = await fetch('/api/accounts/update-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, notes })
      });
      
      if (response.ok) {
        // Atualizar estado local
        setAccounts(prev => prev.map(acc => 
          acc._id === accountId ? { ...acc, notes } : acc
        ));
        setEditingAccount(null);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Contas Meta Ads</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie suas contas de anúncio do Meta
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {niches.map((niche) => (
              <option key={niche.value} value={niche.value}>
                {niche.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={syncAccounts}
            disabled={syncing}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
          >
            {syncing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sincronizando...
              </>
            ) : (
              'Sincronizar Agora'
            )}
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Conta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Nicho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Saldo Disponível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Forma de Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Nenhuma conta encontrada para o nicho selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account) => {
                      const availableBalance = getAvailableBalance(account)
                      const isLowBalance = availableBalance !== null && availableBalance < 50
                      
                      return (
                        <tr key={account._id} className={isLowBalance ? "bg-red-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {account.displayId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {account.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {account.accountId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={account.niche}
                              onChange={(e) => updateAccountNiche(account._id, e.target.value)}
                              className="text-sm border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded"
                            >
                              {niches.filter(n => n.value !== 'all').map((niche) => (
                                <option key={niche.value} value={niche.value}>
                                  {niche.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.accountStatus)}`}>
                              {statusLabels[account.accountStatus] || `UNKNOWN_${account.accountStatus}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {availableBalance !== null ? (
                              <span className={`text-sm font-medium ${isLowBalance ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrency(availableBalance * 100, account.currency)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                            {isLowBalance && <div className="text-xs text-red-500">⚠️ Saldo baixo</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <select
                              value={getPaymentMethodName(account.fundingSourceType)}
                              onChange={(e) => updatePaymentMethod(account._id, e.target.value)}
                              className="text-sm border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            >
                              <option value="PIX">PIX</option>
                              <option value="Cartão">Cartão</option>
                              <option value="Pré-pago">Pré-pago</option>
                              <option value="Cartão de Crédito">Cartão de Crédito</option>
                              <option value="Transferência">Transferência</option>
                              <option value="PayPal">PayPal</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowTasks(showTasks === account._id ? null : account._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver tarefas"
                              >
                                📋
                              </button>
                              <button
                                onClick={() => setEditingAccount(editingAccount === account._id ? null : account._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Adicionar anotação"
                              >
                                ✏️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Tarefas */}
      {showTasks && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tarefas - Conta {accounts.find(a => a._id === showTasks)?.displayId}
              </h3>
              
              {/* Lista de tarefas */}
              <div className="space-y-2 mb-4">
                {accounts.find(a => a._id === showTasks)?.tasks?.map((task) => (
                  <div key={task.id} className="p-2 border rounded bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário para nova tarefa */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Adicionar Nova Tarefa</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Título da tarefa"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <textarea
                    placeholder="Descrição"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                  />
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="low">Baixa Prioridade</option>
                    <option value="medium">Média Prioridade</option>
                    <option value="high">Alta Prioridade</option>
                  </select>
                  <button 
                    onClick={async () => {
                      if (newTaskTitle.trim()) {
                        const success = await addTask(showTasks, newTaskTitle, newTaskDescription, newTaskPriority);
                        if (success) {
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setNewTaskPriority('medium');
                        }
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Adicionar Tarefa
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowTasks(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anotações */}
      {editingAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Anotações - Conta {accounts.find(a => a._id === editingAccount)?.displayId}
              </h3>
              
              <textarea
                placeholder="Adicione suas anotações sobre esta conta..."
                value={accountNotes}
                onChange={(e) => setAccountNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={6}
              />

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setAccountNotes('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => updateNotes(editingAccount, accountNotes)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Salvar Anotação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
