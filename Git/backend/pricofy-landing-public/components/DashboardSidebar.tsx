'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardSidebarProps {
  filtroActivo: 'all' | 'comprar' | 'vender'
  onFiltroChange: (filtro: 'all' | 'comprar' | 'vender') => void
}

export default function DashboardSidebar({ filtroActivo, onFiltroChange }: DashboardSidebarProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  const handleFiltroClick = (filtro: 'all' | 'comprar' | 'vender') => {
    onFiltroChange(filtro)
    // Si estamos en una página de detalle, redirigir al dashboard con el filtro
    if (pathname?.includes('/dashboard/evaluation/')) {
      router.push('/dashboard')
    }
  }

  return (
    <>
      {/* Barra lateral de navegación - Fija a la izquierda en md+ */}
      <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col bg-white border-r border-gray-200 z-40">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Menú */}
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
            {language === 'es' ? 'Menú' : 'Menu'}
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => handleFiltroClick('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                filtroActivo === 'all'
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium">{language === 'es' ? 'Dashboard' : 'Dashboard'}</span>
            </button>
            
            <button
              onClick={() => handleFiltroClick('comprar')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                filtroActivo === 'comprar'
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-medium">{language === 'es' ? 'Comprar' : 'Buy'}</span>
            </button>
            
            <button
              onClick={() => handleFiltroClick('vender')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                filtroActivo === 'vender'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{language === 'es' ? 'Vender' : 'Sell'}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Barra de navegación inferior - Solo visible en móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16">
          {/* Dashboard */}
          <button
            onClick={() => handleFiltroClick('all')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'all' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'all' ? 'text-primary-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Dashboard' : 'Dashboard'}
            </span>
          </button>

          {/* Comprar */}
          <button
            onClick={() => handleFiltroClick('comprar')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'comprar' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'comprar' ? 'text-primary-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Comprar' : 'Buy'}
            </span>
          </button>

          {/* Vender */}
          <button
            onClick={() => handleFiltroClick('vender')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'vender' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'vender' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Vender' : 'Sell'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}




