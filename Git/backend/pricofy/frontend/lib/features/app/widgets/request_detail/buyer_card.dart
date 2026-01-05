// Buyer Card Widget
//
// Individual card for buyer listing.
// Shows: image, title, price, location, distance, platform.
// Tappable to open detail modal.

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../config/theme.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import '../../models/evaluation_detail.dart';

class BuyerCard extends StatelessWidget {
  final Comprador comprador;
  final VoidCallback onTap;

  const BuyerCard({
    super.key,
    required this.comprador,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Card(
      elevation: 2,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            _buildImage(),

            // Content
            Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Platform icon with flag
                  PlatformIconWithFlag(
                    platform: comprador.plataforma,
                    countryCode: null, // Comprador doesn't have countryCode
                    size: 32,
                  ),
                  SizedBox(height: 8),

                  // Title
                  Text(
                    comprador.titulo,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8),

                  // Price
                  Text(
                    '${comprador.precioEur.round()}€',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primary600,
                    ),
                  ),
                  SizedBox(height: 8),

                  // Location + Distance
                  if (comprador.ciudadOZona.isNotEmpty) ...[
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: Colors.grey[600]),
                        SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            comprador.ciudadOZona,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (comprador.distanciaKm != null) ...[
                      SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.navigation_outlined, size: 14, color: Colors.grey[600]),
                          SizedBox(width: 4),
                          Text(
                            _formatDistance(comprador.distanciaKm!),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],

                  // Shipping indicator
                  if (comprador.isShippable == true) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.local_shipping, size: 12, color: Colors.green[700]),
                          SizedBox(width: 4),
                          Text(
                            l10n.searchShipping,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.green[700],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    if (comprador.productImage != null && comprador.productImage!.isNotEmpty) {
      return AspectRatio(
        aspectRatio: 1.2,
        child: CachedNetworkImage(
          imageUrl: comprador.productImage!,
          fit: BoxFit.cover,
          placeholder: (context, url) => Container(
            color: Colors.grey[200],
            child: Center(
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
          errorWidget: (context, url, error) => Container(
            color: Colors.grey[200],
            child: Icon(Icons.broken_image, size: 48, color: Colors.grey[400]),
          ),
        ),
      );
    }

    // No image placeholder
    return AspectRatio(
      aspectRatio: 1.2,
      child: Container(
        color: Colors.grey[200],
        child: Icon(Icons.image_not_supported, size: 48, color: Colors.grey[400]),
      ),
    );
  }

  String _formatDistance(double km) {
    if (km < 1) {
      return '${(km * 1000).round()} m';
    } else if (km < 10) {
      return '${km.toStringAsFixed(1)} km';
    } else {
      return '${km.round()} km';
    }
  }
}

