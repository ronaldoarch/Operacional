'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, TrendingUp, User, DollarSign, Settings, X } from 'lucide-react'

interface Suggestion {
  _id: string
  clientId: {
    _id: string
    name: string
  }
  type: string
  priority: string
  title: string
  description: string
  action: string
  reason: string
  aiGenerated: boolean
  status: string
  createdAt: string
}

export default function SugestoesPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'dismissed'>('pending')

  useEffect(() => {
    // TODO: Implementar busca de sugestões
    setLoading(false)
  }, [filter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'behavior': return <User className="w-5 h-5 text-purple-500" />
      case 'financial': return <DollarSign className="w-5 h-5 text-green-500" />
      case 'operational': return <Settings className="w-5 h-5 text-orange-500" />
      default: return <Lightbulb className="w-5 h-5 text-yellow-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💡 Sugestões IA</h1>
        <p className="text-gray-600">Recomendações inteligentes baseadas em dados e comportamento</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded ${filter === 'done' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Concluídas
        </button>
        <button
          onClick={() => setFilter('dismissed')}
          className={`px-4 py-2 rounded ${filter === 'dismissed' ? 'bg-gray-500 text-white' : 'bg-gray-200'}`}
        >
          Dispensadas
        </button>
      </div>

      {/* Preview de Sugestões */}
      <div className="space-y-4">
        {/* Exemplo 1 */}
        <div className="bg-white rounded-lg shadow border-l-4 border-red-500 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">ROI Abaixo da Meta</h3>
                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">urgent</span>
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">🤖 IA</span>
              </div>
              <p className="text-gray-700 mb-3">
                Cliente PixRaspa está com ROI 20% abaixo da meta do nicho Cassino
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-sm font-semibold mb-1">💡 Ação Recomendada:</p>
                <p className="text-sm text-gray-700">
                  Revisar criativos - últimos 3 têm CTR 40% menor. Sugestão: testar novo copy mais direto
                </p>
              </div>
              <p className="text-xs text-gray-500">
                <strong>Razão:</strong> Análise de performance comparada com histórico e benchmark do nicho
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Marcar como Feito
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Dispensar
            </button>
          </div>
        </div>

        {/* Exemplo 2 */}
        <div className="bg-white rounded-lg shadow border-l-4 border-purple-500 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <User className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Cliente Precisa de Atenção</h3>
                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">high</span>
              </div>
              <p className="text-gray-700 mb-3">
                Cliente marcado como "Carente" não tem contato há 5 dias
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                <p className="text-sm font-semibold mb-1">💡 Ação Recomendada:</p>
                <p className="text-sm text-gray-700">
                  Agendar call de alinhamento amanhã. Template sugerido: "Olá! Como estão os resultados?"
                </p>
              </div>
              <p className="text-xs text-gray-500">
                <strong>Razão:</strong> Perfil indica necessidade de contato frequente
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Marcar como Feito
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Dispensar
            </button>
          </div>
        </div>

        {/* Exemplo 3 */}
        <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Pagamento Atrasado</h3>
                <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">high</span>
              </div>
              <p className="text-gray-700 mb-3">
                Cliente com 3 dias de atraso no pagamento
              </p>
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <p className="text-sm font-semibold mb-1">💡 Ação Recomendada:</p>
                <p className="text-sm text-gray-700">
                  Enviar mensagem educada: "Olá! Notamos que o pagamento está pendente. Podemos ajudar?"
                </p>
              </div>
              <p className="text-xs text-gray-500">
                <strong>Razão:</strong> Histórico de pagamento indica que cliente responde bem a lembretes
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Marcar como Feito
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Dispensar
            </button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-8 h-8 text-purple-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold mb-2">🤖 Sugestões Inteligentes</h3>
            <p className="text-gray-700">
              O sistema analisa continuamente performance, comportamento e dados financeiros para
              gerar recomendações personalizadas. As sugestões são priorizadas automaticamente
              baseadas em urgência e impacto potencial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

