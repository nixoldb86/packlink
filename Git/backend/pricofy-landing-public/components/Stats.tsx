'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Stats() {
  const { language } = useLanguage()

  const stats = language === 'es' ? [
    {
      value: '🌍',
      label: 'Búsqueda Global',
      description: 'Plataformas de múltiples países en una sola búsqueda',
      highlight: 'Mercado mundial',
    },
    {
      value: '🤖',
      label: 'Filtrado Inteligente',
      description: '65% menos resultados irrelevantes gracias a nuestra IA',
      highlight: 'Resultados limpios',
    },
    {
      value: '🔓',
      label: 'Acceso Democratizado',
      description: 'Antes solo unos pocos sabían buscar bien. Ahora cualquiera puede.',
      highlight: 'Para todos',
    },
  ] : [
    {
      value: '🌍',
      label: 'Global Search',
      description: 'Platforms from multiple countries in a single search',
      highlight: 'Worldwide market',
    },
    {
      value: '🤖',
      label: 'Intelligent Filtering',
      description: '65% fewer irrelevant results thanks to our AI',
      highlight: 'Clean results',
    },
    {
      value: '🔓',
      label: 'Democratized Access',
      description: 'Before, only a few knew how to search well. Now anyone can.',
      highlight: 'For everyone',
    },
  ]

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido que conecta con UseCases y Features */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-primary-50/20 to-primary-50/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(102,126,234,0.08),transparent_70%)]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2 text-center"
            >
              {/* Gradiente sutil en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="text-6xl sm:text-7xl md:text-8xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {stat.value}
                </div>
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                    {stat.highlight}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                  {stat.label}
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

