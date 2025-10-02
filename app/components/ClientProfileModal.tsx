'use client'

import { useState, useEffect } from 'react'
import { X, User, MessageCircle, DollarSign, TrendingUp, Clock } from 'lucide-react'

interface ClientProfileModalProps {
  clientId: string
  clientName: string
  onClose: () => void
}

export default function ClientProfileModal({ clientId, clientName, onClose }: ClientProfileModalProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [satisfaction, setSatisfaction] = useState('neutral')
  const [selectedTraits, setSelectedTraits] = useState<any>({
    behavior: [],
    communication: [],
    payment: []
  })
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadProfile()
  }, [clientId])

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/profile`)
      const data = await res.json()
      if (data.ok && data.profile) {
        setProfile(data.profile)
        setSatisfaction(data.profile.satisfactionLevel || 'neutral')
        setSelectedTraits(data.profile.traits || { behavior: [], communication: [], payment: [] })
        setNotes(data.profile.notes || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      await fetch(`/api/clients/${clientId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satisfactionLevel: satisfaction,
          traits: selectedTraits,
          notes
        })
      })
      alert('Perfil atualizado!')
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erro ao salvar perfil')
    }
  }

  const toggleTrait = (category: string, trait: string) => {
    setSelectedTraits((prev: any) => {
      const current = prev[category] || []
      const updated = current.includes(trait)
        ? current.filter((t: string) => t !== trait)
        : [...current, trait]
      return { ...prev, [category]: updated }
    })
  }

  const traits = {
    behavior: ['Carente', 'Exigente', 'Tranquilo', 'Chato', 'Legal', 'Ansioso'],
    communication: ['Responde Rápido', 'Demora', 'Detalhista', 'Objetivo', 'Emotivo'],
    payment: ['Pontual', 'Atrasado', 'Negociador', 'Inadimplente']
  }

  const getSatisfactionEmoji = (level: string) => {
    switch (level) {
      case 'satisfied': return '😊'
      case 'neutral': return '😐'
      case 'unsatisfied': return '😡'
      default: return '😐'
    }
  }

  const getSatisfactionColor = (level: string) => {
    switch (level) {
      case 'satisfied': return 'bg-green-500'
      case 'neutral': return 'bg-yellow-500'
      case 'unsatisfied': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">👤 Perfil do Cliente</h2>
            <p className="text-gray-600">{clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Nível de Satisfação */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Nível de Satisfação
            </h3>
            <div className="flex gap-4">
              {['satisfied', 'neutral', 'unsatisfied'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSatisfaction(level)}
                  className={`flex-1 p-4 rounded-lg border-2 transition ${
                    satisfaction === level
                      ? `${getSatisfactionColor(level)} text-white border-transparent`
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-4xl mb-2">{getSatisfactionEmoji(level)}</div>
                  <div className="font-semibold">
                    {level === 'satisfied' ? 'Satisfeito' : level === 'neutral' ? 'Neutro' : 'Insatisfeito'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Características - Comportamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comportamento
            </h3>
            <div className="flex flex-wrap gap-2">
              {traits.behavior.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait('behavior', trait)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selectedTraits.behavior?.includes(trait)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Características - Comunicação */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Comunicação
            </h3>
            <div className="flex flex-wrap gap-2">
              {traits.communication.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait('communication', trait)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selectedTraits.communication?.includes(trait)
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white border-gray-300 hover:border-purple-500'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Características - Pagamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pagamento
            </h3>
            <div className="flex flex-wrap gap-2">
              {traits.payment.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait('payment', trait)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selectedTraits.payment?.includes(trait)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white border-gray-300 hover:border-green-500'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Notas e Observações
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o cliente..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Histórico */}
          {profile?.history && profile.history.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">📝 Histórico de Eventos</h3>
              <div className="space-y-2">
                {profile.history.slice(0, 5).map((event: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={saveProfile}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}

