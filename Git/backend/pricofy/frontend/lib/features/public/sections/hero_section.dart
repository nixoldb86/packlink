// Hero Section Widget
//
// Updated to match pricofy-front-promo design
// Includes prominent search bar and new messaging

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../config/routes.dart';
import '../../../config/feature_flags.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../beta_landing/widgets/search_type_carousel.dart';

class HeroSection extends StatefulWidget {
  const HeroSection({super.key});

  @override
  State<HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<HeroSection> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  bool _isInputFocused = false;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _searchFocus.addListener(() {
      setState(() {
        _isInputFocused = _searchFocus.hasFocus;
      });
    });
    _searchController.addListener(() {
      setState(() {
        _hasText = _searchController.text.trim().isNotEmpty;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  void _handleSearch() {
    if (_searchController.text.trim().isNotEmpty) {
      // Navigate to search results page with query
      // Both anonymous and authenticated users can search
      final searchText = Uri.encodeComponent(_searchController.text.trim());
      context.go('${AppRoutes.appSearch}?q=$searchText');
    }
  }

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
            Color(0xFFF5F3FF), // purple-50
            Color(0xFFFEF2F2), // red-50/30
          ],
        ),
      ),
      padding: EdgeInsets.fromLTRB(
        16,
        MediaQuery.of(context).padding.top + (isMobile ? 40 : 80),
        16,
        isMobile ? 40 : 64,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              // Search Bar - ARRIBA
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 768),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(
                      color: _isInputFocused
                          ? AppTheme.primary500
                          : AppTheme.primary200,
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Text Input
                      Expanded(
                        child: Container(
                          decoration: const BoxDecoration(
                            color: Colors.transparent,
                          ),
                          child: TextField(
                            controller: _searchController,
                            focusNode: _searchFocus,
                            onSubmitted: (_) => _handleSearch(),
                            style: TextStyle(
                              fontSize: isMobile ? 16 : 18,
                              color: AppTheme.gray900,
                            ),
                            decoration: InputDecoration(
                              hintText: l10n.heroSearchPlaceholder,
                              hintStyle: TextStyle(
                                color: AppTheme.gray400,
                                fontSize: isMobile ? 13 : 18,
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              errorBorder: InputBorder.none,
                              disabledBorder: InputBorder.none,
                              focusedErrorBorder: InputBorder.none,
                              filled: false,
                              fillColor: Colors.transparent,
                              contentPadding: EdgeInsets.only(
                                left: 24,
                                top: isMobile ? 14 : 16,
                                bottom: isMobile ? 14 : 16,
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Search Button (always gradient, opacity when disabled)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Opacity(
                          opacity: _hasText ? 1.0 : 0.5,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  AppTheme.primary600,
                                  Color(0xFF9333EA),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: _hasText ? _handleSearch : null,
                                borderRadius: BorderRadius.circular(20),
                                child: Padding(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: isMobile ? 12 : 16,
                                    vertical: isMobile ? 8 : 10,
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.search,
                                        color: Colors.white,
                                        size: isMobile ? 16 : 18,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        l10n.heroSearchButton,
                                        style: TextStyle(
                                          fontSize: isMobile ? 13 : 14,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: isMobile ? 32 : 48),

              // Title
              Text(
                l10n.heroTitleLine1,
                style: TextStyle(
                  fontSize: isMobile ? 40 : 80,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                  height: 1.1,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              // Title Highlight
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [
                    AppTheme.primary600,
                    Color(0xFF9333EA), // purple-600
                    AppTheme.primary700,
                  ],
                ).createShader(bounds),
                child: Text(
                  l10n.heroTitleLine2,
                  style: TextStyle(
                    fontSize: isMobile ? 40 : 80,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    height: 1.1,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              SizedBox(height: isMobile ? 24 : 32),

              // Search Type Carousel
              Container(
                margin: EdgeInsets.symmetric(horizontal: isMobile ? 0 : 24),
                padding: EdgeInsets.symmetric(vertical: isMobile ? 16 : 24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC), // slate-50
                  borderRadius: BorderRadius.circular(20),
                ),
                child: SearchTypeCarousel(isMobile: isMobile),
              ),
              SizedBox(height: isMobile ? 24 : 32),

              // CTA Button - DESPUÉS DEL CARRUSEL
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary600, Color(0xFF9333EA)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary600.withValues(alpha: 0.5),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () => context.go(FeatureFlags.loginRoute),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 24 : 32,
                      vertical: isMobile ? 14 : 16,
                    ),
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    l10n.heroStartFree,
                    style: TextStyle(
                      fontSize: isMobile ? 16 : 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              SizedBox(height: isMobile ? 16 : 24),

              // Description - AL FINAL
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 896),
                child: Text(
                  l10n.heroDescription,
                  style: TextStyle(
                    fontSize: isMobile ? 16 : 18,
                    color: AppTheme.gray700,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
