'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function MarketProblem() {
  const { language } = useLanguage()

  const content = language === 'es' ? {
    badge: 'El Problema Real',
    title: 'El mercado de segunda mano está fragmentado geográficamente',
    subtitle: 'Aunque estés dispuesto a comprar con envío, solo buscas en plataformas de tu zona. ¿Por qué perder oportunidades?',
    problems: [
      {
        icon: '🌍',
        title: 'Búsqueda limitada geográficamente',
        description: 'Aunque estés dispuesto a comprar con envío, solo buscas en Vinted, eBay, y plataformas locales de tu país. Te pierdes oportunidades en todo el mundo donde el mismo producto podría estar más barato o en mejor estado.',
        stat: '60% de compradores están dispuestos a comprar con envío',
      },
      {
        icon: '📦',
        title: 'Vendedores con alcance limitado',
        description: 'El 80% de vendedores están dispuestos a enviar su producto, pero solo publican en plataformas locales. Cierras la barrera limitando tu alcance a tu ciudad o país, cuando podrías vender a todo el mundo si encuentras el comprador perfecto.',
        stat: '80% de vendedores están dispuestos a enviar',
      },
      {
        icon: '🔍',
        title: 'Miles de resultados irrelevantes',
        description: 'Sería ingobernable leer cientos y miles de anuncios en plataformas de todo el mundo si la mitad de ellos son anuncios irrelevantes, accesorios o productos relacionados pero distintos.',
        stat: '65% de resultados son irrelevantes sin filtrado',
      },
      {
        icon: '💰',
        title: 'Desconocimiento de la demanda real',
        description: 'Los vendedores no conocen la verdadera demanda de su producto, ni el precio que podrían ponerle, ni si se dirigen al público correcto en la plataforma idónea del país que corresponde. El precio depende del valor que le quiera dar el comprador, y por tanto de la necesidad real del comprador que depende de muchas aristas desconocidas por el vendedor.',
        stat: 'Demanda global desconocida',
      },
    ],
  } : {
    badge: 'The Real Problem',
    title: 'The second-hand market is geographically fragmented',
    subtitle: 'Even though you\'re willing to buy with shipping, you only search on local platforms. Why lose opportunities?',
    problems: [
      {
        icon: '🌍',
        title: 'Geographically limited search',
        description: 'Even though you\'re willing to buy with shipping, you only search on Wallapop, Milanuncios or other platforms in your country. You miss opportunities worldwide where the same product could be cheaper or in better condition.',
        stat: '90% of buyers are willing to buy with shipping',
      },
      {
        icon: '📦',
        title: 'Sellers with limited reach',
        description: '80% of sellers are willing to ship their product, but only publish on local platforms. You close the barrier by limiting your reach to your city or country, when you could sell worldwide if you find the perfect buyer.',
        stat: '80% of sellers are willing to ship',
      },
      {
        icon: '🔍',
        title: 'Thousands of irrelevant results',
        description: 'It would be unmanageable to read hundreds and thousands of listings on platforms worldwide if half of them are irrelevant listings, accessories, or related but different products.',
        stat: '65% of results are irrelevant without filtering',
      },
      {
        icon: '💰',
        title: 'Unknown real demand',
        description: 'Sellers don\'t know the true demand for their product, nor the price they could set, nor if they\'re targeting the right audience on the right platform in the right country. The price depends on the value the buyer wants to give it.',
        stat: 'Global demand unknown',
      },
    ],
  }

  return (
    <section className="relative py-12 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background fluido que conecta con Hero y GlobalSolution */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-50/80 via-orange-50 via-yellow-50/90 to-primary-50/40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(239,68,68,0.15),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(251,146,60,0.12),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(102,126,234,0.1),transparent_70%)]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-br from-red-50/90 via-red-100/80 to-red-50/90 backdrop-blur-xl border-[0.5px] border-red-700/30 shadow-[0_8px_32px_0_rgba(239,68,68,0.15)] text-red-700 text-sm md:text-base font-semibold mb-4 md:mb-6 relative overflow-hidden">
            {/* Efecto de reflejo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 via-white/100 via-white/80 to-transparent pointer-events-none animate-shimmer"></div>
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
            <span className="relative z-10">{content.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-6 leading-tight px-2">
            {content.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium px-2">
            {content.subtitle}
          </p>
        </div>

        {/* Problemas en grid - Optimizado para móvil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-10">
          {content.problems.map((problem, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-red-100 hover:border-red-300 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col"
            >
              {/* Icono y título en la misma línea */}
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-2xl md:text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    {problem.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300 leading-tight">
                    {problem.title}
                  </h3>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex-1 mb-3 md:mb-4">
                <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              {/* Píldora roja abajo del todo, ocupando todo el ancho */}
              <div className="mt-auto pt-3 md:pt-4">
                <span className="inline-block w-full text-center px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-red-50 text-red-700 text-xs md:text-sm font-semibold">
                  {problem.stat}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action al final con transición fluida */}
        <div className="mt-8 md:mt-20 text-center relative">
          {/* Elemento decorativo de conexión */}
          <div className="absolute -top-4 md:-top-8 left-1/2 transform -translate-x-1/2 w-24 md:w-32 h-1 bg-gradient-to-r from-red-200 via-orange-200 to-primary-200 rounded-full"></div>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
            {language === 'es' 
              ? '¿Por qué buscar solo en tu zona cuando puedes buscar en todo el mundo?'
              : 'Why search only in your area when you can search worldwide?'}
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto px-2">
            {language === 'es'
              ? 'PRICOFY elimina estas barreras geográficas y conecta compradores y vendedores de todo el mundo'
              : 'PRICOFY eliminates these geographical barriers and connects buyers and sellers worldwide'}
          </p>
        </div>
      </div>
    </section>
  )
}

