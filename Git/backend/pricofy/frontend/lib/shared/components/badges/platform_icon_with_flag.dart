// Platform Icon with Flag Component
//
// Displays platform icon with country flag overlay (like the example: Vinted + Spain flag).
// The flag appears as a circular badge overlapping the bottom-right of the platform icon.
//
// Usage:
// ```dart
// PlatformIconWithFlag(
//   platform: 'vinted',
//   countryCode: 'ES',
//   size: 40,
// )
// ```

import 'package:flutter/material.dart';
import '../../../config/assets.dart';
import '../../../core/utils/country_flags.dart';

class PlatformIconWithFlag extends StatelessWidget {
  final String platform;
  final String? countryCode;
  final double size;

  const PlatformIconWithFlag({
    super.key,
    required this.platform,
    this.countryCode,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    final platformLogoPath = AppAssets.platformLogo(platform);
    final flagEmoji = getCountryFlagEmoji(countryCode);
    // Flag size: ~35% of platform icon, positioned to overlap bottom-right quadrant
    final flagSize = size * 0.35;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Platform icon (circular background)
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 3,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: ClipOval(
              child: Image.asset(
                platformLogoPath,
                width: size,
                height: size,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  // Fallback if image doesn't exist
                  return Container(
                    color: Colors.grey[200],
                    child: Icon(
                      Icons.store_outlined,
                      size: size * 0.6,
                      color: Colors.grey[600],
                    ),
                  );
                },
              ),
            ),
          ),
          // Country flag (circular badge, bottom-right, overlapping)
          if (flagEmoji.isNotEmpty)
            Positioned(
              // Position to overlap bottom-right quadrant like in the example
              right: size * 0.05, // Slightly inside from edge
              bottom: size * 0.05,
              child: Container(
                width: flagSize,
                height: flagSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white,
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 2,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Container(
                    color: Colors.white, // White background for better emoji rendering
                    child: Center(
                      child: Text(
                        flagEmoji,
                        style: TextStyle(
                          fontSize: flagSize * 0.75,
                          height: 1.0, // Tight line height for better emoji rendering
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

