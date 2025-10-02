'use client'

import { useState } from 'react'
import { FileText, Download, Send, Calendar, BarChart } from 'lucide-react'

export default function RelatoriosPage() {
  const [generating, setGenerating] = useState(false)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Relatórios</h1>
        <p className="text-gray-600">Gere relatórios profissionais com dados automáticos e manuais</p>
      </div>

      {/* Gerar Novo Relatório */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Gerar Novo Relatório</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg">
              <option>Selecione um cliente...</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="standard">Padrão</option>
              <option value="executive">Executivo</option>
              <option value="detailed">Detalhado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Início</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Fim</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Seções do Relatório</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Resumo Executivo', 'Métricas', 'Campanhas', 'Gráficos', 'Linha do Tempo', 'OKRs', 'Sugestões'].map((section) => (
              <label key={section} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">{section}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">FTDs (manual)</label>
            <input
              type="number"
              placeholder="42"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Depósitos (R$)</label>
            <input
              type="number"
              placeholder="15000"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tickets Vendidos</label>
            <input
              type="number"
              placeholder="1250"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            <FileText className="w-5 h-5" />
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Relatórios Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Relatórios Recentes</h2>
        </div>
        
        <div className="p-8 text-center text-gray-500">
          <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p>Nenhum relatório gerado ainda</p>
          <p className="text-sm mt-2">Gere seu primeiro relatório acima!</p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2">📈 Recursos do Gerador de Relatórios</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Dados automáticos integrados com Meta Ads API</li>
          <li>✅ Inserção de dados manuais (FTDs, depósitos, conversões)</li>
          <li>✅ Gráficos e visualizações profissionais</li>
          <li>✅ Linha do tempo com principais eventos</li>
          <li>✅ Progresso de OKRs incluído</li>
          <li>✅ Export para PDF (em breve)</li>
          <li>✅ Envio automático por email (em breve)</li>
        </ul>
      </div>
    </div>
  )
}

