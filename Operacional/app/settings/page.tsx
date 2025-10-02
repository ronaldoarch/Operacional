'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    clientId: '1',
    metaAppId: '',
    metaAppSecret: '',
    accessToken: '',
    lowBalanceThreshold: 50,
    alertsEnabled: true,
    webhookUrl: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/meta/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          accessToken: formData.accessToken,
          metaAppId: formData.metaAppId,
          metaAppSecret: formData.metaAppSecret
        })
      })

      const data = await response.json()

      if (data.ok) {
        setMessage('✅ Configurações salvas com sucesso!')
      } else {
        setMessage(`❌ Erro: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure suas integrações e preferências do sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                ID do Cliente
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ID do cliente"
                required
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Meta App Configuration</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="metaAppId" className="block text-sm font-medium text-gray-700">
                    Meta App ID
                  </label>
                  <input
                    type="text"
                    id="metaAppId"
                    name="metaAppId"
                    value={formData.metaAppId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Seu App ID do Meta"
                  />
                </div>

                <div>
                  <label htmlFor="metaAppSecret" className="block text-sm font-medium text-gray-700">
                    Meta App Secret
                  </label>
                  <input
                    type="password"
                    id="metaAppSecret"
                    name="metaAppSecret"
                    value={formData.metaAppSecret}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Seu App Secret do Meta"
                  />
                </div>

                <div>
                  <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                    Access Token (Long-lived)
                  </label>
                  <textarea
                    id="accessToken"
                    name="accessToken"
                    value={formData.accessToken}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Token de acesso de longa duração"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use um token de longa duração (60 dias) ou System User Token para operação estável
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas e Notificações</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="lowBalanceThreshold" className="block text-sm font-medium text-gray-700">
                    Threshold de Saldo Baixo (R$)
                  </label>
                  <input
                    type="number"
                    id="lowBalanceThreshold"
                    name="lowBalanceThreshold"
                    value={formData.lowBalanceThreshold}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1"
                    step="1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Alertas serão enviados quando o saldo disponível for menor que este valor
                  </p>
                </div>

                <div>
                  <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                    Webhook URL (Slack/Telegram)
                  </label>
                  <input
                    type="url"
                    id="webhookUrl"
                    name="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="alertsEnabled"
                    name="alertsEnabled"
                    checked={formData.alertsEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="alertsEnabled" className="ml-2 block text-sm text-gray-900">
                    Habilitar alertas automáticos
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Importante
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Nunca compartilhe seu App Secret ou Access Token</li>
                  <li>Use tokens de longa duração para evitar interrupções</li>
                  <li>Configure webhooks para receber alertas em tempo real</li>
                  <li>Teste as configurações após salvar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
