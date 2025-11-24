'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import PlanModal from '@/components/PlanModal'

export default function GlobalSolution() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const { language } = useLanguage()

  const content = language === 'es' ? {
    badge: 'La Solución PRICOFY',
    title: 'Globalizamos y democratizamos el mercado de segunda mano',
    subtitle: 'Una sola búsqueda. Todos los mercados. La forma más inteligente de encontrar exactamente lo que quieres.',
    solutions: [
      {
        icon: '🌍',
        title: 'Búsqueda Global Automática',
        description: 'Expandimos automáticamente tu alcance desde tu entorno limitado y conocido a plataformas de todo el mundo. Una sola búsqueda te conecta con la verdadera oferta del mercado.',
        highlight: 'De local a global en un clic',
      },
      {
        icon: '🤖',
        title: 'Filtrado Inteligente con IA',
        description: 'Limpiamos automáticamente los resultados usando IA avanzada, eliminando anuncios irrelevantes, accesorios y productos relacionados. Sería ingobernable leer miles de anuncios sin este filtrado.',
        highlight: '65% menos resultados irrelevantes',
      },
      {
        icon: '🔓',
        title: 'Democratización del Acceso',
        description: 'Antes solo unos pocos sabían buscar bien en múltiples plataformas y países. Ahora cualquiera puede acceder al mercado global de segunda mano con un solo clic.',
        highlight: 'Acceso global para todos',
      },
      {
        icon: '🔗',
        title: 'Conexión Global',
        description: 'Conectamos compradores y vendedores de todo el mundo para desbloquear la verdadera oferta y demanda. Tu producto puede encontrar su comprador ideal en cualquier país.',
        highlight: 'Mercado global conectado',
      },
    ],
    benefits: {
      buyers: {
        title: 'Para Compradores',
        items: [
          'Búsqueda automática en plataformas de todo el mundo',
          'Resultados limpios y relevantes, sin accesorios ni productos relacionados',
          'Acceso a la verdadera oferta global, no solo la de tu zona',
          'Encuentra el mejor precio en cualquier país',
        ],
      },
      sellers: {
        title: 'Para Vendedores',
        items: [
          'Conecta con compradores de todo el mundo',
          'Descubre la verdadera demanda global de tu producto',
          'Precios basados en la demanda real mundial',
          'Encuentra el comprador perfecto en cualquier país',
        ],
      },
    },
  } : {
    badge: 'The PRICOFY Solution',
    title: 'We globalize and democratize the second-hand market',
    subtitle: 'One search. All markets. The smartest way to find exactly what you want.',
    solutions: [
      {
        icon: '🌍',
        title: 'Automatic Global Search',
        description: 'We automatically expand your reach from your limited environment (Wallapop, Milanuncios…) to platforms worldwide. One search connects you with the true global supply.',
        highlight: 'From local to global in one click',
      },
      {
        icon: '🤖',
        title: 'Intelligent AI Filtering',
        description: 'We automatically clean results using advanced AI, eliminating irrelevant listings, accessories, and related products. It would be unmanageable to read thousands of listings without this filtering.',
        highlight: '65% fewer irrelevant results',
      },
      {
        icon: '🔓',
        title: 'Democratization of Access',
        description: 'Before, only a few knew how to search well across multiple platforms and countries. Now anyone can access the global second-hand market with a single click.',
        highlight: 'Global access for everyone',
      },
      {
        icon: '🔗',
        title: 'Global Connection',
        description: 'We connect buyers and sellers worldwide to unlock true supply and demand. Your product can find its ideal buyer in any country.',
        highlight: 'Connected global market',
      },
    ],
    benefits: {
      buyers: {
        title: 'For Buyers',
        items: [
          'Automatic search on platforms worldwide',
          'Clean and relevant results, without accessories or related products',
          'Access to true global supply, not just your local area',
          'Find the best price in any country',
        ],
      },
      sellers: {
        title: 'For Sellers',
        items: [
          'Connect with buyers worldwide',
          'Discover the true global demand for your product',
          'Prices based on real global demand',
          'Find the perfect buyer in any country',
        ],
      },
    },
  }

  return (
    <section className="relative pt-12 md:pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido que conecta con MarketProblem y HowItWorks */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/40 via-purple-50 via-primary-50/60 to-white/80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(102,126,234,0.18),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(139,92,246,0.15),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.9),transparent_70%)]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-br from-primary-50/90 via-primary-100/80 to-primary-50/90 backdrop-blur-xl border-[0.5px] border-primary-700/30 shadow-[0_8px_32px_0_rgba(102,126,234,0.15)] text-primary-700 text-sm md:text-base font-semibold mb-6 relative overflow-hidden">
            {/* Efecto de reflejo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
            <span className="relative z-10">{content.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {content.title}
          </h2>
        </div>

        {/* Soluciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-10 mb-20">
          {content.solutions.map((solution, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-primary-100 hover:border-primary-300 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col"
            >
              {/* Gradiente de fondo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 opacity-0 group-hover:opacity-100 rounded-2xl md:rounded-3xl transition-opacity duration-500"></div>
              
              <div className="relative">
                {/* Icono y título en la misma línea */}
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      {solution.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300 leading-tight">
                      {solution.title}
                    </h3>
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex-1 mb-3 md:mb-4">
                  <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                {/* Píldora abajo del todo, ocupando todo el ancho */}
                <div className="mt-auto pt-3 md:pt-4">
                  <span className="inline-block w-full text-center px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-primary-100 text-primary-700 text-xs md:text-sm font-semibold">
                    {solution.highlight}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Texto destacado antes de beneficios */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-lg sm:text-xl md:text-2xl text-primary-700 font-bold italic max-w-4xl mx-auto leading-relaxed">
            {language === 'es' 
              ? 'Una sola búsqueda. Todos los mercados. La forma más inteligente de encontrar exactamente lo que quieres.'
              : 'One search. All markets. The smartest way to find exactly what you want.'}
          </p>
        </div>

        {/* Beneficios para compradores y vendedores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-12">
          {/* Beneficios para compradores */}
          <div className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-primary-100 hover:border-primary-300 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col">
            {/* Icono y título en la misma línea */}
            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  🛒
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-3xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300 leading-tight">
                  {content.benefits.buyers.title}
                </h3>
              </div>
            </div>

            {/* Lista de items */}
            <div className="flex-1">
              <ul className="space-y-3 md:space-y-4">
                {content.benefits.buyers.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm md:text-lg text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Beneficios para vendedores */}
          <div className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col">
            {/* Icono y título en la misma línea */}
            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl md:text-3xl text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  💼
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300 leading-tight">
                  {content.benefits.sellers.title}
                </h3>
              </div>
            </div>

            {/* Lista de items */}
            <div className="flex-1">
              <ul className="space-y-3 md:space-y-4">
                {content.benefits.sellers.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm md:text-lg text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={() => setIsPlanModalOpen(true)}
            className="group relative px-12 py-5 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {language === 'es' ? 'Crear cuenta Gratis' : 'Create Free Account'}
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
      
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </section>
  )
}

