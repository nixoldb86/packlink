// Guest Mode Banner
//
// Banner shown at the top of the app when user is not authenticated.
// Prompts them to register for full access.

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../config/theme.dart';
import '../../../config/feature_flags.dart';
import '../extensions/l10n_extension.dart';
import '../providers/auth_provider.dart';

/// Banner shown to guest users prompting registration
class GuestModeBanner extends StatelessWidget {
  const GuestModeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final l10n = context.l10n;

    // Don't show if authenticated or still loading
    if (authProvider.isAuthenticated || authProvider.status == AuthStatus.unknown) {
      return const SizedBox.shrink();
    }

    final isMobile = MediaQuery.of(context).size.width < 600;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary50, Colors.purple.shade50],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        border: Border(
          bottom: BorderSide(color: AppTheme.primary200),
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 16,
        vertical: isMobile ? 8 : 12,
      ),
      child: isMobile ? _buildMobileVersion(context, l10n) : _buildDesktopVersion(context, l10n),
    );
  }

  Widget _buildMobileVersion(BuildContext context, dynamic l10n) {
    final tapRecognizer = TapGestureRecognizer()
      ..onTap = () => context.go(FeatureFlags.loginRoute);

    return Row(
      children: [
        Icon(
          Icons.info_outline,
          size: 18,
          color: AppTheme.primary600,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: '${l10n.guestModeBannerTitle} - ',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.gray700,
                    fontSize: 12,
                  ),
                ),
                TextSpan(
                  text: l10n.guestModeBannerCTA,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primary600,
                    decoration: TextDecoration.underline,
                    decorationColor: AppTheme.primary600,
                  ),
                  recognizer: tapRecognizer,
                ),
                TextSpan(
                  text: l10n.guestModeBannerRest,
                  style: TextStyle(
                    color: AppTheme.gray700,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDesktopVersion(BuildContext context, dynamic l10n) {
    return Row(
      children: [
        Icon(
          Icons.info_outline,
          size: 20,
          color: AppTheme.primary600,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: l10n.guestModeBannerTitle,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.gray700,
                  ),
                ),
                TextSpan(
                  text: ' - ${l10n.guestModeBannerMessage}',
                  style: TextStyle(color: AppTheme.gray700),
                ),
              ],
            ),
            style: const TextStyle(fontSize: 14),
          ),
        ),
        const SizedBox(width: 12),
        ElevatedButton(
          onPressed: () => context.go(FeatureFlags.loginRoute),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary600,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: Text(
            l10n.guestModeSignUp,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
