// Platform Badge Component
//
// Displays a colored badge for marketplace platforms (Wallapop, Milanuncios, Vinted, BackMarket, eBay, Leboncoin).
// Platform colors are centralized in AppTheme.platformColor().
//
// Usage:
// ```dart
// PlatformBadge(platform: 'wallapop')
// PlatformBadge(platform: 'milanuncios', size: PlatformBadgeSize.small)
// PlatformBadge.icon(platform: 'vinted')  // Icon only, no label
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

enum PlatformBadgeSize { small, medium, large }

class PlatformBadge extends StatelessWidget {
  final String platform;
  final PlatformBadgeSize size;
  final bool showLabel;
  final bool capitalize;

  const PlatformBadge({
    super.key,
    required this.platform,
    this.size = PlatformBadgeSize.medium,
    this.showLabel = true,
    this.capitalize = true,
  });

  /// Icon-only badge (no label)
  const PlatformBadge.icon({
    super.key,
    required this.platform,
    this.size = PlatformBadgeSize.medium,
  })  : showLabel = false,
        capitalize = true;

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.platformColor(platform);
    final (fontSize, paddingH, paddingV, iconSize) = _getSizeValues();

    return Container(
      padding: EdgeInsets.symmetric(horizontal: paddingH, vertical: paddingV),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!showLabel)
            Icon(
              _getPlatformIcon(),
              size: iconSize,
              color: _getTextColor(color),
            ),
          if (showLabel)
            Text(
              capitalize ? _capitalizeFirst(platform) : platform,
              style: TextStyle(
                fontSize: fontSize,
                color: _getTextColor(color),
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }

  (double, double, double, double) _getSizeValues() {
    return switch (size) {
      PlatformBadgeSize.small => (10.0, 6.0, 2.0, 12.0),
      PlatformBadgeSize.medium => (11.0, 8.0, 4.0, 14.0),
      PlatformBadgeSize.large => (13.0, 10.0, 6.0, 18.0),
    };
  }

  IconData _getPlatformIcon() {
    return switch (platform.toLowerCase()) {
      'wallapop' => Icons.shopping_bag_outlined,
      'milanuncios' => Icons.newspaper_outlined,
      'vinted' => Icons.checkroom_outlined,
      'backmarket' => Icons.phone_android_outlined,
      'ebay' => Icons.gavel_outlined,
      'leboncoin' => Icons.ads_click_outlined,
      _ => Icons.store_outlined,
    };
  }

  Color _getTextColor(Color bgColor) {
    // Use white text for dark backgrounds, dark text for light backgrounds
    final luminance = bgColor.computeLuminance();
    return luminance > 0.5 ? Colors.black87 : Colors.white;
  }

  String _capitalizeFirst(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }
}
