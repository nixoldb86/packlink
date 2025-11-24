'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import PlanModal from '@/components/PlanModal'

export default function UseCases() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  const sellSteps = language === 'es' ? [
    {
      number: 1,
      title: 'Sube tu producto',
      description: 'Dinos qué vendes, sube fotos y detalles del producto. Nuestro sistema analiza automáticamente tu artículo.',
    },
    {
      number: 2,
      title: 'Recibe tu análisis de mercado',
      description: 'Analizamos miles de anuncios en tiempo real y te entregamos todo un análisis de mercado, con información sobre la demanda de tu producto a nivel mundial.',
    },
    {
      number: 3,
      title: 'Publica con confianza',
      description: 'Usa nuestros precios recomendados y sugerencias de título/descripción para publicar en la plataforma que prefieras.',
    },
    {
      number: 4,
      title: 'Monitorea y ajusta',
      description: 'Recibe alertas cuando aparezcan competidores o cambie el mercado. Ajusta tu precio en minutos para mantenerte competitivo.',
    },
  ] : [
    {
      number: 1,
      title: 'Upload your product',
      description: 'Tell us what you\'re selling, upload photos and product details. Our system automatically analyzes your item.',
    },
    {
      number: 2,
      title: 'Get your market analysis',
      description: 'We analyze thousands of listings in real-time and deliver three prices: minimum, fast, and ideal based on current market.',
    },
    {
      number: 3,
      title: 'Publish with confidence',
      description: 'Use our recommended prices and title/description suggestions to publish on your preferred platform.',
    },
    {
      number: 4,
      title: 'Monitor and adjust',
      description: 'Receive alerts when competitors appear or the market changes. Adjust your price in minutes to stay competitive.',
    },
  ]

  const buySteps = language === 'es' ? [
    {
      number: 1,
      title: 'Cuéntanos qué buscas',
      description: 'Dinos qué producto quieres comprar, en qué estado y con qué características. Nosotros nos ocupamos del resto.',
    },
    {
      number: 2,
      title: 'Búsqueda inteligente automática',
      description: 'Nuestra IA busca en múltiples plataformas, filtra resultados no relevantes y elimina anuncios engañosos automáticamente.',
    },
    {
      number: 3,
      title: 'Recibe resultados depurados',
      description: 'Obtén una lista ordenada por precio y relevancia, con solo productos verificados que coinciden con tu búsqueda.',
    },
    {
      number: 4,
      title: 'Configura alertas personalizadas',
      description: 'Activa alertas para recibir notificaciones cuando bajen precios o aparezcan nuevos productos que te interesen.',
    },
  ] : [
    {
      number: 1,
      title: 'Tell us what you\'re looking for',
      description: 'Tell us what product you want to buy, in what condition and with what features. We take care of the rest.',
    },
    {
      number: 2,
      title: 'Automatic intelligent search',
      description: 'Our AI searches across multiple platforms, filters irrelevant results and automatically removes misleading listings.',
    },
    {
      number: 3,
      title: 'Get refined results',
      description: 'Receive a list sorted by price and relevance, with only verified products that match your search.',
    },
    {
      number: 4,
      title: 'Set up personalized alerts',
      description: 'Enable alerts to receive notifications when prices drop or new products you\'re interested in appear.',
    },
  ]

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido que conecta con HowItWorks y Stats */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white/90 to-white"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(102,126,234,0.04),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-br from-primary-50/90 via-primary-100/80 to-primary-50/90 backdrop-blur-xl border-[0.5px] border-primary-700/30 shadow-[0_8px_32px_0_rgba(102,126,234,0.15)] text-primary-700 text-sm md:text-base font-semibold mb-4 relative overflow-hidden">
            {/* Efecto de reflejo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
            <span className="relative z-10">{t('useCases.title')}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {language === 'es' 
              ? 'Dos formas de usar Pricofy'
              : 'Two ways to use Pricofy'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {language === 'es'
              ? 'Ya seas comprador o vendedor, tenemos la solución perfecta para ti. Elige el modo que mejor se adapte a tus necesidades.'
              : 'Whether you\'re a buyer or seller, we have the perfect solution for you. Choose the mode that best suits your needs.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Card: Si quieres vender */}
          <div className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-green-300 transform hover:-translate-y-2 overflow-hidden">
            {/* Gradiente de fondo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                      {t('useCases.sell.title')}
                    </h3>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {language === 'es' ? 'Para vendedores' : 'For sellers'}
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('useCases.sell.description')}
                </p>
              </div>

              {/* Flujo del vendedor */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-bold text-gray-900">
                    {language === 'es' ? 'Flujo del vendedor' : 'Seller workflow'}
                  </h4>
                </div>
              
                <div className="space-y-6">
                  {sellSteps.map((step) => (
                    <div key={step.number} className="flex items-start gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-green-100 group-hover/item:bg-green-500 flex items-center justify-center flex-shrink-0 font-bold text-green-600 group-hover/item:text-white transition-all duration-300 transform group-hover/item:scale-110 shadow-md">
                        {step.number}
                      </div>
                      <div className="flex-1 pt-1">
                        <h5 className="text-base font-bold text-gray-900 mb-1 group-hover/item:text-green-700 transition-colors">
                          {step.title}
                        </h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="group/btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('useCases.sell.button')}
                  <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Card: Si quieres comprar */}
          <div className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2 overflow-hidden">
            {/* Gradiente de fondo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                      {t('useCases.buy.title')}
                    </h3>
                    <p className="text-sm text-primary-600 font-semibold mt-1">
                      {language === 'es' ? 'Para compradores' : 'For buyers'}
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('useCases.buy.description')}
                </p>
              </div>

              {/* Flujo del comprador */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <h4 className="text-lg font-bold text-gray-900">
                    {language === 'es' ? 'Flujo del comprador' : 'Buyer workflow'}
                  </h4>
                </div>
              
                <div className="space-y-6">
                  {buySteps.map((step) => (
                    <div key={step.number} className="flex items-start gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 group-hover/item:bg-primary-500 flex items-center justify-center flex-shrink-0 font-bold text-primary-600 group-hover/item:text-white transition-all duration-300 transform group-hover/item:scale-110 shadow-md">
                        {step.number}
                      </div>
                      <div className="flex-1 pt-1">
                        <h5 className="text-base font-bold text-gray-900 mb-1 group-hover/item:text-primary-700 transition-colors">
                          {step.title}
                        </h5>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="group/btn w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('useCases.buy.button')}
                  <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </section>
  )
}
