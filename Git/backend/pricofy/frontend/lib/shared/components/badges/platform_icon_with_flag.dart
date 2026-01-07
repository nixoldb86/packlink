// Platform Icon with Flag Component
//
// Displays platform icon with country flag overlay (like the example: Vinted + Spain flag).
// The flag appears as a circular badge overlapping the bottom-right of the platform icon.
// Uses circle_flags package for high-quality circular SVG flags.
//
// Usage:
// ```dart
// PlatformIconWithFlag(
//   platform: 'vinted',
//   countryCode: 'ES',
//   size: 40,
// )
// ```

import 'package:circle_flags/circle_flags.dart';
import 'package:flutter/material.dart';
import '../../../config/assets.dart';

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
    // Flag size: ~45% of platform icon for better visibility with circle_flags
    final flagSize = size * 0.45;

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
          // Using circle_flags for high-quality SVG circular flags
          if (countryCode != null && countryCode!.isNotEmpty)
            Positioned(
              right: -flagSize * 0.15, // Overlap slightly outside
              bottom: -flagSize * 0.15,
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
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 3,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: CircleFlag(
                    countryCode!.toLowerCase(),
                    size: flagSize,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

