import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Traffic Ops - Meta Ads Management',
  description: 'Sistema operacional para gestão de campanhas Meta Ads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Traffic Ops
                  </h1>
                </div>
                <div className="flex items-center space-x-8">
                  <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/accounts" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Contas
                  </a>
                  <a href="/clients" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Clientes
                  </a>
                  <a href="/metrics" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Métricas
                  </a>
                  <a href="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Configurações
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
