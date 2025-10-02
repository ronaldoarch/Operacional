'use client'

import { useState, useEffect } from 'react'
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'

interface OKR {
  _id: string
  clientId: string
  niche: string
  period: string
  startDate: string
  endDate: string
  progress: number
  objectives: {
    name: string
    keyResults: {
      metric: string
      target: number
      current: number
      unit: string
      status: string
    }[]
  }[]
}

export default function OKRsPage() {
  const [okrs, setOKRs] = useState<OKR[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOKRs()
  }, [])

  const loadOKRs = async () => {
    // TODO: Implementar busca de OKRs de todos os clientes
    // Por enquanto, buscar de um cliente específico
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'on_track': return <Circle className="w-5 h-5 text-green-500" />
      case 'at_risk': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'off_track': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Circle className="w-5 h-5 text-gray-500" />
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎯 OKRs</h1>
        <p className="text-gray-600">Objetivos e Resultados-Chave por Cliente</p>
      </div>

      {/* Em Construção */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <Target className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">OKRs em Desenvolvimento</h2>
        <p className="text-gray-600 mb-4">
          A funcionalidade de OKRs está sendo finalizada. Em breve você poderá:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
          <li>✅ Criar OKRs personalizados por nicho</li>
          <li>✅ Definir Key Results com metas</li>
          <li>✅ Acompanhar progresso em tempo real</li>
          <li>✅ Ver status: on track, at risk, off track</li>
          <li>✅ Dashboard visual de todos os OKRs</li>
        </ul>
      </div>

      {/* Preview de como ficará */}
      <div className="mt-8 bg-white rounded-lg shadow p-6 opacity-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Cliente: PixRaspa</h3>
            <p className="text-gray-600">Nicho: Cassino | Período: Out/2025</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">75%</p>
            <p className="text-sm text-gray-600">Progresso Total</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }} />
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Objetivo: Maximizar ROI e FTDs</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm">ROI ≥ 3x</span>
                </div>
                <span className="text-sm font-semibold">Atual: 3.2x ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">FTDs ≥ 50/mês</span>
                </div>
                <span className="text-sm font-semibold">Atual: 42 (84%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

