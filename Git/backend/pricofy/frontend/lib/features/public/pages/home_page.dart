// Home Page - Redesigned for conversion
//
// Clean, modern landing with: Hero + Search Types Carousel + Mini-benefits + CTA
// Long content moved to /caracteristicas

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/auth_provider.dart';
import '../../../config/routes.dart';
import '../../../config/theme.dart';
import '../../../config/feature_flags.dart';
import '../../../core/extensions/l10n_extension.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    _checkAuthAndRedirect();
  }

  Future<void> _checkAuthAndRedirect() async {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        context.go(AppRoutes.app);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const _HeroSection(),
        const _SearchTypesCarousel(),
        const _MiniBenefitsSection(),
        const _FinalCTASection(),
      ],
    );
  }
}

// =============================================================================
// HERO SECTION - Minimal & Clean
// =============================================================================
class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFEEF2FF), // primary-50
            Colors.white,
          ],
        ),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        MediaQuery.of(context).padding.top + (isMobile ? 48 : 80),
        24,
        isMobile ? 48 : 80,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Column(
            children: [
              // H1 - EXACTO: "El Universo de segunda mano, en un solo click"
              Text(
                l10n.homeHeroTitle,
                style: TextStyle(
                  fontSize: isMobile ? 36 : 64,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.gray900,
                  height: 1.1,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Subheadline
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 700),
                child: Text(
                  l10n.homeHeroSubtitle,
                  style: TextStyle(
                    fontSize: isMobile ? 16 : 20,
                    color: AppTheme.gray600,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 40),

              // CTAs
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 16,
                runSpacing: 12,
                children: [
                  // Primary CTA
                  _PrimaryCTAButton(
                    text: l10n.homeHeroCta,
                    onPressed: () => context.go(FeatureFlags.loginRoute),
                  ),
                  // Secondary CTA
                  _SecondaryCTAButton(
                    text: l10n.homeHeroSecondaryCta,
                    onPressed: () => context.go(AppRoutes.features),
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

// =============================================================================
// SEARCH TYPES CAROUSEL
// =============================================================================
class _SearchTypesCarousel extends StatefulWidget {
  const _SearchTypesCarousel();

  @override
  State<_SearchTypesCarousel> createState() => _SearchTypesCarouselState();
}

class _SearchTypesCarouselState extends State<_SearchTypesCarousel> {
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
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;
    final isDesktop = screenWidth >= 1024;

    final cards = [
      _SearchTypeCard(
        tag: l10n.homeSearchTypeTag1,
        tagColor: const Color(0xFF10B981), // green
        title: l10n.homeSearchType1Title,
        bullets: [
          l10n.homeSearchType1Bullet1,
          l10n.homeSearchType1Bullet2,
          l10n.homeSearchType1Bullet3,
        ],
        ctaText: l10n.homeSearchType1Cta,
        onCta: () => context.go('${AppRoutes.appSearch}?mode=classic'),
        icon: Icons.search,
      ),
      _SearchTypeCard(
        tag: l10n.homeSearchTypeTag2,
        tagColor: AppTheme.primary600,
        title: l10n.homeSearchType2Title,
        bullets: [
          l10n.homeSearchType2Bullet1,
          l10n.homeSearchType2Bullet2,
          l10n.homeSearchType2Bullet3,
        ],
        ctaText: l10n.homeSearchType2Cta,
        onCta: () => context.go('${AppRoutes.appSearch}?mode=smart'),
        icon: Icons.auto_awesome,
      ),
      _SearchTypeCard(
        tag: l10n.homeSearchTypeTag3,
        tagColor: const Color(0xFFF59E0B), // amber
        title: l10n.homeSearchType3Title,
        bullets: [
          l10n.homeSearchType3Bullet1,
          l10n.homeSearchType3Bullet2,
          l10n.homeSearchType3Bullet3,
        ],
        ctaText: l10n.homeSearchType3Cta,
        onCta: () => context.go('${AppRoutes.features}#analisis-mercado'),
        icon: Icons.analytics_outlined,
      ),
    ];

    return Container(
      padding: EdgeInsets.symmetric(vertical: isMobile ? 48 : 80),
      child: Column(
        children: [
          // Section Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              l10n.homeSearchTypesTitle,
              style: TextStyle(
                fontSize: isMobile ? 28 : 40,
                fontWeight: FontWeight.w700,
                color: AppTheme.gray900,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 48),

          // Cards - Desktop: Row, Mobile: PageView
          if (isDesktop)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: cards
                      .map((card) => Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: card,
                            ),
                          ))
                      .toList(),
                ),
              ),
            )
          else
            Column(
              children: [
                SizedBox(
                  height: 420,
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (page) => setState(() => _currentPage = page),
                    itemCount: cards.length,
                    itemBuilder: (context, index) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: cards[index],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Navigation arrows + dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: _currentPage > 0 ? () => _goToPage(_currentPage - 1) : null,
                      icon: Icon(
                        Icons.chevron_left,
                        color: _currentPage > 0 ? AppTheme.gray700 : AppTheme.gray300,
                      ),
                    ),
                    ...List.generate(
                      cards.length,
                      (index) => GestureDetector(
                        onTap: () => _goToPage(index),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == index ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentPage == index ? AppTheme.primary600 : AppTheme.gray300,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _currentPage < cards.length - 1
                          ? () => _goToPage(_currentPage + 1)
                          : null,
                      icon: Icon(
                        Icons.chevron_right,
                        color: _currentPage < cards.length - 1 ? AppTheme.gray700 : AppTheme.gray300,
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
}

class _SearchTypeCard extends StatelessWidget {
  final String tag;
  final Color tagColor;
  final String title;
  final List<String> bullets;
  final String ctaText;
  final VoidCallback onCta;
  final IconData icon;

  const _SearchTypeCard({
    required this.tag,
    required this.tagColor,
    required this.title,
    required this.bullets,
    required this.ctaText,
    required this.onCta,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.gray100, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: tagColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              tag,
              style: TextStyle(
                color: tagColor,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Icon + Title
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [tagColor, tagColor.withValues(alpha: 0.7)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Bullets
          ...bullets.map((bullet) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle, color: tagColor, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        bullet,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.gray600,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
          const Spacer(),
          const SizedBox(height: 16),

          // CTA Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onCta,
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: tagColor, width: 2),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                ctaText,
                style: TextStyle(
                  color: tagColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// MINI BENEFITS SECTION
// =============================================================================
class _MiniBenefitsSection extends StatelessWidget {
  const _MiniBenefitsSection();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    final benefits = [
      {'icon': Icons.public, 'text': l10n.homeMiniBenefit1},
      {'icon': Icons.auto_awesome, 'text': l10n.homeMiniBenefit2},
      {'icon': Icons.price_check, 'text': l10n.homeMiniBenefit3},
    ];

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 48 : 64,
      ),
      decoration: BoxDecoration(
        color: AppTheme.gray50,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: isMobile
              ? Column(
                  children: benefits
                      .map((b) => _MiniBenefitItem(
                            icon: b['icon'] as IconData,
                            text: b['text'] as String,
                          ))
                      .toList(),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: benefits
                      .map((b) => Expanded(
                            child: _MiniBenefitItem(
                              icon: b['icon'] as IconData,
                              text: b['text'] as String,
                            ),
                          ))
                      .toList(),
                ),
        ),
      ),
    );
  }
}

class _MiniBenefitItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _MiniBenefitItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary500, Color(0xFF9333EA)],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppTheme.gray700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// FINAL CTA SECTION
// =============================================================================
class _FinalCTASection extends StatelessWidget {
  const _FinalCTASection();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary600, Color(0xFF7C3AED)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 64 : 96,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            children: [
              Text(
                l10n.homeFinalCtaTitle,
                style: TextStyle(
                  fontSize: isMobile ? 32 : 44,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 16,
                runSpacing: 12,
                children: [
                  ElevatedButton(
                    onPressed: () => context.go(FeatureFlags.loginRoute),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.primary600,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      l10n.homeHeroCta,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => context.go(AppRoutes.contact),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white, width: 2),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      l10n.homeFinalCtaSecondary,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
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

// =============================================================================
// SHARED BUTTON WIDGETS
// =============================================================================
class _PrimaryCTAButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const _PrimaryCTAButton({required this.text, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary600, Color(0xFF9333EA)],
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary600.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _SecondaryCTAButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const _SecondaryCTAButton({required this.text, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: AppTheme.gray300, width: 2),
        foregroundColor: AppTheme.gray700,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
