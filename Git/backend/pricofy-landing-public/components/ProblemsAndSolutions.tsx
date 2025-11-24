'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'

export default function ProblemsAndSolutions() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  const problems = language === 'es' ? [
    {
      title: 'Problemas para Vendedores',
      icon: '💼',
      items: [
        {
          problem: 'Alcance limitado geográficamente',
          description: 'El 80% de vendedores están dispuestos a enviar su producto, pero solo publican en plataformas locales o nacionales. Cierras la barrera limitando tu alcance a tu ciudad o país, cuando podrías vender a todo el mundo si encuentras el comprador perfecto.',
          solution: 'PRICOFY te conecta con compradores de todo el mundo, desbloqueando la verdadera demanda global. Tu producto puede encontrar su comprador ideal en cualquier país, maximizando tu precio de venta.',
        },
        {
          problem: 'Desconocimiento de la demanda real',
          description: 'No conoces la verdadera demanda de tu producto, ni el precio que podrías o deberías ponerle, ni si te diriges al público correcto en la plataforma idónea del país que corresponde. El precio de venta depende del valor que le quiera dar el comprador.',
          solution: 'PRICOFY analiza automáticamente miles de anuncios en tiempo real de todo el mundo para ofrecerte tres precios: mínimo, rápido e ideal, basados en la demanda real global.',
        },
        {
          problem: 'Investigación manual de precios',
          description: 'Debes comparar decenas de anuncios manualmente, sin garantías de poner un precio competitivo o atractivo.',
          solution: 'Análisis consolidado de todas las plataformas del mundo en un solo lugar, con resultados consistentes y actualizados.',
        },
        {
          problem: 'Precios desactualizados',
          description: 'El mercado cambia constantemente y no está regulado, haciendo difícil mantener precios actualizados.',
          solution: 'Monitorizaciones automáticas diarias, semanales o mensuales que mantienen tus precios actualizados según la evolución del mercado global.',
        },
      ],
    },
    {
      title: 'Problemas para Compradores',
      icon: '🛒',
      items: [
        {
          problem: 'Búsqueda limitada geográficamente',
          description: 'Aunque estés dispuesto a comprar con envío, solo buscas en plataformas de tu zona, región o país. Te pierdes oportunidades en todo el mundo donde el mismo producto podría estar más barato o en mejor estado.',
          solution: 'PRICOFY globaliza tu búsqueda automáticamente, expandiendo tu alcance desde tu entorno limitado (Wallapop, Milanuncios…) a plataformas de todo el mundo, conectándote con la verdadera oferta global.',
        },
        {
          problem: 'Miles de resultados no relevantes',
          description: 'Debes navegar entre accesorios, productos diferentes o anuncios promocionados que no corresponden a tu búsqueda. Sería ingobernable leer cientos de anuncios si la mitad son irrelevantes.',
          solution: 'PRICOFY limpia automáticamente los resultados usando IA, filtrando anuncios irrelevantes, productos relacionados y accesorios, mostrando solo productos relevantes y verificados.',
        },
        {
          problem: 'Búsqueda repetitiva y dispersa',
          description: 'El proceso se repite en cada plataforma, perdiendo tiempo en cada búsqueda manual. No sabes en qué plataforma está el mejor precio.',
          solution: 'Búsqueda automática en todas las plataformas relevantes del mundo con un solo clic, ordenando resultados por relevancia y precio, democratizando el acceso al mercado global.',
        },
        {
          problem: 'Precios engañosos',
          description: 'Anuncios gancho con precios ridículamente bajos o productos relacionados pero distintos (ej: carcasas cuando buscas iPhone 17).',
          solution: 'Filtrado inteligente que elimina outliers y productos no relacionados, ofreciendo información clara y verificable.',
        },
      ],
    },
  ] : [
    {
      title: 'Problems for Sellers',
      icon: '💼',
      items: [
        {
          problem: 'Geographically limited reach',
          description: '80% of sellers are willing to ship their product, but only publish on local or national platforms. You close the barrier by limiting your reach to your city or country, when you could sell worldwide if you find the perfect buyer.',
          solution: 'PRICOFY connects you with buyers worldwide, unlocking true global demand. Your product can find its ideal buyer in any country, maximizing your selling price.',
        },
        {
          problem: 'Unknown real demand',
          description: 'You don\'t know the true demand for your product, nor the price you could or should set, nor if you\'re targeting the right audience on the right platform in the right country. The selling price depends on the value the buyer wants to give it.',
          solution: 'PRICOFY automatically analyzes thousands of listings in real-time worldwide to offer you three prices: minimum, fast, and ideal, based on real global demand.',
        },
        {
          problem: 'Manual price research',
          description: 'They must manually compare dozens of listings, with no guarantee of setting a competitive or attractive price.',
          solution: 'Consolidated analysis of all platforms worldwide in one place, with consistent and updated results.',
        },
        {
          problem: 'Outdated prices',
          description: 'The market constantly changes and is unregulated, making it difficult to keep prices updated.',
          solution: 'Automatic daily, weekly, or monthly monitoring that keeps your prices updated according to global market evolution.',
        },
      ],
    },
    {
      title: 'Problems for Buyers',
      icon: '🛒',
      items: [
        {
          problem: 'Geographically limited search',
          description: 'Even though you\'re willing to buy with shipping, you only search on platforms in your area, region, or country. You miss opportunities worldwide where the same product could be cheaper or in better condition.',
          solution: 'PRICOFY automatically globalizes your search, expanding your reach from your limited environment (Wallapop, Milanuncios…) to platforms worldwide, connecting you with the true global supply.',
        },
        {
          problem: 'Thousands of irrelevant results',
          description: 'You must navigate through accessories, different products, or promoted listings that don\'t match your search. It would be unmanageable to read hundreds of listings if half are irrelevant.',
          solution: 'PRICOFY automatically cleans results using AI, filtering irrelevant listings, related products, and accessories, showing only relevant and verified products.',
        },
        {
          problem: 'Repetitive and scattered search',
          description: 'The process repeats on each platform, wasting time on each manual search. You don\'t know which platform has the best price.',
          solution: 'Automatic search across all relevant platforms worldwide with a single click, sorting results by relevance and price, democratizing access to the global market.',
        },
        {
          problem: 'Misleading prices',
          description: 'Hook listings with ridiculously low prices or related but different products (e.g., cases when searching for iPhone 17).',
          solution: 'Intelligent filtering that eliminates outliers and unrelated products, offering clear and verifiable information.',
        },
      ],
    },
  ]

  const howItWorks = language === 'es' ? {
    title: 'Cómo PRICOFY soluciona estos problemas',
    subtitle: 'Globalizamos y democratizamos el mercado de segunda mano',
    steps: [
      {
        title: 'Búsqueda Global Inteligente',
        description: 'PRICOFY expande automáticamente tu alcance desde tu entorno limitado (Wallapop, Milanuncios…) a plataformas de todo el mundo. Una sola búsqueda te conecta con la verdadera oferta global, no solo la de tu zona.',
        icon: '🌍',
      },
      {
        title: 'Filtrado con Inteligencia Artificial',
        description: 'Usando modelos de lenguaje (LLM) y técnicas de IA, PRICOFY limpia automáticamente los resultados, filtrando anuncios irrelevantes, accesorios, productos relacionados y outliers. Sería ingobernable leer miles de anuncios sin este filtrado inteligente.',
        icon: '🤖',
      },
      {
        title: 'Democratización del Acceso',
        description: 'Antes solo unos pocos sabían buscar bien en múltiples plataformas y países. Ahora cualquiera puede acceder al mercado global de segunda mano con un solo clic, conectando compradores y vendedores de todo el mundo.',
        icon: '🔓',
      },
      {
        title: 'Resultados Consolidados y Limpios',
        description: 'El sistema genera una lista depurada con información relevante: precio, título, ciudad, país, fecha de publicación, enlace directo y otros datos importantes, todo ordenado por relevancia y precio.',
        icon: '📊',
      },
    ],
  } : {
    title: 'How PRICOFY solves these problems',
    subtitle: 'We globalize and democratize the second-hand market',
    steps: [
      {
        title: 'Global Intelligent Search',
        description: 'PRICOFY automatically expands your reach from your limited environment (Wallapop, Milanuncios…) to platforms worldwide. One search connects you with the true global supply, not just your local area.',
        icon: '🌍',
      },
      {
        title: 'AI-Powered Filtering',
        description: 'Using language models (LLM) and AI techniques, PRICOFY automatically cleans results, filtering irrelevant listings, accessories, related products, and outliers. It would be unmanageable to read thousands of listings without this intelligent filtering.',
        icon: '🤖',
      },
      {
        title: 'Democratization of Access',
        description: 'Before, only a few knew how to search well across multiple platforms and countries. Now anyone can access the global second-hand market with a single click, connecting buyers and sellers worldwide.',
        icon: '🔓',
      },
      {
        title: 'Consolidated and Clean Results',
        description: 'The system generates a refined list with relevant information: price, title, city, country, publication date, direct link, and other important data, all sorted by relevance and price.',
        icon: '📊',
      },
    ],
  }

  const benefits = language === 'es' ? [
    {
      title: 'Ahorro de tiempo',
      description: 'Tanto compradores como vendedores evitan el análisis manual de cientos de anuncios.',
      icon: '⏱️',
    },
    {
      title: 'Precisión en el precio',
      description: 'La IA ajusta los precios de forma objetiva, según datos de mercado en tiempo real.',
      icon: '🎯',
    },
    {
      title: 'Alertas personalizadas',
      description: 'El usuario puede automatizar la búsqueda o vigilancia de precios sin esfuerzo.',
      icon: '🔔',
    },
    {
      title: 'Transparencia',
      description: 'El sistema filtra resultados engañosos y ofrece información clara y verificable.',
      icon: '✨',
    },
    {
      title: 'Adaptabilidad',
      description: 'Las monitorizaciones mantienen actualizados los precios ante cambios del mercado.',
      icon: '📈',
    },
  ] : [
    {
      title: 'Time savings',
      description: 'Both buyers and sellers avoid manual analysis of hundreds of listings.',
      icon: '⏱️',
    },
    {
      title: 'Price accuracy',
      description: 'AI adjusts prices objectively, based on real-time market data.',
      icon: '🎯',
    },
    {
      title: 'Personalized alerts',
      description: 'Users can automate price search or monitoring effortlessly.',
      icon: '🔔',
    },
    {
      title: 'Transparency',
      description: 'The system filters misleading results and offers clear and verifiable information.',
      icon: '✨',
    },
    {
      title: 'Adaptability',
      description: 'Monitoring keeps prices updated in response to market changes.',
      icon: '📈',
    },
  ]

  return (
    <section id="problems-solutions" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
            {language === 'es' ? 'Problemas y Soluciones' : 'Problems & Solutions'}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {language === 'es' 
              ? 'Los desafíos del mercado de segunda mano'
              : 'The challenges of the second-hand market'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {language === 'es'
              ? 'El mercado de segunda mano está fragmentado geográficamente. Aunque la mayoría de compradores están dispuestos a comprar con envío, solo buscan en plataformas locales. Los vendedores limitan su alcance aunque estén dispuestos a enviar. ¿Por qué perder oportunidades cuando puedes buscar en cualquier plataforma del mundo?'
              : 'The second-hand market is geographically fragmented. Although most buyers are willing to buy with shipping, they only search on local platforms. Sellers limit their reach even though they are willing to ship. Why lose opportunities when you can search on any platform in the world?'}
          </p>
        </div>

        {/* Problems Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {problems.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary-300 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="text-5xl">{category.icon}</div>
                <h3 className="text-3xl font-bold text-gray-900">{category.title}</h3>
              </div>
              
              <div className="space-y-8">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="relative pl-6 border-l-4 border-red-200">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-red-500 rounded-full"></div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{item.problem}</h4>
                    <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-green-700 mb-1">
                        {language === 'es' ? '✅ Solución PRICOFY:' : '✅ PRICOFY Solution:'}
                      </p>
                      <p className="text-green-800">{item.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {howItWorks.title}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {howItWorks.steps.map((step, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <h4 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {language === 'es' ? 'Beneficios Clave' : 'Key Benefits'}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'es'
                ? 'PRICOFY globaliza el mercado de segunda mano, expandiendo automáticamente tu alcance y conectando compradores y vendedores de todo el mundo para desbloquear la verdadera oferta y demanda.'
                : 'PRICOFY globalizes the second-hand market, automatically expanding your reach and connecting buyers and sellers worldwide to unlock true supply and demand.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}




