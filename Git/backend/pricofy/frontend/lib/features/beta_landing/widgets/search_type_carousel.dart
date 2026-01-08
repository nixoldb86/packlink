// Search Type Carousel Widget
//
// Carousel showing the 3 search types: Classic, Advanced (AI), Market Analysis

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class SearchTypeCarousel extends StatefulWidget {
  final bool isMobile;

  const SearchTypeCarousel({super.key, required this.isMobile});

  @override
  State<SearchTypeCarousel> createState() => _SearchTypeCarouselState();
}

class _SearchTypeCarouselState extends State<SearchTypeCarousel> {
  final PageController _pageController = PageController(viewportFraction: 0.85);
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToPage(int page) {
    _pageController.animateToPage(
      page,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Title
        Text(
          'Elige tu tipo de búsqueda',
          style: TextStyle(
            fontSize: widget.isMobile ? 24 : 32,
            fontWeight: FontWeight.w800,
            color: AppTheme.gray900,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),

        // Carousel
        SizedBox(
          height: widget.isMobile ? 360 : 380,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: 3,
            itemBuilder: (context, index) {
              return AnimatedScale(
                scale: _currentPage == index ? 1.0 : 0.9,
                duration: const Duration(milliseconds: 200),
                child: _buildCard(index),
              );
            },
          ),
        ),
        const SizedBox(height: 16),

        // Navigation
        _buildNavigation(),
      ],
    );
  }

  Widget _buildCard(int index) {
    final cards = [
      _SearchTypeCardData(
        badge: 'Rápida',
        badgeColor: const Color(0xFF10B981), // emerald-500
        icon: Icons.search,
        iconBgColor: const Color(0xFF10B981), // emerald-500
        title: 'Búsqueda clásica',
        benefits: [
          'Búsqueda simultánea en portales de segunda mano a nivel nacional e internacional',
          'Resultados agregados',
          'Filtros sobre anuncios encontrados',
        ],
        buttonText: 'Usar búsqueda clásica',
        accentColor: const Color(0xFF10B981), // emerald-500
      ),
      _SearchTypeCardData(
        badge: 'Más precisa',
        badgeColor: const Color(0xFF6366F1), // indigo-500
        icon: Icons.auto_awesome,
        iconBgColor: const Color(0xFF6366F1), // indigo-500
        title: 'Búsqueda avanzada (IA)',
        benefits: [
          'Aplicamos IA para mostrarte solo anuncios relevantes',
          'Filtra accesorios y productos relacionados pero distintos',
          'Resultados optimizados y depurados',
        ],
        buttonText: 'Usar búsqueda avanzada',
        accentColor: const Color(0xFF6366F1), // indigo-500
      ),
      _SearchTypeCardData(
        badge: 'Para vender',
        badgeColor: const Color(0xFFF59E0B), // amber-500
        icon: Icons.bar_chart,
        iconBgColor: const Color(0xFFF59E0B), // amber-500
        title: 'Análisis de mercado',
        benefits: [
          'Análisis de mercado nacional e internacional',
          'Métricas de demanda por precio, plataforma y país',
          'Estimación de precios óptimos de venta',
        ],
        buttonText: 'Analizar mi producto',
        accentColor: const Color(0xFFF59E0B), // amber-500
      ),
    ];

    final card = cards[index];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Badge + Icon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: card.badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  card.badge,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: card.badgeColor,
                  ),
                ),
              ),
              // Icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: card.iconBgColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  card.icon,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Title
          Text(
            card.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Color(0xFF111827), // gray-900
            ),
          ),
          const SizedBox(height: 12),

          // Benefits
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: card.benefits.map((benefit) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.check_circle,
                          size: 18,
                          color: card.accentColor,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            benefit,
                            style: TextStyle(
                              fontSize: 13,
                              color: AppTheme.gray600,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: card.accentColor, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                card.buttonText,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: card.accentColor,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigation() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left arrow
        IconButton(
          onPressed: _currentPage > 0 ? () => _goToPage(_currentPage - 1) : null,
          icon: Icon(
            Icons.chevron_left,
            size: 32,
            color: _currentPage > 0 ? AppTheme.gray700 : AppTheme.gray300,
          ),
        ),
        const SizedBox(width: 8),

        // Dots
        Row(
          children: List.generate(3, (index) {
            final isActive = index == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: isActive ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primary500 : AppTheme.gray300,
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
        const SizedBox(width: 8),

        // Right arrow
        IconButton(
          onPressed: _currentPage < 2 ? () => _goToPage(_currentPage + 1) : null,
          icon: Icon(
            Icons.chevron_right,
            size: 32,
            color: _currentPage < 2 ? AppTheme.gray700 : AppTheme.gray300,
          ),
        ),
      ],
    );
  }
}

class _SearchTypeCardData {
  final String badge;
  final Color badgeColor;
  final IconData icon;
  final Color iconBgColor;
  final String title;
  final List<String> benefits;
  final String buttonText;
  final Color accentColor;

  const _SearchTypeCardData({
    required this.badge,
    required this.badgeColor,
    required this.icon,
    required this.iconBgColor,
    required this.title,
    required this.benefits,
    required this.buttonText,
    required this.accentColor,
  });
}

