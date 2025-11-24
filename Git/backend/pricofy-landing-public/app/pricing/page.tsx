'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useForm } from '@/contexts/FormContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import PlanModal from '@/components/PlanModal'

export default function PricingPage() {
  const { language } = useLanguage()
  const { openForm } = useForm()
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'compra' | 'venta'>('compra')

  // Estructura de planes según el nuevo modelo
  const freemiumPlan = {
    name: language === 'es' ? 'Freemium' : 'Freemium',
    price: '0',
    priceUnit: language === 'es' ? '€/mes' : '€/month',
    description: language === 'es' 
      ? 'Para todos los usuarios'
      : 'For all users',
    features: {
      compra: language === 'es' 
        ? 'Busca el producto que deseas en las plataformas más relevantes de tu país.'
        : 'Unlimited national purchase searches (Spain)',
      venta: language === 'es'
        ? '1 búsqueda de venta nacional gratuita (de prueba)'
        : '1 free national sale search (trial)',
    },
    disclaimers: {
      compra: language === 'es'
        ? 'Probablemente existan productos más baratos en otros países que realizan envíos. Consulta nuestros planes internacionales o paga por uso para verlos.'
        : 'There are cheaper products in other countries that ship. Subscribe to an international plan or pay per use to see them.',
      venta: language === 'es'
        ? 'Probablemente exista una demanda superior en otros países para tu producto. Contrata un plan internacional o paga por uso para ver cómo está el mercado internacional.'
        : 'There are countries where there is more demand and better prices for your product. Subscribe to an international plan or pay per use to see the international market.',
    },
  }

  const compraPlans = [
    {
      key: 'ninja',
      name: language === 'es' ? 'Ninja' : 'Ninja',
      price: '4,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para comprar' : 'For buying',
      features: [
        language === 'es' ? '20 créditos para búsquedas internacionales del producto que quieres comprar' : '20 credits for international searches of the product you want to buy',
      ],
      color: 'purple',
    },
    {
      key: 'radar',
      name: language === 'es' ? 'Radar' : 'Radar',
      price: '22,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para comprar' : 'For buying',
      features: [
        language === 'es' ? '100 créditos que puedes usar como quieras para:' : '100 credits you can use as you wish between:',
        language === 'es' ? '• Búsquedas internacionales del producto que quieres comprar' : '• International searches of the product you want to buy',
        language === 'es' ? '• Alertas internacionales (bajadas de precio y nuevos listados)' : '• International alerts (price drops and new listings)',
      ],
      color: 'purple',
      popular: true,
    },
    {
      key: 'pay-per-use-compra',
      name: language === 'es' ? 'Pago por uso' : 'Pay per use',
      price: '0,30',
      priceUnit: language === 'es' ? '€ por búsqueda' : '€ per search',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para comprar' : 'For buying',
      features: [
        language === 'es' ? 'Muestra los resultados internacionales solo para esa búsqueda' : 'Shows international results only for that search',
      ],
      color: 'blue',
      isPayPerUse: true,
    },
  ]

  const ventaNacionalPlans = [
    {
      key: 'express',
      name: language === 'es' ? 'Express' : 'Express',
      price: '5,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'national',
      typeLabel: language === 'es' ? 'Nacional' : 'National',
      description: language === 'es' ? 'Para vender' : 'For selling',
      features: [
        language === 'es' ? '20 créditos para búsquedas de venta nacional' : '20 credits for national sale searches',
        language === 'es' ? 'Ver precios reales de mercado, competencia, oferta y demanda nacionales' : 'See real market prices, competition, supply and national demand',
      ],
      color: 'green',
      disclaimer: language === 'es'
        ? 'Probablemente exista una demanda superior en otros países para tu producto. Contrata un plan internacional o paga por uso para ver cómo está el mercado internacional.'
        : 'There are countries where there is more demand and higher prices. Subscribe to an international plan or pay per use to see the international market.',
    },
    {
      key: 'turbo',
      name: language === 'es' ? 'Turbo' : 'Turbo',
      price: '27,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'national',
      typeLabel: language === 'es' ? 'Nacional' : 'National',
      description: language === 'es' ? 'Para vender' : 'For selling',
      features: [
        language === 'es' ? '100 créditos que puedes usar como quieras para:' : '100 credits you can use as you wish between:',
        language === 'es' ? '• Búsquedas de venta nacional (estimación del precio óptimo)' : '• National sale searches (optimal price estimation)',
        language === 'es' ? '• Alertas nacionales (ver si alguien publica más barato que tú)' : '• National alerts (see if someone posts cheaper than you)',
      ],
      color: 'green',
      disclaimer: language === 'es'
        ? 'Probablemente exista una demanda superior en otros países para tu producto. Contrata un plan internacional o paga por uso para ver cómo está el mercado internacional.'
        : 'There are countries where there is more demand and higher prices. Subscribe to an international plan or pay per use to see the international market.',
    },
  ]

  const ventaInternacionalPlans = [
    {
      key: 'inter-express',
      name: language === 'es' ? 'Inter Express' : 'Inter Express',
      price: '7,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para vender' : 'For selling',
      features: [
        language === 'es' ? '20 créditos para búsquedas de venta internacional' : '20 credits for international sale searches',
        language === 'es' ? 'Ver precios reales en otros países' : 'See real prices in other countries',
      ],
      color: 'emerald',
    },
    {
      key: 'inter-turbo',
      name: language === 'es' ? 'Inter Turbo' : 'Inter Turbo',
      price: '29,99',
      priceUnit: language === 'es' ? '€/mes' : '€/month',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para vender' : 'For selling',
      features: [
        language === 'es' ? '100 créditos que puedes usar como quieras para:' : '100 credits you can use as you wish between:',
        language === 'es' ? '• Búsquedas de venta internacional' : '• International sale searches',
        language === 'es' ? '• Alertas internacionales (nuevas publicaciones y bajadas)' : '• International alerts (new listings and drops)',
        language === 'es' ? 'Generación automática de título + descripción optimizada para publicar tu producto en mercados internacionales con total seguridad' : 'Automatic generation of optimized title + description to publish your product in international markets with complete confidence',
      ],
      color: 'emerald',
      popular: true,
    },
    {
      key: 'pay-per-use-venta',
      name: language === 'es' ? 'Pago por uso' : 'Pay per use',
      price: '0,40',
      priceUnit: language === 'es' ? '€ por consulta' : '€ per query',
      type: 'international',
      typeLabel: language === 'es' ? 'Internacional' : 'International',
      description: language === 'es' ? 'Para vender' : 'For selling',
      features: [
        language === 'es' ? '1 consulta internacional puntual' : '1 specific international query',
      ],
      color: 'blue',
      isPayPerUse: true,
    },
  ]

  const getColorClasses = (color: string, isPayPerUse?: boolean) => {
    if (isPayPerUse) {
      return {
        bg: 'bg-blue-950',
        border: 'border-blue-800',
        button: 'bg-blue-600 hover:bg-blue-500',
        check: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300',
      }
    }
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-950',
          border: 'border-purple-800',
          button: 'bg-purple-600 hover:bg-purple-500',
          check: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300',
        }
      case 'green':
        return {
          bg: 'bg-green-950',
          border: 'border-green-800',
          button: 'bg-green-600 hover:bg-green-500',
          check: 'text-green-400',
          badge: 'bg-green-500/20 text-green-300',
        }
      case 'emerald':
        return {
          bg: 'bg-emerald-950',
          border: 'border-emerald-800',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          check: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300',
        }
      default:
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-700',
          button: 'bg-gray-700 hover:bg-gray-600',
          check: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-300',
        }
    }
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-6 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(102,126,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-primary-500/20 backdrop-blur-sm text-primary-300 text-sm font-medium mb-8">
            {language === 'es' ? 'Planes y Precios' : 'Plans and Pricing'}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {language === 'es' 
              ? 'Elige el plan perfecto para tus necesidades'
              : 'Choose the perfect plan for your needs'}
          </h1>
          <div className="text-sm sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            {language === 'es' ? (
              <>
                <p className="mb-2">Pricofy funciona con un modelo Freemium donde cualquier usuario puede buscar precios nacionales de forma ilimitada y probar una venta gratis.</p>
                <p>Cuando necesitas ver oportunidades en otros países —ya sea para comprar o para vender— puedes activar un plan internacional o pagar por uso.</p>
              </>
            ) : (
              <>
                <p className="mb-2">Pricofy works with a Freemium model where any user can search national prices unlimited and try a free sale.</p>
                <p>When you need to see opportunities in other countries —whether to buy cheaper or sell higher— you can activate an international plan or pay per use.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Freemium Plan */}
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 md:mb-3">
              {language === 'es' ? 'Cuenta Freemium' : 'Freemium Account'}
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              {language === 'es' ? 'Para todos los usuarios' : 'For all users'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 md:p-8 border-2 border-gray-700 shadow-2xl">
              <div className="mb-4 md:mb-8">
                <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{freemiumPlan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-bold text-white">{freemiumPlan.price}</span>
                  <span className="text-base md:text-xl text-gray-300">{freemiumPlan.priceUnit}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-4 md:mb-8">
                <div className="bg-gray-900/50 rounded-xl p-3 md:p-6 border border-gray-700">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white">
                      {language === 'es' ? 'Para comprar' : 'For buying'}
                    </h4>
                  </div>
                  <p className="text-xs md:text-base text-gray-300 mb-2 md:mb-4 leading-relaxed">{freemiumPlan.features.compra}</p>
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-2 md:p-3">
                    <p className="text-xs text-yellow-300 leading-relaxed text-center">
                      {freemiumPlan.disclaimers.compra}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-3 md:p-6 border border-gray-700">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h4 className="text-sm md:text-lg font-bold text-white">
                      {language === 'es' ? 'Para vender' : 'For selling'}
                    </h4>
                  </div>
                  <p className="text-xs md:text-base text-gray-300 mb-2 md:mb-4 leading-relaxed">{freemiumPlan.features.venta}</p>
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-2 md:p-3">
                    <p className="text-xs text-yellow-300 leading-relaxed text-center">
                      {freemiumPlan.disclaimers.venta}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón centrado abajo */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="relative px-6 md:px-10 py-2.5 md:py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold text-sm md:text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 via-white/50 via-white/30 to-transparent pointer-events-none animate-shimmer"></div>
                  <span className="relative z-10">{language === 'es' ? 'Crear cuenta gratuita' : 'Create free account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs for Compra/Venta */}
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          {/* Tab Selector */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative inline-flex items-center p-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 shadow-lg">
              {/* Indicador deslizante con efecto glassmorphism */}
              <div
                className={`absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-in-out overflow-hidden ${
                  activeTab === 'compra'
                    ? 'bg-gradient-to-br from-purple-50/90 via-purple-100/80 to-purple-50/90 backdrop-blur-xl border-[0.5px] border-purple-700/30 shadow-[0_8px_32px_0_rgba(147,51,234,0.15)] left-1.5 right-1/2'
                    : 'bg-gradient-to-br from-green-50/90 via-green-100/80 to-green-50/90 backdrop-blur-xl border-[0.5px] border-green-700/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] left-1/2 right-1.5'
                }`}
              >
                {/* Efecto de reflejo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
                {/* Efecto de brillo superior */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
              </div>
              
              <button
                onClick={() => setActiveTab('compra')}
                className={`relative z-10 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-sm md:text-base transition-colors duration-300 ${
                  activeTab === 'compra'
                    ? 'text-purple-700'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'es' ? 'Para Comprar' : 'For Buying'}
              </button>
              <button
                onClick={() => setActiveTab('venta')}
                className={`relative z-10 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-sm md:text-base transition-colors duration-300 ${
                  activeTab === 'venta'
                    ? 'text-green-700'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'es' ? 'Para Vender' : 'For Selling'}
              </button>
            </div>
          </div>

          {/* Plans for Compra */}
          {activeTab === 'compra' && (
            <div>
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                  {language === 'es' ? 'Planes para Comprar Internacionalmente' : 'International Plans for Buying'}
                </h2>
                <p className="text-gray-400 text-base md:text-lg">
                  {language === 'es' ? 'Encuentra productos más baratos en otros países' : 'Find cheaper products in other countries'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {compraPlans.map((plan) => {
                  const colors = getColorClasses(plan.color, plan.isPayPerUse)
                  return (
                    <div
                      key={plan.key}
                      className={`group relative ${colors.bg} ${colors.border} border-2 rounded-3xl p-5 md:p-6 flex flex-col transition-all duration-500 ${
                        plan.popular 
                          ? 'ring-4 ring-purple-500/50 scale-100 md:scale-105 shadow-2xl hover:scale-105 md:hover:scale-110 z-10' 
                          : 'hover:scale-105 hover:shadow-2xl z-0'
                      } overflow-hidden`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                            {language === 'es' ? 'Más Popular' : 'Most Popular'}
                          </span>
                        </div>
                      )}

                      {plan.isPayPerUse && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                          <span className={`${colors.badge} px-6 py-2 rounded-full text-sm font-bold border border-blue-700/50`}>
                            {language === 'es' ? 'Pago por uso' : 'Pay per use'}
                          </span>
                        </div>
                      )}

                      <div className="mb-4 md:mb-6">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <span className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-bold ${colors.badge} border ${colors.border}`}>
                            {plan.typeLabel}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">{plan.name}</h3>
                        <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                          <span className="text-base md:text-lg text-gray-300">{plan.priceUnit}</span>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4">{plan.description}</p>
                      </div>

                      <div className="flex-1 space-y-3 md:space-y-4 mb-4 md:mb-6">
                        {plan.features.map((feature, index) => {
                          const isSubOption = feature.startsWith('•')
                          return (
                            <div 
                              key={index} 
                              className={`flex items-start gap-2.5 md:gap-3 ${isSubOption ? 'ml-6 md:ml-8' : ''}`}
                            >
                              {isSubOption ? (
                                <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-2 md:mt-2.5"></div>
                              ) : (
                                <div className={`w-5 h-5 rounded-lg ${colors.check.includes('blue') ? 'bg-blue-400/20' : 'bg-purple-400/20'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                  <svg className={`w-3 h-3 ${colors.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                              <span className="text-gray-200 text-sm md:text-base leading-relaxed">{feature.replace('• ', '')}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="relative">
                        {/* Pegatina "Próximamente" */}
                        {!plan.isPayPerUse && (
                          <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg transform rotate-12 border-2 border-white">
                            {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (plan.isPayPerUse) {
                              setIsContactFormOpen(true)
                            } else {
                              setIsPlanModalOpen(true)
                            }
                          }}
                          className={`w-full ${colors.button} text-white px-6 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative`}
                        >
                          {plan.isPayPerUse 
                            ? (language === 'es' ? 'Contactar' : 'Contact')
                            : (language === 'es' ? 'Contratar plan' : 'Subscribe')
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Plans for Venta */}
          {activeTab === 'venta' && (
            <div>
              {/* Nacional Plans */}
              <div className="mb-8 md:mb-12">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                    {language === 'es' ? 'Planes para Vender en tu País' : 'National Plans for Selling'}
                  </h2>
                  <p className="text-gray-400 text-base md:text-lg">
                    {language === 'es' ? 'Optimiza tus precios en el mercado nacional' : 'Optimize your prices in the national market'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 mb-8 md:mb-10">
                  {ventaNacionalPlans.map((plan) => {
                    const colors = getColorClasses(plan.color)
                    return (
                      <div
                        key={plan.key}
                        className={`group relative ${colors.bg} ${colors.border} border-2 rounded-3xl p-5 md:p-6 flex flex-col transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden`}
                      >
                        <div className="mb-4 md:mb-6">
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <span className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-bold ${colors.badge} border ${colors.border}`}>
                              {plan.typeLabel}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">{plan.name}</h3>
                          <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                            <span className="text-base md:text-lg text-gray-300">{plan.priceUnit}</span>
                          </div>
                          <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4">{plan.description}</p>
                        </div>

                        <div className="flex-1 space-y-3 md:space-y-4 mb-4 md:mb-6">
                          {plan.features.map((feature, index) => {
                            const isSubOption = feature.startsWith('•')
                            return (
                              <div 
                                key={index} 
                                className={`flex items-start gap-2.5 md:gap-3 ${isSubOption ? 'ml-6 md:ml-8' : ''}`}
                              >
                                {isSubOption ? (
                                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-2 md:mt-2.5"></div>
                                ) : (
                                  <div className={`w-5 h-5 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <svg className={`w-3 h-3 ${colors.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                <span className="text-gray-200 text-sm md:text-base leading-relaxed">{feature.replace('• ', '')}</span>
                              </div>
                            )
                          })}
                        </div>

                        {plan.disclaimer && (
                          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-2.5 md:p-3 mb-4 md:mb-6">
                            <p className="text-xs md:text-sm text-yellow-300 leading-relaxed text-center">{plan.disclaimer}</p>
                          </div>
                        )}

                        <div className="relative">
                          {/* Pegatina "Próximamente" */}
                          <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg transform rotate-12 border-2 border-white">
                            {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                          </div>
                          <button
                            onClick={() => setIsPlanModalOpen(true)}
                            className={`w-full ${colors.button} text-white px-6 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative`}
                          >
                            {language === 'es' ? 'Contratar plan' : 'Subscribe'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Internacional Plans */}
              <div>
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                    {language === 'es' ? 'Planes para Vender Internacionalmente' : 'International Plans for Selling'}
                  </h2>
                  <p className="text-gray-400 text-base md:text-lg">
                    {language === 'es' ? 'Expande tu mercado a otros países' : 'Expand your market to other countries'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                  {ventaInternacionalPlans.map((plan) => {
                    const colors = getColorClasses(plan.color, plan.isPayPerUse)
                    return (
                      <div
                        key={plan.key}
                        className={`group relative ${colors.bg} ${colors.border} border-2 rounded-3xl p-6 flex flex-col transition-all duration-500 ${
                          plan.popular 
                            ? 'ring-4 ring-emerald-500/50 scale-100 md:scale-105 shadow-2xl hover:scale-105 md:hover:scale-110 z-10' 
                            : 'hover:scale-105 hover:shadow-2xl z-0'
                        } overflow-hidden`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                              {language === 'es' ? 'Más Popular' : 'Most Popular'}
                            </span>
                          </div>
                        )}

                        {plan.isPayPerUse && (
                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                            <span className={`${colors.badge} px-6 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold border border-blue-700/50`}>
                              {language === 'es' ? 'Pago por uso' : 'Pay per use'}
                            </span>
                          </div>
                        )}

                        <div className="mb-4 md:mb-6">
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <span className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-bold ${colors.badge} border ${colors.border}`}>
                              {plan.typeLabel}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">{plan.name}</h3>
                          <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                            <span className="text-base md:text-lg text-gray-300">{plan.priceUnit}</span>
                          </div>
                          <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4">{plan.description}</p>
                        </div>

                        <div className="flex-1 space-y-3 md:space-y-4 mb-4 md:mb-6">
                          {plan.features.map((feature, index) => {
                            const isSubOption = feature.startsWith('•')
                            return (
                              <div 
                                key={index} 
                                className={`flex items-start gap-2.5 md:gap-3 ${isSubOption ? 'ml-6 md:ml-8' : ''}`}
                              >
                                {isSubOption ? (
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-2 md:mt-2.5"></div>
                                ) : (
                                  <div className={`w-5 h-5 rounded-lg ${colors.check.includes('blue') ? 'bg-blue-400/20' : 'bg-emerald-400/20'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <svg className={`w-3 h-3 ${colors.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                <span className="text-gray-200 text-sm md:text-base leading-relaxed">{feature.replace('• ', '')}</span>
                              </div>
                            )
                          })}
                        </div>

                        <div className="relative">
                          {/* Pegatina "Próximamente" */}
                          {!plan.isPayPerUse && (
                            <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg transform rotate-12 border-2 border-white">
                              {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              if (plan.isPayPerUse) {
                                setIsContactFormOpen(true)
                              } else {
                                setIsPlanModalOpen(true)
                              }
                            }}
                            className={`w-full ${colors.button} text-white px-6 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative`}
                          >
                            {plan.isPayPerUse 
                              ? (language === 'es' ? 'Contactar' : 'Contact')
                              : (language === 'es' ? 'Contratar plan' : 'Subscribe')
                            }
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-primary-500/20 backdrop-blur-sm text-primary-300 text-sm font-medium mb-6">
              {language === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              {language === 'es' ? '¿Cómo funcionan los créditos?' : 'How do credits work?'}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="group bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-700 hover:border-primary-500 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                {language === 'es' ? '¿Qué son los créditos?' : 'What are credits?'}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {language === 'es' 
                  ? 'Cada búsqueda internacional (compra o venta) consume 1 crédito. Cada alerta internacional también consume créditos en el setup. Las búsquedas nacionales de compra siempre son ilimitadas, incluso sin plan.'
                  : 'Each international search (buy or sell) consumes 1 credit. Each international alert also consumes credits in the setup. National purchase searches are always unlimited, even without a plan.'}
              </p>
            </div>
            <div className="group bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-700 hover:border-primary-500 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                {language === 'es' ? '¿Puedo cambiar de plan en cualquier momento?' : 'Can I change plans at any time?'}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {language === 'es' 
                  ? 'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu cuenta. Los créditos no utilizados se mantienen hasta el final del período de facturación.'
                  : 'Yes, you can update or change your plan at any time from your account. Unused credits remain until the end of the billing period.'}
              </p>
            </div>
            <div className="group bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-700 hover:border-primary-500 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                {language === 'es' ? '¿Qué pasa si me quedo sin créditos?' : 'What happens if I run out of credits?'}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {language === 'es' 
                  ? 'Te notificaremos cuando te acerques al límite. Puedes actualizar tu plan, usar el pago por uso, o esperar al siguiente mes cuando se renueven tus créditos.'
                  : 'We will notify you when you approach the limit. You can upgrade your plan, use pay per use, or wait until next month when your credits renew.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {language === 'es' ? '¿Listo para comenzar?' : 'Ready to get started?'}
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {language === 'es' 
              ? 'Únete a cientos de usuarios que ya están optimizando sus precios con Pricofy'
              : 'Join hundreds of users who are already optimizing their prices with Pricofy'}
          </p>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="group relative px-10 py-5 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 via-white/60 via-white/40 to-transparent pointer-events-none animate-shimmer"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {language === 'es' ? 'Crear cuenta gratuita' : 'Create free account'}
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </section>

      <Footer />
      
      {/* Modal de contacto */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />

      {/* Modal de Contratar Plan */}
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </main>
  )
}
