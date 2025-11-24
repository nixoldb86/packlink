'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import PlanModal from '@/components/PlanModal'

export default function Hero() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <section className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido con gradiente largo */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white via-purple-50 to-red-50/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(102,126,234,0.12),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.12),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(239,68,68,0.08),transparent_70%)]"></div>
      
      {/* Elementos decorativos flotantes más fluidos */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-16 left-1/2 w-96 h-96 bg-red-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
            {language === 'es' ? 'Plataforma de Inteligencia para mercados de segunda mano' : 'Second-hand price intelligence platform'}
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-[1.1] animate-fade-in-up">
            <span className="block">
              {language === 'es' ? 'El Universo de' : 'The global market of'}
            </span>
            <span className="block bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 bg-clip-text text-transparent">
              {language === 'es' ? 'segunda mano, en un solo click' : 'second-hand, in one place'}
            </span>
          </h1>
          
          <div className="flex justify-center mb-8 animate-fade-in-up animation-delay-200">
            <button 
              onClick={() => setIsPlanModalOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">{t('hero.startFree')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <p className="text-lg text-gray-700 mb-4 md:mb-6 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
            {language === 'es'
              ? 'Expandimos automáticamente tu búsqueda desde tu entorno local a plataformas de todo el mundo, conectando compradores y vendedores globalmente.'
              : 'We automatically expand your search from your local environment to platforms worldwide, connecting buyers and sellers globally.'}
          </p>
        </div>
      </div>
      
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </section>
  )
}
