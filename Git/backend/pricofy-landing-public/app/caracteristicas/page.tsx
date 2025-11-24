'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HowItWorksGlobal from '@/components/HowItWorksGlobal'
import UseCases from '@/components/UseCases'

export default function FeaturesPage() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      {/* Características Principales Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background fluido */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 via-white via-purple-50/20 to-white"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(139,92,246,0.06),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-br from-primary-50/90 via-primary-100/80 to-primary-50/90 backdrop-blur-xl border-[0.5px] border-primary-700/30 shadow-[0_8px_32px_0_rgba(102,126,234,0.15)] text-primary-700 text-sm md:text-base font-semibold mb-4 relative overflow-hidden">
              {/* Efecto de reflejo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
              {/* Efecto de brillo superior */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
              <span className="relative z-10">{t('features.title')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              {t('features.subtitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {language === 'es'
                ? 'Descubre todas las herramientas y funcionalidades que hacen de Pricofy la solución perfecta para optimizar tus precios.'
                : 'Discover all the tools and features that make Pricofy the perfect solution to optimize your prices.'}
            </p>
          </div>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <HowItWorksGlobal />

      {/* Dos formas de usar Pricofy Section */}
      <UseCases />

      <Footer />
    </main>
  )
}
