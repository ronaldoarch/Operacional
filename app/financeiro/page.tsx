'use client'

import { useState, useEffect } from 'react'
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Payment {
  _id: string
  clientId: {
    _id: string
    name: string
  }
  dueDate: string
  paidDate?: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  daysOverdue: number
  paymentMethod: string
  notes: string
}

export default function FinanceiroPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all')

  useEffect(() => {
    loadPayments()
  }, [filter])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/payments'
        : `/api/payments?status=${filter}`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.ok) {
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (id: string) => {
    if (!confirm('Marcar como pago?')) return

    try {
      await fetch(`/api/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidDate: new Date().toISOString()
        })
      })
      loadPayments()
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'overdue': return 'Atrasado'
      default: return 'Pendente'
    }
  }

  // Calcular totais
  const totals = {
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💰 Financeiro</h1>
        <p className="text-gray-600">Gestão de pagamentos e inadimplência</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Pendente</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(totals.pending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700">Atrasado</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(totals.overdue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Pago</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.paid)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totals.pending + totals.overdue + totals.paid)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded ${filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Atrasados
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded ${filter === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Pagos
        </button>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atraso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum pagamento encontrado
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {payment.clientId?.name || 'Cliente'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {payment.daysOverdue > 0 && (
                      <span className="text-red-600 font-semibold">
                        {payment.daysOverdue} dias
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {payment.status !== 'paid' && (
                      <button
                        onClick={() => markAsPaid(payment._id)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Marcar como Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

