// Buyer Detail Modal Widget
//
// Full-screen modal with detailed listing information.
// Shows: large image, full description, seller info, link to external listing.

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../config/theme.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import '../../models/evaluation_detail.dart';

class BuyerDetailModal extends StatelessWidget {
  final Comprador comprador;

  const BuyerDetailModal({
    super.key,
    required this.comprador,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.all(16),
      child: Container(
        constraints: BoxConstraints(maxWidth: 600, maxHeight: MediaQuery.of(context).size.height * 0.9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header with close button
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      l10n.evaluationListingDetails,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close),
                    tooltip: l10n.commonClose,
                  ),
                ],
              ),
            ),

            // Content (scrollable)
            Flexible(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image
                    if (comprador.productImage != null && comprador.productImage!.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: CachedNetworkImage(
                          imageUrl: comprador.productImage!,
                          width: double.infinity,
                          height: 300,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            height: 300,
                            color: Colors.grey[200],
                            child: Center(child: CircularProgressIndicator()),
                          ),
                          errorWidget: (context, url, error) => Container(
                            height: 300,
                            color: Colors.grey[200],
                            child: Icon(Icons.broken_image, size: 64),
                          ),
                        ),
                      ),
                    SizedBox(height: 16),

                    // Platform icon with flag
                    PlatformIconWithFlag(
                      platform: comprador.plataforma,
                      countryCode: null, // Comprador doesn't have countryCode
                      size: 48,
                    ),
                    SizedBox(height: 12),

                    // Title
                    Text(
                      comprador.titulo,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 12),

                    // Price
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.primary600.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.euro, color: AppTheme.primary600),
                          SizedBox(width: 8),
                          Text(
                            '${comprador.precioEur.round()}€',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primary600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 16),

                    // Metadata
                    _buildMetadataRow(
                      icon: Icons.location_on_outlined,
                      label: l10n.evaluationLocation,
                      value: comprador.ciudadOZona,
                    ),
                    if (comprador.distanciaKm != null)
                      _buildMetadataRow(
                        icon: Icons.navigation_outlined,
                        label: l10n.sortDistance,
                        value: _formatDistance(comprador.distanciaKm!),
                      ),
                    _buildMetadataRow(
                      icon: Icons.info_outline,
                      label: l10n.evaluationCondition,
                      value: comprador.estadoDeclarado,
                    ),
                    if (comprador.isShippable != null)
                      _buildMetadataRow(
                        icon: Icons.local_shipping_outlined,
                        label: l10n.searchShipping,
                        value: comprador.isShippable!
                            ? l10n.evaluationAvailable
                            : l10n.searchPickupOnly,
                      ),

                    // Description
                    if (comprador.descripcion != null && comprador.descripcion!.isNotEmpty) ...[
                      SizedBox(height: 16),
                      Divider(),
                      SizedBox(height: 12),
                      Text(
                        l10n.evaluationDescription,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        comprador.descripcion!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                          height: 1.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Footer with action button
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey[200]!)),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _launchUrl(comprador.urlAnuncio),
                  icon: Icon(Icons.open_in_new),
                  label: Text(
                    l10n.evaluationViewFullListing,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary600,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(vertical: 16),
                    textStyle: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
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

  Future<void> _launchUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (kDebugMode) print('❌ Cannot launch URL: $url');
      }
    } catch (e) {
      if (kDebugMode) print('❌ Error launching URL: $e');
    }
  }
}

