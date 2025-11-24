'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function HowItWorksGlobal() {
  const { language } = useLanguage()

  const content = language === 'es' ? {
    badge: 'Cómo Funciona',
    title: 'De búsqueda local a mercado internacional en 3 pasos',
    steps: [
      {
        number: 1,
        title: 'Una sola búsqueda',
        description: 'Dinos qué buscas o qué quieres vender. Nosotros expandimos automáticamente tu búsqueda desde tu entorno local a plataformas de todo el mundo.',
        icon: '🔍',
        detail: 'Búsqueda en múltiples países simultáneamente',
      },
      {
        number: 2,
        title: 'Filtrado inteligente automático',
        description: 'Nuestra IA limpia automáticamente los resultados, eliminando anuncios irrelevantes, accesorios y productos no relacionados. Solo ves resultados relevantes y verificados.',
        icon: '🤖',
        detail: '65% menos resultados irrelevantes',
      },
      {
        number: 3,
        title: 'Resultados globales consolidados',
        description: 'Recibe una lista depurada con productos de todo el mundo, ordenados por precio y relevancia, con información completa: precio, ubicación, país, enlace directo.',
        icon: '🌍',
        detail: 'Mercado global al alcance de un clic',
      },
    ],
  } : {
    badge: 'How It Works',
    title: 'From local search to global market in 3 steps',
    steps: [
      {
        number: 1,
        title: 'One single search',
        description: 'Tell us what you\'re looking for or what you want to sell. We automatically expand your search from your local environment to platforms worldwide.',
        icon: '🔍',
        detail: 'Search across multiple countries simultaneously',
      },
      {
        number: 2,
        title: 'Automatic intelligent filtering',
        description: 'Our AI automatically cleans results, eliminating irrelevant listings, accessories, and unrelated products. You only see relevant and verified results.',
        icon: '🤖',
        detail: '65% fewer irrelevant results',
      },
      {
        number: 3,
        title: 'Consolidated global results',
        description: 'Receive a refined list with products from around the world, sorted by price and relevance, with complete information: price, location, country, direct link.',
        icon: '🌍',
        detail: 'Global market at your fingertips',
      },
    ],
  }

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido que conecta con GlobalSolution y UseCases */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-gray-50/50 to-gray-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(102,126,234,0.05),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-br from-primary-50/90 via-primary-100/80 to-primary-50/90 backdrop-blur-xl border-[0.5px] border-primary-700/30 shadow-[0_8px_32px_0_rgba(102,126,234,0.15)] text-primary-700 text-sm md:text-base font-semibold mb-4 relative overflow-hidden">
            {/* Efecto de reflejo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
            <span className="relative z-10">{content.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            {content.title}
          </h2>
        </div>

        {/* Pasos */}
        <div className="relative">
          {/* Línea conectora (solo en desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-purple-200 to-primary-200" style={{ top: '6rem' }}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {content.steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Número de paso flotante */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {step.number}
                  </div>
                </div>

                <div className="relative bg-white rounded-3xl p-8 pt-12 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2 mt-8">
                  {/* Icono */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      {step.icon}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base mb-4">
                      {step.description}
                    </p>
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                        {step.detail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

