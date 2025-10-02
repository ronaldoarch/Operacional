'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

export default function AlertsBadge() {
  const [alertCount, setAlertCount] = useState(0)
  const [showAlerts, setShowAlerts] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    loadAlerts()
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts?status=active')
      const data = await res.json()
      if (data.ok) {
        setAlerts(data.alerts || [])
        setAlertCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      })
      loadAlerts()
    } catch (error) {
      console.error('Error marking alert as read:', error)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return '💰'
      case 'operational': return '⚙️'
      case 'satisfaction': return '😡'
      case 'performance': return '📊'
      default: return '🔔'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {showAlerts && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">Alertas Ativos</h3>
            <p className="text-sm text-gray-500">{alertCount} alertas pendentes</p>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>✅ Nenhum alerta ativo</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(alert.priority)}`}
                  onClick={() => markAsRead(alert._id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

