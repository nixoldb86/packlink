// Features Page - /caracteristicas
//
// Complete features page with:
// A) El Problema (fragmentación, irrelevantes, desconocimiento demanda)
// B) La Solución Pricofy (4 pilares)
// C) Flujos comprador/vendedor
// D) Comparativa "Pricofy vs hacerlo a mano"
// E) CTA final

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../config/routes.dart';
import '../../../config/feature_flags.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/responsive.dart';

class FeaturesPage extends StatelessWidget {
  const FeaturesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Column(
      children: [
        // Hero
        _buildHeroSection(context, l10n),
        // A) El Problema
        _buildProblemSection(context, l10n),
        // B) La Solución Pricofy
        _buildSolutionSection(context, l10n),
        // C) Flujos
        _buildFlowsSection(context, l10n),
        // D) Comparativa
        _buildComparisonSection(context, l10n),
        // E) CTA Final
        _buildCTASection(context, l10n),
      ],
    );
  }

  // =============================================================================
  // HERO
  // =============================================================================
  Widget _buildHeroSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary600, AppTheme.primary700, Color(0xFF7C3AED)],
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
          constraints: const BoxConstraints(maxWidth: 900),
          child: Column(
            children: [
              Text(
                l10n.featuresPageTitle,
                style: TextStyle(
                  fontSize: isMobile ? 36 : 56,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Text(
                l10n.featuresPageSubtitle,
                style: TextStyle(
                  fontSize: isMobile ? 16 : 20,
                  color: AppTheme.primary100,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =============================================================================
  // A) EL PROBLEMA
  // =============================================================================
  Widget _buildProblemSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;

    final problems = [
      {
        'icon': '🌍',
        'title': l10n.featuresProblem1Title,
        'description': l10n.featuresProblem1Desc,
        'stat': '60%',
        'statLabel': l10n.featuresProblem1Stat,
      },
      {
        'icon': '📦',
        'title': l10n.featuresProblem2Title,
        'description': l10n.featuresProblem2Desc,
        'stat': '80%',
        'statLabel': l10n.featuresProblem2Stat,
      },
      {
        'icon': '🔍',
        'title': l10n.featuresProblem3Title,
        'description': l10n.featuresProblem3Desc,
        'stat': '65%',
        'statLabel': l10n.featuresProblem3Stat,
      },
    ];

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 64 : 96,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFFEF2F2), Color(0xFFFFF7ED), Colors.white],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  l10n.featuresProblemBadge,
                  style: const TextStyle(
                    color: Color(0xFFB91C1C),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                l10n.featuresProblemTitle,
                style: TextStyle(
                  fontSize: isMobile ? 28 : 44,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Problem cards
              ...problems.map((p) => _ProblemCard(
                    icon: p['icon'] as String,
                    title: p['title'] as String,
                    description: p['description'] as String,
                    stat: p['stat'] as String,
                    statLabel: p['statLabel'] as String,
                    isMobile: isMobile,
                  )),
            ],
          ),
        ),
      ),
    );
  }

  // =============================================================================
  // B) LA SOLUCIÓN PRICOFY
  // =============================================================================
  Widget _buildSolutionSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final isDesktop = context.isDesktop;

    final pillars = [
      {
        'icon': '🌍',
        'title': l10n.featuresSolution1Title,
        'description': l10n.featuresSolution1Desc,
      },
      {
        'icon': '🤖',
        'title': l10n.featuresSolution2Title,
        'description': l10n.featuresSolution2Desc,
      },
      {
        'icon': '🔓',
        'title': l10n.featuresSolution3Title,
        'description': l10n.featuresSolution3Desc,
      },
      {
        'icon': '🔗',
        'title': l10n.featuresSolution4Title,
        'description': l10n.featuresSolution4Desc,
      },
    ];

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 64 : 96,
      ),
      decoration: BoxDecoration(
        color: AppTheme.gray50,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.primary100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  l10n.featuresSolutionBadge,
                  style: TextStyle(
                    color: AppTheme.primary700,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                l10n.featuresSolutionTitle,
                style: TextStyle(
                  fontSize: isMobile ? 28 : 44,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Pillars grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: isDesktop ? 2 : 1,
                  crossAxisSpacing: 24,
                  mainAxisSpacing: 24,
                  childAspectRatio: isMobile ? 2.2 : 2.8,
                ),
                itemCount: pillars.length,
                itemBuilder: (context, index) {
                  final p = pillars[index];
                  return _SolutionCard(
                    icon: p['icon'] as String,
                    title: p['title'] as String,
                    description: p['description'] as String,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =============================================================================
  // C) FLUJOS COMPRADOR / VENDEDOR
  // =============================================================================
  Widget _buildFlowsSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final isDesktop = context.isDesktop;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 64 : 96,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              Text(
                l10n.featuresFlowsTitle,
                style: TextStyle(
                  fontSize: isMobile ? 28 : 44,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              if (isDesktop)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildBuyerFlow(l10n)),
                    const SizedBox(width: 32),
                    Expanded(child: _buildSellerFlow(l10n)),
                  ],
                )
              else
                Column(
                  children: [
                    _buildBuyerFlow(l10n),
                    const SizedBox(height: 32),
                    _buildSellerFlow(l10n),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBuyerFlow(dynamic l10n) {
    final steps = [
      l10n.featuresFlowBuyer1,
      l10n.featuresFlowBuyer2,
      l10n.featuresFlowBuyer3,
      l10n.featuresFlowBuyer4,
    ];

    return _FlowCard(
      icon: '🛒',
      title: l10n.featuresFlowBuyerTitle,
      steps: steps,
      gradientColors: [AppTheme.primary500, const Color(0xFF9333EA)],
    );
  }

  Widget _buildSellerFlow(dynamic l10n) {
    final steps = [
      l10n.featuresFlowSeller1,
      l10n.featuresFlowSeller2,
      l10n.featuresFlowSeller3,
      l10n.featuresFlowSeller4,
      l10n.featuresFlowSeller5,
    ];

    return _FlowCard(
      icon: '💼',
      title: l10n.featuresFlowSellerTitle,
      steps: steps,
      gradientColors: [const Color(0xFF10B981), const Color(0xFF059669)],
    );
  }

  // =============================================================================
  // D) COMPARATIVA "PRICOFY VS HACERLO A MANO"
  // =============================================================================
  Widget _buildComparisonSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;

    final comparisons = [
      {
        'feature': l10n.featuresCompare1Feature,
        'manual': l10n.featuresCompare1Manual,
        'pricofy': l10n.featuresCompare1Pricofy,
      },
      {
        'feature': l10n.featuresCompare2Feature,
        'manual': l10n.featuresCompare2Manual,
        'pricofy': l10n.featuresCompare2Pricofy,
      },
      {
        'feature': l10n.featuresCompare3Feature,
        'manual': l10n.featuresCompare3Manual,
        'pricofy': l10n.featuresCompare3Pricofy,
      },
      {
        'feature': l10n.featuresCompare4Feature,
        'manual': l10n.featuresCompare4Manual,
        'pricofy': l10n.featuresCompare4Pricofy,
      },
      {
        'feature': l10n.featuresCompare5Feature,
        'manual': l10n.featuresCompare5Manual,
        'pricofy': l10n.featuresCompare5Pricofy,
      },
      {
        'feature': l10n.featuresCompare6Feature,
        'manual': l10n.featuresCompare6Manual,
        'pricofy': l10n.featuresCompare6Pricofy,
      },
    ];

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 24,
        vertical: isMobile ? 64 : 96,
      ),
      decoration: BoxDecoration(
        color: AppTheme.gray50,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              Text(
                l10n.featuresCompareTitle,
                style: TextStyle(
                  fontSize: isMobile ? 28 : 44,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Comparison table/cards
              if (isMobile)
                ...comparisons.map((c) => _ComparisonCardMobile(
                      feature: c['feature'] as String,
                      manual: c['manual'] as String,
                      pricofy: c['pricofy'] as String,
                    ))
              else
                _ComparisonTable(comparisons: comparisons, l10n: l10n),

              const SizedBox(height: 32),

              // Closing statement
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primary200),
                ),
                child: Text(
                  l10n.featuresCompareConclusion,
                  style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.gray700,
                    fontStyle: FontStyle.italic,
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

  // =============================================================================
  // E) CTA FINAL
  // =============================================================================
  Widget _buildCTASection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;

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
                l10n.featuresCtaTitle,
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
                      l10n.featuresCtaButton,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => context.go(AppRoutes.pricing),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white, width: 2),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      l10n.featuresCtaSecondary,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
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
// HELPER WIDGETS
// =============================================================================

class _ProblemCard extends StatelessWidget {
  final String icon;
  final String title;
  final String description;
  final String stat;
  final String statLabel;
  final bool isMobile;

  const _ProblemCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.stat,
    required this.statLabel,
    required this.isMobile,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: EdgeInsets.all(isMobile ? 20 : 28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECDD3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFEE2E2), Color(0xFFFED7AA)],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 28)),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: isMobile ? 18 : 22,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: isMobile ? 14 : 16,
                    color: AppTheme.gray600,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: stat,
                          style: const TextStyle(
                            color: Color(0xFFB91C1C),
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                        TextSpan(
                          text: ' $statLabel',
                          style: const TextStyle(
                            color: Color(0xFFB91C1C),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SolutionCard extends StatelessWidget {
  final String icon;
  final String title;
  final String description;

  const _SolutionCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primary100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary500, const Color(0xFF9333EA)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 26)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.gray600,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FlowCard extends StatelessWidget {
  final String icon;
  final String title;
  final List<String> steps;
  final List<Color> gradientColors;

  const _FlowCard({
    required this.icon,
    required this.title,
    required this.steps,
    required this.gradientColors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: gradientColors[0].withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: gradientColors),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(icon, style: const TextStyle(fontSize: 26)),
                ),
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          ...steps.asMap().entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: gradientColors[0].withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${entry.key + 1}',
                          style: TextStyle(
                            color: gradientColors[0],
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          entry.value,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppTheme.gray700,
                            height: 1.4,
                          ),
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
}

class _ComparisonTable extends StatelessWidget {
  final List<Map<String, String>> comparisons;
  final dynamic l10n;

  const _ComparisonTable({required this.comparisons, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gray200),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            decoration: BoxDecoration(
              color: AppTheme.gray50,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
              children: [
                const Expanded(
                  flex: 2,
                  child: Text(
                    '',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Center(
                    child: Text(
                      l10n.featuresCompareManualHeader,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.gray600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppTheme.primary500, const Color(0xFF9333EA)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        l10n.featuresComparePricofyHeader,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Rows
          ...comparisons.asMap().entries.map((entry) {
            final c = entry.value;
            final isLast = entry.key == comparisons.length - 1;
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              decoration: BoxDecoration(
                border: isLast ? null : Border(bottom: BorderSide(color: AppTheme.gray100)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 2,
                    child: Text(
                      c['feature']!,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.gray800,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.close, color: Color(0xFFEF4444), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            c['manual']!,
                            style: const TextStyle(fontSize: 13, color: AppTheme.gray600),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            c['pricofy']!,
                            style: const TextStyle(fontSize: 13, color: AppTheme.gray700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ComparisonCardMobile extends StatelessWidget {
  final String feature;
  final String manual;
  final String pricofy;

  const _ComparisonCardMobile({
    required this.feature,
    required this.manual,
    required this.pricofy,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            feature,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppTheme.gray900,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.close, color: Color(0xFFEF4444), size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  manual,
                  style: const TextStyle(fontSize: 13, color: AppTheme.gray600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  pricofy,
                  style: const TextStyle(fontSize: 13, color: AppTheme.gray700, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
