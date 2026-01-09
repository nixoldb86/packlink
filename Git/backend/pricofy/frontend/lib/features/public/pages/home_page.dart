// Home Page
//
// Main landing page with Hero, MarketProblem, GlobalSolution, Stats, CTA sections.
//
// Note: If user is authenticated, they are automatically redirected to dashboard.
// Landing page is only accessible to non-authenticated users.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/auth_provider.dart';
import '../../../config/routes.dart';
import '../sections/hero_section.dart';
import '../sections/market_problem_section.dart';
import '../sections/global_solution_section.dart';
import '../sections/stats_section.dart';
import '../sections/cta_section.dart';

/// Home page content - layout provided by PublicLayout shell
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

  /// Redirect to app if user is already authenticated
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
    // Content only - layout (navbar + footer) provided by PublicLayout shell
    return Column(
      children: [
        HeroSection(),
        MarketProblemSection(),
        GlobalSolutionSection(),
        StatsSection(),
        CTASection(),
      ],
    );
  }
}
