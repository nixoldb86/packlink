// Pricing Section Widget - Replica exacta de pricofy-front-promo/pricing
// 
// Secciones:
// 1. Hero Section con gradientes y animaciones
// 2. Freemium Card con 2 columnas (compra/venta)
// 3. Tab Selector animado (Compra/Venta)
// 4. Planes Nacionales e Internacionales
// 5. FAQ Section
// 6. CTA Section

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/feature_flags.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/responsive.dart';

// Colores principales (de tailwind.config.ts)
class _PricingColors {
  static const primary600 = Color(0xFF667EEA);
  static const primary700 = Color(0xFF764BA2);
  static const primary500 = Color(0xFF8B5CF6);
  static const gray950 = Color(0xFF030712);
  static const gray900 = Color(0xFF111827);
  static const gray800 = Color(0xFF1F2937);
  static const gray700 = Color(0xFF374151);
  static const gray400 = Color(0xFF9CA3AF);
  static const gray300 = Color(0xFFD1D5DB);
  static const gray200 = Color(0xFFE5E7EB);
  static const purple500 = Color(0xFFA855F7);
  static const purple400 = Color(0xFFC084FC);
  static const pink500 = Color(0xFFEC4899);
  static const green500 = Color(0xFF22C55E);
  static const green400 = Color(0xFF4ADE80);
  static const emerald500 = Color(0xFF10B981);
  static const emerald400 = Color(0xFF34D399);
  static const blue500 = Color(0xFF3B82F6);
  static const blue400 = Color(0xFF60A5FA);
  static const yellow400 = Color(0xFFFACC15);
  static const yellow900 = Color(0xFF713F12);
  static const orange500 = Color(0xFFF97316);
}

class PricingSection extends StatefulWidget {
  final bool showFullPage;

  const PricingSection({
    super.key,
    this.showFullPage = false,
  });

  @override
  State<PricingSection> createState() => _PricingSectionState();
}

class _PricingSectionState extends State<PricingSection> with TickerProviderStateMixin {
  String _activeTab = 'compra';
  late AnimationController _shimmerController;
  late AnimationController _blobController;

  @override
  void initState() {
    super.initState();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat();
    _blobController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 7),
    )..repeat();
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    _blobController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = l10n.localeName;

    if (widget.showFullPage) {
      return Column(
        children: [
          _buildHeroSection(context, locale),
          _buildFreemiumSection(context, locale),
          _buildTabsSection(context, locale),
          _buildFAQSection(context, locale),
          _buildCTASection(context, locale),
        ],
      );
    }

    return _buildFreemiumSection(context, locale);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HERO SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildHeroSection(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [_PricingColors.gray950, _PricingColors.gray900, _PricingColors.gray950],
        ),
      ),
      child: Stack(
        children: [
          // Radial gradients
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(-0.4, -0.6),
                  radius: 1.0,
                  colors: [
                    _PricingColors.primary600.withValues(alpha: 0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.4, 0.6),
                  radius: 1.0,
                  colors: [
                    _PricingColors.purple500.withValues(alpha: 0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Animated blobs
          AnimatedBuilder(
            animation: _blobController,
            builder: (context, child) {
              final t = _blobController.value;
              return Stack(
                children: [
                  Positioned(
                    top: 80 + 50 * (t < 0.33 ? t * 3 : t < 0.66 ? 1 - (t - 0.33) * 3 : 0),
                    left: 40 + 30 * (t < 0.33 ? t * 3 : t < 0.66 ? 1 - (t - 0.33) * 3 : 0),
                    child: Container(
                      width: 384,
                      height: 384,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _PricingColors.primary500.withValues(alpha: 0.1),
                        boxShadow: [
                          BoxShadow(
                            color: _PricingColors.primary500.withValues(alpha: 0.1),
                            blurRadius: 100,
                            spreadRadius: 50,
                          ),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 80 + 20 * (t < 0.5 ? t * 2 : 2 - t * 2),
                    right: 40,
                    child: Container(
                      width: 384,
                      height: 384,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _PricingColors.purple500.withValues(alpha: 0.1),
                        boxShadow: [
                          BoxShadow(
                            color: _PricingColors.purple500.withValues(alpha: 0.1),
                            blurRadius: 100,
                            spreadRadius: 50,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          // Content
          Padding(
            padding: EdgeInsets.only(
              top: isMobile ? 80 : 120,
              bottom: 60,
              left: 16,
              right: 16,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Column(
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _PricingColors.primary500.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: Text(
                        _getText(locale, 'badge'),
                        style: TextStyle(
                          color: _PricingColors.purple400,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Title
                    Text(
                      _getText(locale, 'heroTitle'),
                      style: TextStyle(
                        fontSize: isMobile ? 40 : 56,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1.1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    // Subtitles
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 900),
                      child: Column(
                        children: [
                          Text(
                            _getText(locale, 'heroSubtitle1'),
                            style: TextStyle(
                              fontSize: isMobile ? 14 : 22,
                              color: _PricingColors.gray300,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _getText(locale, 'heroSubtitle2'),
                            style: TextStyle(
                              fontSize: isMobile ? 14 : 22,
                              color: _PricingColors.gray300,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FREEMIUM SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildFreemiumSection(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      color: _PricingColors.gray950,
      child: Stack(
        children: [
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.03),
                spacing: 40,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 32 : 48,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Column(
                  children: [
                    // Header
                    Text(
                      _getText(locale, 'freemiumTitle'),
                      style: TextStyle(
                        fontSize: isMobile ? 28 : 36,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getText(locale, 'freemiumSubtitle'),
                      style: const TextStyle(
                        fontSize: 16,
                        color: _PricingColors.gray400,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    // Freemium Card
                    _buildFreemiumCard(context, locale),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFreemiumCard(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    
    return Container(
      constraints: const BoxConstraints(maxWidth: 900),
      decoration: BoxDecoration(
        color: _PricingColors.gray800.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _PricingColors.gray700, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      padding: EdgeInsets.all(isMobile ? 16 : 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Plan name and price
          Text(
            'Freemium',
            style: TextStyle(
              fontSize: isMobile ? 24 : 32,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '0',
                style: TextStyle(
                  fontSize: isMobile ? 36 : 48,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                _getText(locale, 'priceUnit'),
                style: TextStyle(
                  fontSize: isMobile ? 16 : 20,
                  color: _PricingColors.gray300,
                ),
              ),
            ],
          ),
          SizedBox(height: isMobile ? 16 : 32),
          // Two columns
          isMobile
              ? Column(
                  children: [
                    _buildFreemiumColumn(context, locale, 'compra'),
                    const SizedBox(height: 16),
                    _buildFreemiumColumn(context, locale, 'venta'),
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildFreemiumColumn(context, locale, 'compra')),
                    const SizedBox(width: 20),
                    Expanded(child: _buildFreemiumColumn(context, locale, 'venta')),
                  ],
                ),
          SizedBox(height: isMobile ? 16 : 32),
          // CTA Button
          Center(
            child: ElevatedButton(
              onPressed: () => context.go(FeatureFlags.loginRoute),
              style: ElevatedButton.styleFrom(
                backgroundColor: _PricingColors.gray700,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  horizontal: isMobile ? 24 : 40,
                  vertical: isMobile ? 12 : 16,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 8,
              ),
              child: Text(
                _getText(locale, 'createFreeAccount'),
                style: TextStyle(
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFreemiumColumn(BuildContext context, String locale, String type) {
    final isMobile = context.isMobile;
    final isCompra = type == 'compra';
    final iconColor = isCompra ? _PricingColors.primary600 : _PricingColors.green500;
    final checkColor = isCompra ? _PricingColors.purple400 : _PricingColors.green400;
    
    return Container(
      decoration: BoxDecoration(
        color: _PricingColors.gray900.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _PricingColors.gray700),
      ),
      padding: EdgeInsets.all(isMobile ? 12 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isCompra ? Icons.search : Icons.add,
                  color: iconColor,
                  size: isMobile ? 20 : 24,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                isCompra ? _getText(locale, 'forBuying') : _getText(locale, 'forSelling'),
                style: TextStyle(
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          SizedBox(height: isMobile ? 12 : 16),
          // Features
          if (isCompra) ...[
            _buildFeatureItem(
              context,
              locale,
              checkColor,
              _buildUnlimitedSearchesText(locale),
              isRichText: true,
            ),
            ..._getFreemiumCompraSubItems(locale).map((item) => _buildSubItem(context, item, checkColor)),
            const SizedBox(height: 8),
            _buildFeatureItem(
              context,
              locale,
              checkColor,
              _buildIntelligentSearchText(locale),
              isRichText: true,
            ),
            ..._getFreemiumCompraInteligentSubItems(locale).map((item) => _buildSubItem(context, item, checkColor)),
          ] else ...[
            _buildFeatureItem(
              context,
              locale,
              checkColor,
              _getText(locale, 'freeMarketAnalysis'),
            ),
            ..._getFreemiumVentaSubItems(locale).map((item) => _buildSubItem(context, item, checkColor)),
            const SizedBox(height: 12),
            // Disclaimer
            Container(
              padding: EdgeInsets.all(isMobile ? 8 : 12),
              decoration: BoxDecoration(
                color: const Color(0xFF713F12).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFA16207).withValues(alpha: 0.5)),
              ),
              child: Text(
                _getText(locale, 'freemiumDisclaimer'),
                style: TextStyle(
                  fontSize: isMobile ? 11 : 13,
                  color: const Color(0xFFFDE047),
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFeatureItem(
    BuildContext context,
    String locale,
    Color checkColor,
    dynamic text, {
    bool isRichText = false,
  }) {
    final isMobile = context.isMobile;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: checkColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Icon(
              Icons.check,
              color: checkColor,
              size: 12,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: isRichText && text is Widget
                ? text
                : Text(
                    text.toString(),
                    style: TextStyle(
                      fontSize: isMobile ? 13 : 15,
                      color: _PricingColors.gray300,
                      height: 1.4,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubItem(BuildContext context, String text, Color bulletColor) {
    final isMobile = context.isMobile;
    
    return Padding(
      padding: const EdgeInsets.only(left: 28, bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '•',
            style: TextStyle(
              color: bulletColor.withValues(alpha: 0.6),
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 11 : 13,
                color: _PricingColors.gray400,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnlimitedSearchesText(String locale) {
    final isMobile = context.isMobile;
    final text = _getText(locale, 'unlimitedSearches');
    final highlightWord = _getText(locale, 'unlimited');
    
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: text.split(highlightWord)[0],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: _PricingColors.gray300,
            ),
          ),
          WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
              decoration: BoxDecoration(
                color: _PricingColors.yellow400,
                borderRadius: BorderRadius.circular(4),
                boxShadow: [
                  BoxShadow(
                    color: _PricingColors.yellow400.withValues(alpha: 0.4),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Text(
                highlightWord,
                style: TextStyle(
                  fontSize: isMobile ? 16 : 20,
                  fontWeight: FontWeight.w700,
                  color: _PricingColors.yellow900,
                ),
              ),
            ),
          ),
          if (text.split(highlightWord).length > 1)
            TextSpan(
              text: text.split(highlightWord)[1],
              style: TextStyle(
                fontSize: isMobile ? 13 : 15,
                color: _PricingColors.gray300,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildIntelligentSearchText(String locale) {
    final isMobile = context.isMobile;
    final text = _getText(locale, 'freeIntelligentSearch');
    final highlightWord = _getText(locale, 'intelligent');
    
    final parts = text.split(highlightWord);
    if (parts.length < 2) {
      return Text(
        text,
        style: TextStyle(
          fontSize: isMobile ? 13 : 15,
          color: _PricingColors.gray300,
        ),
      );
    }
    
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: parts[0],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: _PricingColors.gray300,
            ),
          ),
          WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: _ShimmerText(
              text: highlightWord,
              controller: _shimmerController,
              fontSize: isMobile ? 16 : 18,
            ),
          ),
          TextSpan(
            text: parts[1],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: _PricingColors.gray300,
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TABS SECTION (Compra / Venta)
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildTabsSection(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      color: _PricingColors.gray950,
      padding: EdgeInsets.symmetric(
        horizontal: 16,
        vertical: isMobile ? 32 : 48,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              // Tab Selector
              _buildTabSelector(context, locale),
              const SizedBox(height: 32),
              // Content based on active tab
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _activeTab == 'compra'
                    ? _buildCompraPlans(context, locale)
                    : _buildVentaPlans(context, locale),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabSelector(BuildContext context, String locale) {
    final isCompra = _activeTab == 'compra';
    
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: _PricingColors.gray800.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: _PricingColors.gray700.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 16,
          ),
        ],
      ),
      child: Stack(
        children: [
          // Animated indicator
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            left: isCompra ? 6 : null,
            right: isCompra ? null : 6,
            top: 6,
            bottom: 6,
            width: 140,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isCompra
                      ? [
                          const Color(0xFFF5F3FF).withValues(alpha: 0.9),
                          const Color(0xFFEDE9FE).withValues(alpha: 0.8),
                          const Color(0xFFF5F3FF).withValues(alpha: 0.9),
                        ]
                      : [
                          const Color(0xFFF0FDF4).withValues(alpha: 0.9),
                          const Color(0xFFDCFCE7).withValues(alpha: 0.8),
                          const Color(0xFFF0FDF4).withValues(alpha: 0.9),
                        ],
                ),
                borderRadius: BorderRadius.circular(100),
                border: Border.all(
                  color: isCompra
                      ? _PricingColors.primary700.withValues(alpha: 0.3)
                      : _PricingColors.green500.withValues(alpha: 0.3),
                  width: 0.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: (isCompra ? _PricingColors.purple500 : _PricingColors.green500)
                        .withValues(alpha: 0.15),
                    blurRadius: 32,
                  ),
                ],
              ),
              // Shimmer effect
              child: ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.white.withValues(alpha: 0.3),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Animated shimmer
                    AnimatedBuilder(
                      animation: _shimmerController,
                      builder: (context, child) {
                        return Transform.translate(
                          offset: Offset(
                            -140 + _shimmerController.value * 280,
                            0,
                          ),
                          child: Container(
                            width: 70,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  Colors.white.withValues(alpha: 0.8),
                                  Colors.white,
                                  Colors.white.withValues(alpha: 0.8),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Buttons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTabButton(
                context,
                locale,
                'compra',
                _getText(locale, 'forBuyingTab'),
                isCompra,
              ),
              _buildTabButton(
                context,
                locale,
                'venta',
                _getText(locale, 'forSellingTab'),
                !isCompra,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(
    BuildContext context,
    String locale,
    String tab,
    String label,
    bool isActive,
  ) {
    final isCompra = tab == 'compra';
    
    return GestureDetector(
      onTap: () => setState(() => _activeTab = tab),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isActive
                ? (isCompra ? _PricingColors.primary700 : _PricingColors.green500)
                : _PricingColors.gray400,
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPRA PLANS
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildCompraPlans(BuildContext context, String locale) {
    return Column(
      key: const ValueKey('compra'),
      children: [
        // Nacional Plans
        _buildPlanSection(
          context,
          locale,
          _getText(locale, 'nationalBuyingTitle'),
          _getText(locale, 'nationalBuyingSubtitle'),
          _getNacionalCompraPlans(locale),
          'purple',
        ),
        const SizedBox(height: 48),
        // Internacional Plans
        _buildPlanSection(
          context,
          locale,
          _getText(locale, 'internationalBuyingTitle'),
          _getText(locale, 'internationalBuyingSubtitle'),
          _getInternacionalCompraPlans(locale),
          'purple',
          showDisclaimer: true,
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VENTA PLANS
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildVentaPlans(BuildContext context, String locale) {
    return Column(
      key: const ValueKey('venta'),
      children: [
        // Nacional Plans
        _buildPlanSection(
          context,
          locale,
          _getText(locale, 'nationalSellingTitle'),
          _getText(locale, 'nationalSellingSubtitle'),
          _getNacionalVentaPlans(locale),
          'green',
        ),
        const SizedBox(height: 48),
        // Internacional Plans
        _buildPlanSection(
          context,
          locale,
          _getText(locale, 'internationalSellingTitle'),
          _getText(locale, 'internationalSellingSubtitle'),
          _getInternacionalVentaPlans(locale),
          'emerald',
          showDisclaimer: true,
        ),
      ],
    );
  }

  Widget _buildPlanSection(
    BuildContext context,
    String locale,
    String title,
    String subtitle,
    List<Map<String, dynamic>> plans,
    String colorScheme, {
    bool showDisclaimer = false,
  }) {
    final isMobile = context.isMobile;
    
    return Column(
      children: [
        // Header
        Text(
          title,
          style: TextStyle(
            fontSize: isMobile ? 24 : 36,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 16,
            color: _PricingColors.gray400,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        // Plans Grid
        isMobile
            ? Column(
                children: plans.asMap().entries.map((entry) {
                  return Padding(
                    padding: EdgeInsets.only(bottom: entry.key < plans.length - 1 ? 16 : 0),
                    child: _buildPlanCard(context, locale, entry.value, colorScheme),
                  );
                }).toList(),
              )
            : Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: plans.asMap().entries.map((entry) {
                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        left: entry.key > 0 ? 8 : 0,
                        right: entry.key < plans.length - 1 ? 8 : 0,
                      ),
                      child: _buildPlanCard(context, locale, entry.value, colorScheme),
                    ),
                  );
                }).toList(),
              ),
        if (showDisclaimer) ...[
          const SizedBox(height: 16),
          Text(
            _getText(locale, 'internationalDisclaimer'),
            style: const TextStyle(
              fontSize: 12,
              color: _PricingColors.gray400,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildPlanCard(
    BuildContext context,
    String locale,
    Map<String, dynamic> plan,
    String colorScheme,
  ) {
    final isMobile = context.isMobile;
    final isPopular = plan['popular'] == true;
    final isPayPerUse = plan['isPayPerUse'] == true;
    
    // Colors based on scheme
    Color bgColor;
    Color borderColor;
    Color badgeColor;
    Color badgeTextColor;
    Color checkColor;
    Color buttonColor;
    
    switch (colorScheme) {
      case 'purple':
        bgColor = isPayPerUse ? const Color(0xFF172554) : const Color(0xFF1E1B4B);
        borderColor = isPayPerUse ? const Color(0xFF1E3A8A) : const Color(0xFF3730A3);
        badgeColor = isPayPerUse 
            ? _PricingColors.blue500.withValues(alpha: 0.2)
            : _PricingColors.purple500.withValues(alpha: 0.2);
        badgeTextColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.purple400;
        checkColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.purple400;
        buttonColor = isPayPerUse ? _PricingColors.blue500 : _PricingColors.purple500;
        break;
      case 'green':
        bgColor = isPayPerUse ? const Color(0xFF172554) : const Color(0xFF14532D);
        borderColor = isPayPerUse ? const Color(0xFF1E3A8A) : const Color(0xFF166534);
        badgeColor = isPayPerUse 
            ? _PricingColors.blue500.withValues(alpha: 0.2)
            : _PricingColors.green500.withValues(alpha: 0.2);
        badgeTextColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.green400;
        checkColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.green400;
        buttonColor = isPayPerUse ? _PricingColors.blue500 : _PricingColors.green500;
        break;
      case 'emerald':
      default:
        bgColor = isPayPerUse ? const Color(0xFF172554) : const Color(0xFF064E3B);
        borderColor = isPayPerUse ? const Color(0xFF1E3A8A) : const Color(0xFF047857);
        badgeColor = isPayPerUse 
            ? _PricingColors.blue500.withValues(alpha: 0.2)
            : _PricingColors.emerald500.withValues(alpha: 0.2);
        badgeTextColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.emerald400;
        checkColor = isPayPerUse ? _PricingColors.blue400 : _PricingColors.emerald400;
        buttonColor = isPayPerUse ? _PricingColors.blue500 : _PricingColors.emerald500;
    }
    
    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: 2),
        boxShadow: isPopular
            ? [
                BoxShadow(
                  color: _PricingColors.purple500.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      padding: EdgeInsets.all(isMobile ? 20 : 24),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Popular badge
          if (isPopular)
            Positioned(
              top: -20,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [_PricingColors.purple500, Color(0xFF7C3AED)],
                    ),
                    borderRadius: BorderRadius.circular(100),
                    boxShadow: [
                      BoxShadow(
                        color: _PricingColors.purple500.withValues(alpha: 0.4),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Text(
                    _getText(locale, 'mostPopular'),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          // Pay per use badge
          if (isPayPerUse)
            Positioned(
              top: -20,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  decoration: BoxDecoration(
                    color: _PricingColors.blue500.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: _PricingColors.blue500.withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    _getText(locale, 'payPerUse'),
                    style: const TextStyle(
                      color: _PricingColors.blue400,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isPopular || isPayPerUse) const SizedBox(height: 16),
              // Type badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: borderColor),
                ),
                child: Text(
                  plan['typeLabel'] as String,
                  style: TextStyle(
                    color: badgeTextColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Name
              Text(
                plan['name'] as String,
                style: TextStyle(
                  fontSize: isMobile ? 24 : 28,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              // Price
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    plan['price'] as String,
                    style: TextStyle(
                      fontSize: isMobile ? 36 : 48,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    plan['priceUnit'] as String,
                    style: const TextStyle(
                      fontSize: 16,
                      color: _PricingColors.gray300,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Description
              Text(
                plan['description'] as String,
                style: const TextStyle(
                  fontSize: 14,
                  color: _PricingColors.gray300,
                ),
              ),
              const SizedBox(height: 20),
              // Features
              ...(plan['features'] as List<String>).map((feature) {
                final isSubItem = feature.startsWith('•');
                return Padding(
                  padding: EdgeInsets.only(
                    bottom: 8,
                    left: isSubItem ? 24 : 0,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isSubItem)
                        Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.only(top: 6),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: checkColor,
                          ),
                        )
                      else
                        Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: checkColor.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Icon(
                            Icons.check,
                            color: checkColor,
                            size: 12,
                          ),
                        ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isSubItem ? feature.substring(2) : feature,
                          style: TextStyle(
                            fontSize: isMobile ? 13 : 14,
                            color: _PricingColors.gray200,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
              // Disclaimer for venta plans
              if (plan['disclaimer'] != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF713F12).withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFA16207).withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    plan['disclaimer'] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFFFDE047),
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const SizedBox(height: 20),
              // CTA Button with "Próximamente" badge
              Stack(
                clipBehavior: Clip.none,
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go(FeatureFlags.loginRoute),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: buttonColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: Text(
                        isPayPerUse
                            ? _getText(locale, 'contact')
                            : _getText(locale, 'subscribePlan'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  // "Próximamente" sticker
                  Positioned(
                    top: -8,
                    right: -8,
                    child: Transform.rotate(
                      angle: 0.2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [_PricingColors.yellow400, _PricingColors.orange500],
                          ),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Text(
                          _getText(locale, 'comingSoon'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAQ SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildFAQSection(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    final faqs = _getFAQs(locale);
    
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [_PricingColors.gray900, _PricingColors.gray950],
        ),
      ),
      child: Stack(
        children: [
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.05),
                spacing: 40,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 48 : 96,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _PricingColors.primary500.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: Text(
                        _getText(locale, 'faqBadge'),
                        style: const TextStyle(
                          color: _PricingColors.purple400,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Title
                    Text(
                      _getText(locale, 'faqTitle'),
                      style: TextStyle(
                        fontSize: isMobile ? 32 : 48,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),
                    // FAQ Items
                    ...faqs.asMap().entries.map((entry) {
                      final faq = entry.value;
                      return _FAQItem(
                        question: faq['question']!,
                        answer: faq['answer']!,
                      );
                    }),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CTA SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _buildCTASection(BuildContext context, String locale) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _PricingColors.primary600,
            const Color(0xFF7C3AED),
            _PricingColors.primary700,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Radial gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.7,
                  colors: [
                    Colors.white.withValues(alpha: 0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.08),
                spacing: 40,
              ),
            ),
          ),
          // Blobs
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 384,
              height: 384,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.05),
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withValues(alpha: 0.05),
                    blurRadius: 100,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            child: Container(
              width: 384,
              height: 384,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _PricingColors.purple400.withValues(alpha: 0.1),
                boxShadow: [
                  BoxShadow(
                    color: _PricingColors.purple400.withValues(alpha: 0.1),
                    blurRadius: 100,
                  ),
                ],
              ),
            ),
          ),
          // Content
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 48 : 96,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1024),
                child: Column(
                  children: [
                    Text(
                      _getText(locale, 'ctaTitle'),
                      style: TextStyle(
                        fontSize: isMobile ? 32 : 48,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 700),
                      child: Text(
                        _getText(locale, 'ctaSubtitle'),
                        style: TextStyle(
                          fontSize: isMobile ? 18 : 22,
                          color: Colors.white.withValues(alpha: 0.9),
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 48),
                    // CTA Button
                    _CTAButton(
                      text: _getText(locale, 'createFreeAccount'),
                      shimmerController: _shimmerController,
                      onPressed: () => context.go(FeatureFlags.loginRoute),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  List<String> _getFreemiumCompraSubItems(String locale) {
    switch (locale) {
      case 'es':
        return [
          'Búsqueda simultánea en portales de segunda mano de nivel nacional e internacional',
          'Resultados agregados',
          'Filtros sobre anuncios encontrados',
        ];
      case 'en':
        return [
          'Simultaneous search on national and international second-hand platforms',
          'Aggregated results',
          'Filters on found listings',
        ];
      default:
        return [
          'Búsqueda simultánea en portales de segunda mano de nivel nacional e internacional',
          'Resultados agregados',
          'Filtros sobre anuncios encontrados',
        ];
    }
  }

  List<String> _getFreemiumCompraInteligentSubItems(String locale) {
    switch (locale) {
      case 'es':
        return [
          '1 búsqueda inteligente en portales de segunda mano nacionales e internacionales',
          'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos',
        ];
      case 'en':
        return [
          '1 intelligent search on national and international second-hand platforms',
          'We apply intelligence to all listings, showing you only relevant ones, filtering accessories or related but different products',
        ];
      default:
        return [
          '1 búsqueda inteligente en portales de segunda mano nacionales e internacionales',
          'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos',
        ];
    }
  }

  List<String> _getFreemiumVentaSubItems(String locale) {
    switch (locale) {
      case 'es':
        return [
          'Análisis de mercado nacional e internacional',
          'Métricas de demanda por precio, plataforma, país',
          'Estimación de precios óptimos de venta',
        ];
      case 'en':
        return [
          'National and international market analysis',
          'Demand metrics by price, platform, country',
          'Optimal selling price estimation',
        ];
      default:
        return [
          'Análisis de mercado nacional e internacional',
          'Métricas de demanda por precio, plataforma, país',
          'Estimación de precios óptimos de venta',
        ];
    }
  }

  List<Map<String, dynamic>> _getNacionalCompraPlans(String locale) {
    final isEs = locale == 'es';
    return [
      {
        'key': 'ninja-local',
        'name': 'Ninja Local',
        'price': '4,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para comprar' : 'For buying',
        'features': isEs
            ? [
                '20 créditos para búsquedas inteligentes en portales de segunda mano nacionales.',
                'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos.',
              ]
            : [
                '20 credits for intelligent searches on national second-hand platforms.',
                'We apply intelligence to all listings to show you only relevant ones, filtering accessories or related but different products.',
              ],
      },
      {
        'key': 'radar-local',
        'name': 'Radar Local',
        'price': '22,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para comprar' : 'For buying',
        'features': isEs
            ? [
                '100 créditos que puedes usar como quieras para:',
                '• Búsquedas inteligentes en portales de segunda mano nacionales.',
                '• Alertas nacionales (bajadas de precio y nuevos listados)',
                'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos.',
              ]
            : [
                '100 credits you can use as you wish between:',
                '• Intelligent searches on national second-hand platforms.',
                '• National alerts (price drops and new listings)',
                'We apply intelligence to all listings to show you only relevant ones, filtering accessories or related but different products.',
              ],
      },
      {
        'key': 'pay-per-use-compra-local',
        'name': isEs ? 'Pago por uso' : 'Pay per use',
        'price': '0,3',
        'priceUnit': isEs ? '€ por búsqueda' : '€ per search',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para comprar' : 'For buying',
        'isPayPerUse': true,
        'features': isEs
            ? [
                '1 Búsqueda inteligente en portales de segunda mano nacionales.',
                'Resultados optimizados',
                'Filtrado avanzado para eliminar anuncios irrelevantes, accesorios o productos relacionados pero distintos',
              ]
            : [
                '1 Intelligent search on national second-hand platforms.',
                'Optimized results',
                'Advanced filtering to eliminate irrelevant listings, accessories or related but different products',
              ],
      },
    ];
  }

  List<Map<String, dynamic>> _getInternacionalCompraPlans(String locale) {
    final isEs = locale == 'es';
    return [
      {
        'key': 'ninja',
        'name': 'Ninja',
        'price': '6,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para comprar' : 'For buying',
        'features': isEs
            ? [
                '20 créditos para búsquedas en portales de segunda mano internacionales.',
                'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos.',
              ]
            : [
                '20 credits for searches on international second-hand platforms.',
                'We apply intelligence to all listings to show you only relevant ones, filtering accessories or related but different products.',
              ],
      },
      {
        'key': 'radar',
        'name': 'Radar',
        'price': '25,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para comprar' : 'For buying',
        'popular': true,
        'features': isEs
            ? [
                '100 créditos que puedes usar como quieras para:',
                '• Búsquedas en portales de segunda mano internacionales.',
                '• Alertas internacionales (bajadas de precio y nuevos listados)',
                'Aplicamos inteligencia sobre todos los anuncios, para mostrarte solamente aquellos relevantes, filtrando accesorios o productos relacionados pero distintos.',
              ]
            : [
                '100 credits you can use as you wish between:',
                '• Searches on international second-hand platforms.',
                '• International alerts (price drops and new listings)',
                'We apply intelligence to all listings to show you only relevant ones, filtering accessories or related but different products.',
              ],
      },
      {
        'key': 'pay-per-use-compra',
        'name': isEs ? 'Pago por uso' : 'Pay per use',
        'price': '0,6',
        'priceUnit': isEs ? '€ por búsqueda' : '€ per search',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para comprar' : 'For buying',
        'isPayPerUse': true,
        'features': isEs
            ? [
                '1 Búsqueda inteligente en portales de segunda mano internacionales.',
                'Resultados optimizados',
                'Filtrado avanzado para eliminar anuncios irrelevantes, accesorios o productos relacionados pero distintos',
              ]
            : [
                '1 Intelligent search on international second-hand platforms.',
                'Optimized results',
                'Advanced filtering to eliminate irrelevant listings, accessories or related but different products',
              ],
      },
    ];
  }

  List<Map<String, dynamic>> _getNacionalVentaPlans(String locale) {
    final isEs = locale == 'es';
    final disclaimer = isEs
        ? 'Probablemente exista una demanda superior en otros países para tu producto. Contrata un plan internacional o paga por uso para ver cómo está el mercado internacional.'
        : 'There are countries where there is more demand and higher prices. Subscribe to an international plan or pay per use to see the international market.';
    
    return [
      {
        'key': 'express',
        'name': 'Express',
        'price': '5,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para vender' : 'For selling',
        'disclaimer': disclaimer,
        'features': isEs
            ? [
                '20 créditos para analizar el mercado nacional, en búsqueda de oportunidades de demanda de forma inteligente',
                'Ver precios reales de mercado, competencia, oferta y demanda nacionales',
              ]
            : [
                '20 credits for national market analysis, intelligently searching for demand opportunities',
                'See real market prices, competition, supply and national demand',
              ],
      },
      {
        'key': 'turbo',
        'name': 'Turbo',
        'price': '27,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para vender' : 'For selling',
        'disclaimer': disclaimer,
        'features': isEs
            ? [
                '100 créditos que puedes usar como quieras para:',
                '• Búsqueda de oportunidades de demanda de forma inteligente (estimación del precio óptimo)',
                '• Alertas nacionales (ver si alguien publica más barato que tú)',
              ]
            : [
                '100 credits you can use as you wish between:',
                '• Intelligent search for demand opportunities (optimal price estimation)',
                '• National alerts (see if someone posts cheaper than you)',
              ],
      },
      {
        'key': 'pay-per-use-venta-nacional',
        'name': isEs ? 'Pago por uso' : 'Pay per use',
        'price': '0,9',
        'priceUnit': isEs ? '€ por consulta' : '€ per query',
        'typeLabel': isEs ? 'Nacional' : 'National',
        'description': isEs ? 'Para vender' : 'For selling',
        'isPayPerUse': true,
        'features': isEs
            ? [
                '1 Análisis de tu mercado nacional',
                '• Búsqueda inteligente de oportunidades de demanda',
                '• Estimación del precio óptimo de venta',
              ]
            : [
                '1 Analysis of your national market',
                '• Intelligent search for demand opportunities',
                '• Optimal sale price estimation',
              ],
      },
    ];
  }

  List<Map<String, dynamic>> _getInternacionalVentaPlans(String locale) {
    final isEs = locale == 'es';
    return [
      {
        'key': 'inter-express',
        'name': 'Inter Express',
        'price': '7,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para vender' : 'For selling',
        'features': isEs
            ? [
                '20 créditos para analizar el mercado internacional, en búsqueda de oportunidades de demanda de forma inteligente',
                'Ver precios reales en otros países',
              ]
            : [
                '20 credits for international market analysis, intelligently searching for demand opportunities',
                'See real prices in other countries',
              ],
      },
      {
        'key': 'inter-turbo',
        'name': 'Inter Turbo',
        'price': '29,99',
        'priceUnit': isEs ? '€/mes' : '€/month',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para vender' : 'For selling',
        'popular': true,
        'features': isEs
            ? [
                '100 créditos que puedes usar como quieras para:',
                '• Búsqueda de oportunidades de demanda en otros países (estimación del precio óptimo)',
                '• Alertas internacionales (ver si alguien publica más barato que tú en otros países)',
              ]
            : [
                '100 credits you can use as you wish between:',
                '• Search for demand opportunities in other countries (optimal price estimation)',
                '• International alerts (see if someone posts cheaper than you in other countries)',
              ],
      },
      {
        'key': 'pay-per-use-venta',
        'name': isEs ? 'Pago por uso' : 'Pay per use',
        'price': '1,2',
        'priceUnit': isEs ? '€ por consulta' : '€ per query',
        'typeLabel': isEs ? 'Internacional' : 'International',
        'description': isEs ? 'Para vender' : 'For selling',
        'isPayPerUse': true,
        'features': isEs
            ? [
                '1 Análisis de tu mercado internacional',
                '• Búsqueda inteligente de oportunidades de demanda',
                '• Estimación del precio óptimo de venta',
              ]
            : [
                '1 Analysis of your international market',
                '• Intelligent search for demand opportunities',
                '• Optimal sale price estimation',
              ],
      },
    ];
  }

  List<Map<String, String>> _getFAQs(String locale) {
    switch (locale) {
      case 'es':
        return [
          {
            'question': '¿Qué son los créditos?',
            'answer': 'Cada búsqueda internacional (compra o venta) consume 1 crédito. Cada alerta internacional también consume créditos en el setup. Las búsquedas nacionales de compra siempre son ilimitadas, incluso sin plan.',
          },
          {
            'question': '¿Puedo cambiar de plan en cualquier momento?',
            'answer': 'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu cuenta. Los créditos no utilizados se mantienen hasta el final del período de facturación.',
          },
          {
            'question': '¿Qué pasa si me quedo sin créditos?',
            'answer': 'Te notificaremos cuando te acerques al límite. Puedes actualizar tu plan, usar el pago por uso, o esperar al siguiente mes cuando se renueven tus créditos.',
          },
        ];
      case 'en':
        return [
          {
            'question': 'What are credits?',
            'answer': 'Each international search (buy or sell) consumes 1 credit. Each international alert also consumes credits in the setup. National buy searches are always unlimited, even without a plan.',
          },
          {
            'question': 'Can I change plans at any time?',
            'answer': 'Yes, you can upgrade or change your plan at any time from your account. Unused credits are kept until the end of the billing period.',
          },
          {
            'question': 'What happens if I run out of credits?',
            'answer': 'We will notify you when you are close to the limit. You can upgrade your plan, use pay-per-use, or wait until the next month when your credits are renewed.',
          },
        ];
      default:
        return [
          {
            'question': '¿Qué son los créditos?',
            'answer': 'Cada búsqueda internacional (compra o venta) consume 1 crédito. Cada alerta internacional también consume créditos en el setup. Las búsquedas nacionales de compra siempre son ilimitadas, incluso sin plan.',
          },
          {
            'question': '¿Puedo cambiar de plan en cualquier momento?',
            'answer': 'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu cuenta. Los créditos no utilizados se mantienen hasta el final del período de facturación.',
          },
          {
            'question': '¿Qué pasa si me quedo sin créditos?',
            'answer': 'Te notificaremos cuando te acerques al límite. Puedes actualizar tu plan, usar el pago por uso, o esperar al siguiente mes cuando se renueven tus créditos.',
          },
        ];
    }
  }

  String _getText(String locale, String key) {
    final texts = {
      'es': {
        'badge': 'Planes y Precios',
        'heroTitle': 'Elige el plan perfecto para tus necesidades',
        'heroSubtitle1': 'Pricofy funciona con un modelo Freemium donde cualquier usuario puede analizar, en un solo click, precios en plataformas nacionales e internacionales de forma ilimitada.',
        'heroSubtitle2': 'Cuando necesitas ver oportunidades en otros países —ya sea para comprar o para vender— puedes activar un plan internacional o pagar por uso.',
        'freemiumTitle': 'Cuenta Freemium',
        'freemiumSubtitle': 'Para todos los usuarios',
        'priceUnit': '€/mes',
        'forBuying': 'Para comprar',
        'forSelling': 'Para vender',
        'forBuyingTab': 'Para Comprar',
        'forSellingTab': 'Para Vender',
        'unlimitedSearches': 'Búsquedas ilimitadas',
        'unlimited': 'ilimitadas',
        'freeIntelligentSearch': '1 búsqueda inteligente gratuita incluida',
        'intelligent': 'inteligente',
        'freeMarketAnalysis': '1 Análisis gratuito de mercado',
        'freemiumDisclaimer': 'Probablemente exista una demanda superior en otros países para tu producto. Contrata un plan internacional o paga por uso para ver cómo está el mercado internacional.',
        'createFreeAccount': 'Crear cuenta gratuita',
        'nationalBuyingTitle': 'Planes para Comprar en tu País',
        'nationalBuyingSubtitle': 'Encuentra los mejores precios en el mercado nacional',
        'internationalBuyingTitle': 'Planes para Comprar Internacionalmente',
        'internationalBuyingSubtitle': 'Encuentra productos más baratos en otros países *',
        'nationalSellingTitle': 'Planes para Vender en tu País',
        'nationalSellingSubtitle': 'Optimiza tus precios en el mercado nacional',
        'internationalSellingTitle': 'Planes para Vender Internacionalmente',
        'internationalSellingSubtitle': 'Expande tu mercado a otros países *',
        'internationalDisclaimer': '* Planes internacionales limitados a 3 países a elegir. Actualmente soportados: España, Portugal, Francia, Italia y Alemania',
        'mostPopular': 'Más Popular',
        'payPerUse': 'Pago por uso',
        'subscribePlan': 'Contratar plan',
        'contact': 'Contactar',
        'comingSoon': 'Próximamente',
        'faqBadge': 'Preguntas Frecuentes',
        'faqTitle': '¿Cómo funcionan los créditos?',
        'ctaTitle': '¿Listo para comenzar?',
        'ctaSubtitle': 'Únete a cientos de usuarios que ya están optimizando sus precios con Pricofy',
      },
      'en': {
        'badge': 'Plans and Pricing',
        'heroTitle': 'Choose the perfect plan for your needs',
        'heroSubtitle1': 'Pricofy works with a Freemium model where any user can search national prices unlimited and try a free market analysis searching for real demand of their product.',
        'heroSubtitle2': 'When you need to see opportunities in other countries —whether to buy or sell— you can activate an international plan or pay per use.',
        'freemiumTitle': 'Freemium Account',
        'freemiumSubtitle': 'For all users',
        'priceUnit': '€/month',
        'forBuying': 'For buying',
        'forSelling': 'For selling',
        'forBuyingTab': 'For Buying',
        'forSellingTab': 'For Selling',
        'unlimitedSearches': 'Unlimited searches',
        'unlimited': 'Unlimited',
        'freeIntelligentSearch': '1 free intelligent search included',
        'intelligent': 'intelligent',
        'freeMarketAnalysis': '1 Free market analysis',
        'freemiumDisclaimer': 'There are countries where there is more demand and better prices for your product. Subscribe to an international plan or pay per use to see the international market.',
        'createFreeAccount': 'Create free account',
        'nationalBuyingTitle': 'National Plans for Buying',
        'nationalBuyingSubtitle': 'Find the best prices in the national market',
        'internationalBuyingTitle': 'International Plans for Buying',
        'internationalBuyingSubtitle': 'Find cheaper products in other countries *',
        'nationalSellingTitle': 'National Plans for Selling',
        'nationalSellingSubtitle': 'Optimize your prices in the national market',
        'internationalSellingTitle': 'International Plans for Selling',
        'internationalSellingSubtitle': 'Expand your market to other countries *',
        'internationalDisclaimer': '* International plans limited to 3 countries to choose from. Currently supported: Spain, Portugal, France, Italy and Germany',
        'mostPopular': 'Most Popular',
        'payPerUse': 'Pay per use',
        'subscribePlan': 'Subscribe',
        'contact': 'Contact',
        'comingSoon': 'Coming Soon',
        'faqBadge': 'Frequently Asked Questions',
        'faqTitle': 'How do credits work?',
        'ctaTitle': 'Ready to get started?',
        'ctaSubtitle': 'Join hundreds of users who are already optimizing their prices with Pricofy',
      },
    };
    
    return texts[locale]?[key] ?? texts['es']![key]!;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER WIDGETS
// ═══════════════════════════════════════════════════════════════════════════

class _ShimmerText extends StatelessWidget {
  final String text;
  final AnimationController controller;
  final double fontSize;

  const _ShimmerText({
    required this.text,
    required this.controller,
    required this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: const [
                _PricingColors.purple500,
                _PricingColors.pink500,
                _PricingColors.purple500,
              ],
              stops: [
                0.0,
                controller.value,
                1.0,
              ],
            ).createShader(bounds);
          },
          child: Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        );
      },
    );
  }
}

class _FAQItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FAQItem({
    required this.question,
    required this.answer,
  });

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 24),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: _PricingColors.gray800.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isHovered ? _PricingColors.primary600 : _PricingColors.gray700,
            width: 2,
          ),
          boxShadow: _isHovered
              ? [
                  BoxShadow(
                    color: _PricingColors.primary600.withValues(alpha: 0.2),
                    blurRadius: 20,
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.question,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: _isHovered ? _PricingColors.purple400 : Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.answer,
              style: const TextStyle(
                fontSize: 16,
                color: _PricingColors.gray300,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CTAButton extends StatefulWidget {
  final String text;
  final AnimationController shimmerController;
  final VoidCallback onPressed;

  const _CTAButton({
    required this.text,
    required this.shimmerController,
    required this.onPressed,
  });

  @override
  State<_CTAButton> createState() => _CTAButtonState();
}

class _CTAButtonState extends State<_CTAButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          transform: _isHovered ? (Matrix4.identity()..scale(1.05)) : Matrix4.identity(),
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: _isHovered ? 0.3 : 0.2),
                blurRadius: _isHovered ? 30 : 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Shimmer effect
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AnimatedBuilder(
                    animation: widget.shimmerController,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(
                          -200 + widget.shimmerController.value * 400,
                          0,
                        ),
                        child: Container(
                          width: 100,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                Colors.white.withValues(alpha: 0.4),
                                Colors.white.withValues(alpha: 0.6),
                                Colors.white.withValues(alpha: 0.4),
                                Colors.transparent,
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.text,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: _PricingColors.primary600,
                    ),
                  ),
                  const SizedBox(width: 8),
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    transform: _isHovered ? (Matrix4.identity()..translate(4.0, 0.0)) : Matrix4.identity(),
                    child: const Icon(
                      Icons.arrow_forward,
                      color: _PricingColors.primary600,
                      size: 20,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GridPatternPainter extends CustomPainter {
  final Color lineColor;
  final double spacing;

  _GridPatternPainter({
    required this.lineColor,
    required this.spacing,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1;

    // Vertical lines
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Horizontal lines
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
