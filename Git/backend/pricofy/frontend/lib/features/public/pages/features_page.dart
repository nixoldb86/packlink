// Features Page
//
// /caracteristicas page - Full page dedicated to features

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/providers/form_provider.dart';
import '../../../core/utils/responsive.dart';

/// Features page content - layout provided by PublicLayout shell
class FeaturesPage extends StatelessWidget {
  const FeaturesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final formProvider = context.read<FormProvider>();
    final l10n = context.l10n;
    final isEs = l10n.localeName == 'es';

    // Content only - layout (navbar + footer) provided by PublicLayout shell
    return Column(
      children: [
        // Hero Section with gradient
        _buildHeroSection(context, l10n, isEs, formProvider),

        // Main Features Grid
        _buildMainFeaturesSection(context, l10n),

        // Detailed Features Section
        _buildDetailedFeaturesSection(context, isEs),

        // Benefits Section
        _buildBenefitsSection(context, isEs),

        // Use Cases Section
        _buildUseCasesSection(context, l10n, isEs),

        // CTA Section
        _buildCTASection(context, l10n, isEs, formProvider),
      ],
    );
  }

  // Hero Section
  Widget _buildHeroSection(BuildContext context, dynamic l10n, bool isEs, FormProvider formProvider) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary600, AppTheme.primary700, AppTheme.primary800],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 16,
        vertical: context.isDesktop ? 80 : 60,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              Text(
                l10n.featuresTitle,
                style: TextStyle(
                  fontSize: context.isDesktop ? 56 : 40,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Text(
                  l10n.featuresSubtitle,
                  style: const TextStyle(
                    fontSize: 20,
                    color: AppTheme.primary100,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 16),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Text(
                  isEs
                      ? 'Descubre todas las herramientas y funcionalidades que hacen de Pricofy la solución perfecta para optimizar tus precios.'
                      : 'Discover all the tools and features that make Pricofy the perfect solution to optimize your prices.',
                  style: const TextStyle(
                    fontSize: 18,
                    color: AppTheme.primary200,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => formProvider.openForm(FormAction.vender),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primary600,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  elevation: 8,
                ),
                child: Text(
                  isEs ? 'Comenzar Gratis' : 'Start Free',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Main Features Grid (4 cards)
  Widget _buildMainFeaturesSection(BuildContext context, dynamic l10n) {
    final features = [
      {
        'icon': '🧠',
        'title': l10n.featuresAiTitle,
        'description': l10n.featuresAiDescription,
        'color': [AppTheme.purple500, AppTheme.pink500],
      },
      {
        'icon': '⚡',
        'title': l10n.featuresRealTimeTitle,
        'description': l10n.featuresRealTimeDescription,
        'color': [AppTheme.blue500, AppTheme.cyan500],
      },
      {
        'icon': '📊',
        'title': l10n.featuresAnalyticsTitle,
        'description': l10n.featuresAnalyticsDescription,
        'color': [AppTheme.green500, AppTheme.emerald500],
      },
      {
        'icon': '🔒',
        'title': l10n.featuresSecurityTitle,
        'description': l10n.featuresSecurityDescription,
        'color': [AppTheme.orange500, AppTheme.red500],
      },
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: context.isDesktop ? 4 : (context.isTablet ? 2 : 1),
              crossAxisSpacing: 32,
              mainAxisSpacing: 32,
              childAspectRatio: context.isMobile ? 1.5 : 1.0,
            ),
            itemCount: features.length,
            itemBuilder: (context, index) {
              final feature = features[index];
              return _buildMainFeatureCard(
                feature['icon'] as String,
                feature['title'] as String,
                feature['description'] as String,
                feature['color'] as List<Color>,
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildMainFeatureCard(String icon, String title, String description, List<Color> gradientColors) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusXl),
        border: Border.all(color: AppTheme.gray100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradientColors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppTheme.radiusXl),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 36)),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppTheme.gray900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: const TextStyle(
              fontSize: 16,
              color: AppTheme.gray600,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // Detailed Features Section (6 features with bullet lists)
  Widget _buildDetailedFeaturesSection(BuildContext context, bool isEs) {
    final detailedFeatures = _getDetailedFeatures(isEs);

    return Container(
      color: AppTheme.gray50,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              Text(
                isEs ? 'Funcionalidades Detalladas' : 'Detailed Features',
                style: TextStyle(
                  fontSize: context.isDesktop ? 40 : 32,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Text(
                  isEs
                      ? 'Explora en profundidad todas las capacidades que Pricofy ofrece para transformar tu experiencia de compra y venta.'
                      : 'Explore in depth all the capabilities that Pricofy offers to transform your buying and selling experience.',
                  style: const TextStyle(
                    fontSize: 20,
                    color: AppTheme.gray600,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 64),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: context.isDesktop ? 3 : (context.isTablet ? 2 : 1),
                  crossAxisSpacing: 32,
                  mainAxisSpacing: 32,
                  childAspectRatio: context.isMobile ? 0.8 : 0.75,
                ),
                itemCount: detailedFeatures.length,
                itemBuilder: (context, index) {
                  final feature = detailedFeatures[index];
                  return _buildDetailedFeatureCard(
                    feature['icon'] as String,
                    feature['title'] as String,
                    feature['description'] as String,
                    feature['items'] as List<String>,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Map<String, dynamic>> _getDetailedFeatures(bool isEs) {
    return [
      {
        'icon': '💰',
        'title': isEs ? 'Evaluación Inteligente de Precios' : 'Smart Price Evaluation',
        'description': isEs
            ? 'Obtén el precio ideal, rápido y mínimo para tu producto basado en análisis de mercado en tiempo real.'
            : 'Get the ideal, fast and minimum price for your product based on real-time market analysis.',
        'items': isEs
            ? ['Análisis de miles de anuncios', 'Comparación con productos similares', 'Ajuste por estado y ubicación', 'Recomendaciones personalizadas']
            : ['Analysis of thousands of listings', 'Comparison with similar products', 'Adjustment by condition and location', 'Personalized recommendations'],
      },
      {
        'icon': '🔍',
        'title': isEs ? 'Búsqueda Inteligente de Productos' : 'Smart Product Search',
        'description': isEs
            ? 'Encuentra el mejor precio disponible en múltiples plataformas de confianza con un solo clic.'
            : 'Find the best available price on multiple trusted platforms with a single click.',
        'items': isEs
            ? ['Búsqueda en múltiples plataformas', 'Filtros avanzados por estado', 'Alertas de precio personalizadas', 'Comparación instantánea']
            : ['Search across multiple platforms', 'Advanced filters by condition', 'Custom price alerts', 'Instant comparison'],
      },
      {
        'icon': '📈',
        'title': isEs ? 'Dashboard y Analíticas' : 'Dashboard & Analytics',
        'description': isEs
            ? 'Visualiza métricas clave, tendencias de mercado y el rendimiento de tus productos en tiempo real.'
            : 'Visualize key metrics, market trends, and your products performance in real-time.',
        'items': isEs
            ? ['Gráficos de tendencias de precios', 'Historial de evaluaciones', 'Métricas de rendimiento', 'Exportación de datos']
            : ['Price trend charts', 'Evaluation history', 'Performance metrics', 'Data export'],
      },
      {
        'icon': '📧',
        'title': isEs ? 'Informes Detallados por Email' : 'Detailed Email Reports',
        'description': isEs
            ? 'Recibe informes completos con recomendaciones de precio, plataformas ideales y estrategias de venta.'
            : 'Receive comprehensive reports with price recommendations, ideal platforms and sales strategies.',
        'items': isEs
            ? ['Informes PDF descargables', 'Sugerencias de título y descripción', 'Análisis de competencia', 'Recomendaciones de plataformas']
            : ['Downloadable PDF reports', 'Title and description suggestions', 'Competition analysis', 'Platform recommendations'],
      },
      {
        'icon': '🎯',
        'title': isEs ? 'Alertas Personalizadas' : 'Custom Alerts',
        'description': isEs
            ? 'Configura alertas para recibir notificaciones cuando encuentres productos o precios que te interesen.'
            : 'Set up alerts to receive notifications when products or prices that interest you are found.',
        'items': isEs
            ? ['Alertas de precio', 'Notificaciones de nuevos productos', 'Cambios en el mercado', 'Configuración flexible']
            : ['Price alerts', 'New product notifications', 'Market changes', 'Flexible configuration'],
      },
      {
        'icon': '🖼️',
        'title': isEs ? 'Mejora de Fotos de Anuncios' : 'Listing Photo Enhancement',
        'description': isEs
            ? 'Mejora automáticamente la calidad de tus fotos para hacer tus anuncios más atractivos y aumentar las ventas.'
            : 'Automatically enhance your photo quality to make your listings more attractive and increase sales.',
        'items': isEs
            ? ['Optimización automática', 'Ajuste de brillo y contraste', 'Reducción de ruido', 'Formato optimizado']
            : ['Automatic optimization', 'Brightness and contrast adjustment', 'Noise reduction', 'Optimized format'],
      },
    ];
  }

  Widget _buildDetailedFeatureCard(String icon, String title, String description, List<String> items) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusXl),
        border: Border.all(color: AppTheme.gray100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppTheme.gray900,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: const TextStyle(
              fontSize: 16,
              color: AppTheme.gray600,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check, color: AppTheme.primary600, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.gray700,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  // Benefits Section (4 benefits)
  Widget _buildBenefitsSection(BuildContext context, bool isEs) {
    final benefits = [
      {
        'icon': '⏱️',
        'title': isEs ? 'Ahorra Tiempo' : 'Save Time',
        'description': isEs
            ? 'No más búsquedas manuales. Encuentra el mejor precio en segundos.'
            : 'No more manual searches. Find the best price in seconds.',
      },
      {
        'icon': '💵',
        'title': isEs ? 'Maximiza Ingresos' : 'Maximize Revenue',
        'description': isEs
            ? 'Vende al precio óptimo basado en datos reales del mercado.'
            : 'Sell at the optimal price based on real market data.',
      },
      {
        'icon': '📊',
        'title': isEs ? 'Decisión Informada' : 'Informed Decision',
        'description': isEs
            ? 'Toma decisiones de pricing inteligentes respaldadas por datos.'
            : 'Make smart pricing decisions backed by data.',
      },
      {
        'icon': '🏆',
        'title': isEs ? 'Competitividad' : 'Competitiveness',
        'description': isEs
            ? 'Mantente siempre competitivo con precios actualizados en tiempo real.'
            : 'Stay competitive with real-time updated prices.',
      },
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              Text(
                isEs ? 'Beneficios Clave' : 'Key Benefits',
                style: TextStyle(
                  fontSize: context.isDesktop ? 40 : 32,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Text(
                  isEs
                      ? 'Descubre por qué miles de usuarios confían en Pricofy para optimizar sus operaciones de compra y venta.'
                      : 'Discover why thousands of users trust Pricofy to optimize their buying and selling operations.',
                  style: const TextStyle(
                    fontSize: 20,
                    color: AppTheme.gray600,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 64),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: context.isDesktop ? 4 : (context.isTablet ? 2 : 1),
                  crossAxisSpacing: 32,
                  mainAxisSpacing: 32,
                  childAspectRatio: context.isMobile ? 1.5 : 1.2,
                ),
                itemCount: benefits.length,
                itemBuilder: (context, index) {
                  final benefit = benefits[index];
                  return _buildBenefitCard(
                    benefit['icon'] as String,
                    benefit['title'] as String,
                    benefit['description'] as String,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitCard(String icon, String title, String description) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primary100, AppTheme.primary200],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(AppTheme.radiusFull),
          ),
          child: Center(
            child: Text(icon, style: const TextStyle(fontSize: 40)),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.gray900,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          description,
          style: const TextStyle(
            fontSize: 16,
            color: AppTheme.gray600,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // Use Cases Section
  Widget _buildUseCasesSection(BuildContext context, dynamic l10n, bool isEs) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              Text(
                l10n.useCasesTitle,
                style: TextStyle(
                  fontSize: context.isDesktop ? 40 : 32,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 64),
              context.isMobile
                  ? Column(
                      children: [
                        _buildUseCaseCard(context, l10n, isEs, true),
                        const SizedBox(height: 48),
                        _buildUseCaseCard(context, l10n, isEs, false),
                      ],
                    )
                  : Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _buildUseCaseCard(context, l10n, isEs, true)),
                        const SizedBox(width: 48),
                        Expanded(child: _buildUseCaseCard(context, l10n, isEs, false)),
                      ],
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUseCaseCard(BuildContext context, dynamic l10n, bool isEs, bool isSell) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusXl),
        border: Border.all(color: AppTheme.gray100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isSell ? '💰' : '🔍',
            style: const TextStyle(fontSize: 48),
          ),
          const SizedBox(height: 24),
          Text(
            isSell ? l10n.useCasesSellTitle : l10n.useCasesBuyTitle,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppTheme.gray900,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isSell ? l10n.useCasesSellDescription : l10n.useCasesBuyDescription,
            style: const TextStyle(
              fontSize: 16,
              color: AppTheme.gray600,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          _buildUseCaseStep(1, isSell ? l10n.useCasesSellStep1 : l10n.useCasesBuyStep1),
          const SizedBox(height: 16),
          _buildUseCaseStep(2, isSell ? l10n.useCasesSellStep2 : l10n.useCasesBuyStep2),
          const SizedBox(height: 16),
          _buildUseCaseStep(3, isSell ? l10n.useCasesSellStep3 : l10n.useCasesBuyStep3),
        ],
      ),
    );
  }

  Widget _buildUseCaseStep(int number, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppTheme.primary100,
            borderRadius: BorderRadius.circular(AppTheme.radiusFull),
          ),
          child: Center(
            child: Text(
              number.toString(),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppTheme.primary600,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 16,
                color: AppTheme.gray700,
                height: 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // CTA Section
  Widget _buildCTASection(BuildContext context, dynamic l10n, bool isEs, FormProvider formProvider) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary600, AppTheme.primary800],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            children: [
              Text(
                l10n.ctaTitle,
                style: TextStyle(
                  fontSize: context.isDesktop ? 40 : 32,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Text(
                l10n.ctaDescription,
                style: const TextStyle(
                  fontSize: 20,
                  color: AppTheme.primary100,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              context.isMobile
                  ? Column(
                      children: [
                        _buildCTAButton(
                          isEs ? 'Comenzar Gratis' : 'Start Free',
                          () => formProvider.openForm(FormAction.vender),
                          true,
                        ),
                        const SizedBox(height: 16),
                        _buildCTAButton(
                          isEs ? 'Hablar con Ventas' : 'Talk to Sales',
                          () => formProvider.openForm(FormAction.comprar),
                          false,
                        ),
                      ],
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildCTAButton(
                          isEs ? 'Comenzar Gratis' : 'Start Free',
                          () => formProvider.openForm(FormAction.vender),
                          true,
                        ),
                        const SizedBox(width: 16),
                        _buildCTAButton(
                          isEs ? 'Hablar con Ventas' : 'Talk to Sales',
                          () => formProvider.openForm(FormAction.comprar),
                          false,
                        ),
                      ],
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCTAButton(String text, VoidCallback onPressed, bool isPrimary) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isPrimary ? Colors.white : Colors.transparent,
        foregroundColor: isPrimary ? AppTheme.primary600 : Colors.white,
        side: isPrimary ? null : const BorderSide(color: Colors.white, width: 2),
        padding: const EdgeInsets.symmetric(
          horizontal: 32,
          vertical: 16,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        ),
        elevation: isPrimary ? 8 : 0,
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
