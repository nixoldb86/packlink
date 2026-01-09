// Search Results View Widget - Horizontal Sections Navigation
//
// Navegación horizontal entre secciones con scroll vertical dentro de cada una:
// 1. SearchResultsHeader (barra de búsqueda + ubicación + píldoras de países)
// 2. Navegación horizontal con PageView entre:
//    - "Todos los resultados" (scroll vertical)
//    - "Los más cercanos" (scroll vertical, ordenados por distancia)
//    - "Los más económicos" (scroll vertical, ordenados por precio)
// 3. Flechas chevron para navegar entre secciones

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:remixicon/remixicon.dart';
import '../../../../config/theme.dart';
import '../../../../config/api_config.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/location_provider.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/models/search_filters.dart';
import '../../../../shared/components/images/network_image_widget.dart';
import '../../../../shared/components/loading/motivational_text_rotator.dart';
import '../../../../shared/components/loading/youtube_style_progress_bar.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import '../../../../core/utils/country_flags.dart';
import 'package:circle_flags/circle_flags.dart';
import 'search_controls.dart';
import 'search_result_detail_modal.dart';
import 'search_results_map_view.dart';
import 'location_indicator.dart';
import '../modals/search_type_modal.dart';
import '../modals/registration_modal.dart';
import '../../../../config/routes.dart';

/// Search Results View - New design with original components
class SearchResultsViewNew extends StatefulWidget {
  const SearchResultsViewNew({super.key});

  @override
  State<SearchResultsViewNew> createState() => _SearchResultsViewNewState();
}

class _SearchResultsViewNewState extends State<SearchResultsViewNew> {
  bool _showBanner = true;
  double _lastScrollPosition = 0;

  void _onScrollNotification(ScrollNotification notification) {
    if (notification is ScrollUpdateNotification) {
      final currentPosition = notification.metrics.pixels;
      
      // Si scrolleamos hacia abajo y no estamos al inicio, ocultar banner
      if (currentPosition > _lastScrollPosition && currentPosition > 50) {
        if (_showBanner) setState(() => _showBanner = false);
      }
      // Si scrolleamos hasta arriba del todo, mostrar banner
      else if (currentPosition <= 0) {
        if (!_showBanner) setState(() => _showBanner = true);
      }
      
      _lastScrollPosition = currentPosition;
    }
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        _onScrollNotification(notification);
        return false;
      },
      child: Column(
        children: [
          // Banner animado
          _AnimatedGuestBanner(isVisible: _showBanner),
          const SearchResultsHeader(),
          Expanded(
            child: _SearchResultsSections(),
          ),
        ],
      ),
    );
  }
}

/// Banner de modo invitado animado
class _AnimatedGuestBanner extends StatelessWidget {
  final bool isVisible;

  const _AnimatedGuestBanner({required this.isVisible});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    if (authProvider.isAuthenticated || authProvider.status == AuthStatus.unknown) {
      return const SizedBox.shrink();
    }

    final l10n = context.l10n;
    final isMobile = MediaQuery.of(context).size.width < 600;

    return AnimatedCrossFade(
      duration: const Duration(milliseconds: 200),
      crossFadeState: isVisible ? CrossFadeState.showFirst : CrossFadeState.showSecond,
      firstChild: Container(
        width: double.infinity,
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
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 12,
            vertical: isMobile ? 6 : 8,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Icon(
                  Icons.info_outline,
                  size: isMobile ? 14 : 16,
                  color: AppTheme.primary600,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: '${l10n.guestModeBannerTitle} - ',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.gray700,
                          fontSize: isMobile ? 11 : 12,
                        ),
                      ),
                      TextSpan(
                        text: l10n.guestModeBannerCTA,
                        style: TextStyle(
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary600,
                          decoration: TextDecoration.underline,
                          decorationColor: AppTheme.primary600,
                        ),
                      ),
                      TextSpan(
                        text: l10n.guestModeBannerRest,
                        style: TextStyle(
                          color: AppTheme.gray700,
                          fontSize: isMobile ? 11 : 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      secondChild: const SizedBox(width: double.infinity, height: 0),
    );
  }
}

/// Header original con barra de búsqueda
class SearchResultsHeader extends StatefulWidget {
  const SearchResultsHeader({super.key});

  @override
  State<SearchResultsHeader> createState() => _SearchResultsHeaderState();
}

class _SearchResultsHeaderState extends State<SearchResultsHeader> {
  late TextEditingController _searchController;
  String? _lastSearchText;
  bool _isEditing = false;
  
  // Modal states
  bool _showSearchTypeModal = false;
  bool _showRegistrationModal = false;
  String _pendingSearchText = '';
  
  // Controls bar expanded state
  bool _isControlsExpanded = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _searchController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onTextChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentText = _searchController.text.trim();
    final searchText = _lastSearchText ?? '';
    if (currentText != searchText && !_isEditing) {
      setState(() => _isEditing = true);
    } else if (currentText == searchText && _isEditing) {
      setState(() => _isEditing = false);
    }
  }

  void _handleSearchSubmit(String value) {
    if (value.trim().isNotEmpty) {
      setState(() {
        _isEditing = false;
        _pendingSearchText = value.trim();
        _showSearchTypeModal = true;
      });
    }
  }

  void _executeClassicSearch() {
    setState(() => _showSearchTypeModal = false);
    final searchProvider = context.read<SearchProvider>();
    final userLanguage = Localizations.localeOf(context).languageCode;
    searchProvider.startSearch(_pendingSearchText, userLanguage: userLanguage);
    context.go('${AppRoutes.appSearch}?q=${Uri.encodeComponent(_pendingSearchText)}');
  }

  void _executeSmartSearch() {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
        _showRegistrationModal = true;
      });
      return;
    }
    setState(() => _showSearchTypeModal = false);
    final searchProvider = context.read<SearchProvider>();
    final userLanguage = Localizations.localeOf(context).languageCode;
    searchProvider.startSearch(_pendingSearchText, userLanguage: userLanguage);
    context.go('${AppRoutes.appSearch}?q=${Uri.encodeComponent(_pendingSearchText)}');
  }

  void _executeSalesAnalysis() {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
        _showRegistrationModal = true;
      });
      return;
    }
    setState(() => _showSearchTypeModal = false);
    context.go('${AppRoutes.appSell}?product=${Uri.encodeComponent(_pendingSearchText)}');
  }

  Widget _buildSearchBar(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      children: [
        // Search bar - más estrecha verticalmente
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppTheme.primary500, width: 1.5),
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Icono de localización redondo en lugar del logo
              if (isMobile) ...[
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: _SearchBarLocationIcon(),
                ),
              ],
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: l10n.dashboardWhatDoYouWantToSearch,
                    hintStyle: TextStyle(color: AppTheme.gray400, fontSize: isMobile ? 13 : 14),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 10 : 20,
                      vertical: isMobile ? 8 : 10, // Más estrecho
                    ),
                    isDense: true,
                  ),
                  style: TextStyle(fontSize: isMobile ? 13 : 14, color: AppTheme.gray900),
                  onSubmitted: (value) => _handleSearchSubmit(value),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(right: 3),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(50),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _isEditing ? () => _handleSearchSubmit(_searchController.text) : null,
                    borderRadius: BorderRadius.circular(50),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: isMobile ? 8 : 10,
                        vertical: isMobile ? 6 : 6, // Más compacto
                      ),
                      child: Icon(
                        _isEditing ? Icons.arrow_forward : Icons.search,
                        color: Colors.white,
                        size: isMobile ? 16 : 18, // Más pequeño
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Progress bar
        if (searchProvider.status == SearchStatus.searching)
          Padding(
            padding: const EdgeInsets.only(top: 3),
            child: YouTubeStyleProgressBar(
              progress: searchProvider.progress?.progressPercent ?? 0.0,
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    // Sync controller with provider's search text
    if (_lastSearchText != searchProvider.searchText) {
      _lastSearchText = searchProvider.searchText;
      _searchController.text = searchProvider.searchText ?? '';
      if (_isEditing) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) setState(() => _isEditing = false);
        });
      }
    }

    final isSearching = searchProvider.status == SearchStatus.searching;
    final hasResults = searchProvider.hasResults;

    return Stack(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), // Más compacto
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Barra de búsqueda
              _buildSearchBar(context, searchProvider, l10n),

              // Motivational text
              if (isSearching && !hasResults) ...[
                const SizedBox(height: 12),
                const Center(child: MotivationalTextRotator()),
              ],

              const SizedBox(height: 8), // Más compacto

              // Country pills + View mode + Filter toggle
              // When controls are expanded, they take full width
              if (hasResults && _isControlsExpanded)
                AnimatedControlsBar(
                  isExpanded: _isControlsExpanded,
                  onToggle: () => setState(() => _isControlsExpanded = !_isControlsExpanded),
                )
              else
                Row(
                  children: [
                    // Sin LocationIndicator aquí - ahora está en la barra de búsqueda
                    Expanded(child: _CountryPills()),
                    if (hasResults) ...[
                      const SizedBox(width: 6),
                      const _ResultsViewModeSegmentedControl(),
                      const SizedBox(width: 6),
                      AnimatedControlsBar(
                        isExpanded: _isControlsExpanded,
                        onToggle: () => setState(() => _isControlsExpanded = !_isControlsExpanded),
                      ),
                    ],
                  ],
                ),
            ],
          ),
        ),
        
        // Modales
        if (_showSearchTypeModal)
          SearchTypeModal(
            searchText: _pendingSearchText,
            isGuestMode: !context.watch<AuthProvider>().isAuthenticated,
            onClose: () => setState(() => _showSearchTypeModal = false),
            onClassicSearch: _executeClassicSearch,
            onSmartSearch: _executeSmartSearch,
            onSalesAnalysis: _executeSalesAnalysis,
          ),
        if (_showRegistrationModal)
          RegistrationModal(
            onClose: () => setState(() => _showRegistrationModal = false),
            onRegister: () async {
              setState(() => _showRegistrationModal = false);
              final landingUrl = ApiConfig.isProduction
                  ? 'https://pricofy.com/landing'
                  : 'https://dev.pricofy.com/#/landing';
              final uri = Uri.parse(landingUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.platformDefault);
              }
            },
          ),
      ],
    );
  }
}

/// Icono de localización redondo para la barra de búsqueda
/// Reemplaza al logo de Pricofy y muestra la ubicación del usuario
class _SearchBarLocationIcon extends StatefulWidget {
  const _SearchBarLocationIcon();

  @override
  State<_SearchBarLocationIcon> createState() => _SearchBarLocationIconState();
}

class _SearchBarLocationIconState extends State<_SearchBarLocationIcon> {
  final GlobalKey _iconKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  bool _isPopoverVisible = false;

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _isPopoverVisible = false);
    }
  }

  void _showPopover(BuildContext context, dynamic location) {
    if (_isPopoverVisible) {
      _removeOverlay();
      return;
    }

    final RenderBox? renderBox = _iconKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final position = renderBox.localToGlobal(Offset.zero);
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: _removeOverlay,
              behavior: HitTestBehavior.opaque,
              child: Container(color: Colors.transparent),
            ),
          ),
          Positioned(
            left: position.dx,
            top: position.dy + size.height + 8,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(12),
              shadowColor: Colors.black26,
              child: _buildPopoverContent(location),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isPopoverVisible = true);
  }

  Widget _buildPopoverContent(dynamic location) {
    final flag = getCountryFlagEmoji(location.countryCode);

    final parts = <String>[];
    if (location.postalCode != null) parts.add(location.postalCode!);
    if (location.municipality != null) parts.add(location.municipality!);
    if (parts.isEmpty) parts.add(location.countryCode);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      constraints: const BoxConstraints(maxWidth: 260),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.location_on_rounded, size: 16, color: AppTheme.primary600),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              parts.join(' · '),
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.gray800),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 6),
          Text(flag, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = context.watch<LocationProvider>();

    if (locationProvider.isDetecting) {
      return Container(
        key: _iconKey,
        width: 28,
        height: 28,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppTheme.gray100,
        ),
        child: Center(
          child: SizedBox(
            width: 12,
            height: 12,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gray400),
            ),
          ),
        ),
      );
    }

    final location = locationProvider.location;
    if (location == null) {
      return Container(
        key: _iconKey,
        width: 28,
        height: 28,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppTheme.gray100,
        ),
        child: Center(
          child: Icon(Icons.location_off_rounded, size: 14, color: AppTheme.gray400),
        ),
      );
    }

    return GestureDetector(
      onTap: () => _showPopover(context, location),
      child: Container(
        key: _iconKey,
        width: 28,
        height: 28,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: _isPopoverVisible
              ? LinearGradient(
                  colors: [AppTheme.primary500, Colors.purple.shade500],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: _isPopoverVisible ? null : AppTheme.primary50,
          border: Border.all(
            color: _isPopoverVisible ? Colors.transparent : AppTheme.primary200,
            width: 1,
          ),
        ),
        child: Center(
          child: Icon(
            Icons.location_on_rounded,
            size: 16,
            color: _isPopoverVisible ? Colors.white : AppTheme.primary600,
          ),
        ),
      ),
    );
  }
}

/// Píldoras de países (funcionan como filtros)
/// Altura igual al segmented control de vista (28px), banderas circulares
class _CountryPills extends StatefulWidget {
  @override
  State<_CountryPills> createState() => _CountryPillsState();
}

class _CountryPillsState extends State<_CountryPills> {
  Set<String> _selectedCountries = {};
  bool _initialized = false;

  void _applyCountryFilter(SearchProvider searchProvider) {
    final currentFilters = searchProvider.filters;
    final newFilters = currentFilters.copyWith(
      countries: _selectedCountries.isEmpty ? null : _selectedCountries.toList(),
    );
    searchProvider.applyFilters(newFilters);
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final countries = searchProvider.availableCountries;
    final filterCountries = searchProvider.filters.countries;

    if (countries.isEmpty) return const SizedBox.shrink();

    // Sync with provider filters - if provider has explicit countries, use those
    if (filterCountries.isNotEmpty) {
      _selectedCountries = Set.from(filterCountries);
    } else if (!_initialized && countries.isNotEmpty) {
      // Initialize all countries as selected only the first time
      _selectedCountries = Set.from(countries);
      _initialized = true;
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: countries.map((countryCode) {
          final isSelected = _selectedCountries.contains(countryCode);
          
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () {
                setState(() {
                  if (isSelected) {
                    _selectedCountries.remove(countryCode);
                  } else {
                    _selectedCountries.add(countryCode);
                  }
                });
                _applyCountryFilter(searchProvider);
              },
              child: Container(
                height: 28, // Misma altura que el segmented control
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary50 : AppTheme.gray100,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary500 : AppTheme.gray300,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Bandera circular
                    ClipOval(
                      child: CircleFlag(
                        countryCode.toLowerCase(),
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      countryCode,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected ? AppTheme.primary700 : AppTheme.gray700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Segmented control iOS-like para cambiar el modo de vista (lista / mosaico / mapa)
/// Compacto: botones más estrechos horizontal y verticalmente
class _ResultsViewModeSegmentedControl extends StatelessWidget {
  const _ResultsViewModeSegmentedControl();

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final selected = searchProvider.viewMode;

    const double height = 28; // Más estrecho verticalmente (era 36)
    const double segmentWidth = 32; // Más estrecho horizontalmente (era 46)
    const double radius = 10;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppTheme.primary50,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: AppTheme.primary200),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary600.withValues(alpha: 0.08),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _SegButton(
            width: segmentWidth,
            icon: Remix.menu_2_line,
            isSelected: selected == ViewMode.list,
            position: _SegPosition.left,
            onTap: () => searchProvider.setViewMode(ViewMode.list),
          ),
          _SegButton(
            width: segmentWidth,
            icon: Remix.layout_grid_line,
            isSelected: selected == ViewMode.cards,
            position: _SegPosition.middle,
            onTap: () => searchProvider.setViewMode(ViewMode.cards),
          ),
          _SegButton(
            width: segmentWidth,
            isSelected: selected == ViewMode.map,
            position: _SegPosition.right,
            onTap: () => searchProvider.setViewMode(ViewMode.map),
            icon: Remix.map_2_line,
          ),
        ],
      ),
    );
  }
}

enum _SegPosition { left, middle, right }

class _SegButton extends StatelessWidget {
  final double width;
  final IconData? icon;
  final bool isSelected;
  final _SegPosition position;
  final VoidCallback onTap;
  final Widget Function(Color color)? customIconBuilder;

  const _SegButton({
    required this.width,
    this.icon,
    required this.isSelected,
    required this.position,
    required this.onTap,
    this.customIconBuilder,
  });

  @override
  Widget build(BuildContext context) {
    BorderRadius? r;
    if (position == _SegPosition.left) {
      r = const BorderRadius.only(
        topLeft: Radius.circular(8),
        bottomLeft: Radius.circular(8),
      );
    } else if (position == _SegPosition.right) {
      r = const BorderRadius.only(
        topRight: Radius.circular(8),
        bottomRight: Radius.circular(8),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOutCubic,
        width: width,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: [AppTheme.primary500, Colors.purple.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : Colors.white,
          borderRadius: r,
          border: position != _SegPosition.left
              ? Border(left: BorderSide(color: AppTheme.primary200))
              : null,
        ),
        child: Center(
          child: customIconBuilder != null
              ? customIconBuilder!(isSelected ? Colors.white : AppTheme.primary600)
              : Icon(
                  icon,
                  size: 16, // Más pequeño (era 20)
                  color: isSelected ? Colors.white : AppTheme.primary600,
                ),
        ),
      ),
    );
  }
}

/// Icono tipo "pin + sonrisa" (Remix no trae el smile, lo dibujamos para clavar el estilo)
class _MapPinWithSmile extends StatelessWidget {
  final Color color;
  final double size;

  const _MapPinWithSmile({required this.color, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size + 2,
      height: size + 2,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(Remix.map_pin_2_line, size: size, color: color),
          Positioned(
            bottom: 1,
            child: CustomPaint(
              size: Size(size * 0.8, size * 0.4),
              painter: _SmileArcPainter(color: color),
            ),
          ),
        ],
      ),
    );
  }
}

class _SmileArcPainter extends CustomPainter {
  final Color color;
  const _SmileArcPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    final rect = Rect.fromLTWH(1, 0, size.width - 2, size.height - 1);
    canvas.drawArc(rect, 0.15 * 3.14159, 0.7 * 3.14159, false, paint);
  }

  @override
  bool shouldRepaint(covariant _SmileArcPainter oldDelegate) => oldDelegate.color != color;
}

/// Secciones de resultados con navegación horizontal entre secciones
class _SearchResultsSections extends StatefulWidget {
  @override
  State<_SearchResultsSections> createState() => _SearchResultsSectionsState();
}

class _SearchResultsSectionsState extends State<_SearchResultsSections> {
  late PageController _pageController;
  int _currentPage = 0;
  
  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }
  
  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
  
  void _goToPage(int page) {
    if (page >= 0 && page < 3) {
      _pageController.animateToPage(
        page,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final l10n = context.l10n;
    
    // Títulos de las secciones (traducidos)
    final sectionTitles = [
      l10n.sectionAllResults,
      l10n.sectionNearest,
      l10n.sectionCheapest,
    ];
    
    if (searchProvider.status == SearchStatus.searching && !searchProvider.hasResults) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (!searchProvider.hasResults) {
      return const Center(child: Text('No hay resultados'));
    }

    return Column(
      children: [
        // Header con título y flechas de navegación
        _SectionNavigationHeader(
          currentPage: _currentPage,
          sectionTitles: sectionTitles,
          onPrevious: () => _goToPage(_currentPage - 1),
          onNext: () => _goToPage(_currentPage + 1),
        ),
        
        // PageView horizontal con las 3 secciones
        Expanded(
          child: PageView(
            controller: _pageController,
            onPageChanged: (page) => setState(() => _currentPage = page),
            children: [
              _AllResultsSection(),
              _NearestResultsSectionVertical(),
              _CheapestResultsSection(),
            ],
          ),
        ),
      ],
    );
  }
}

/// Header de navegación entre secciones con flechas chevron - Compacto
class _SectionNavigationHeader extends StatelessWidget {
  final int currentPage;
  final List<String> sectionTitles;
  final VoidCallback onPrevious;
  final VoidCallback onNext;

  const _SectionNavigationHeader({
    required this.currentPage,
    required this.sectionTitles,
    required this.onPrevious,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final canGoPrevious = currentPage > 0;
    final canGoNext = currentPage < sectionTitles.length - 1;
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), // Más compacto
      child: Row(
        children: [
          // Flecha izquierda (chevron simple)
          _ChevronButton(
            direction: _ChevronDirection.left,
            isEnabled: canGoPrevious,
            onTap: canGoPrevious ? onPrevious : null,
          ),
          
          // Título de la sección actual
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Text(
                sectionTitles[currentPage],
                key: ValueKey(currentPage),
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14, // Más pequeño
                  fontWeight: FontWeight.w600,
                  color: AppTheme.gray800,
                ),
              ),
            ),
          ),
          
          // Flecha derecha (chevron simple)
          _ChevronButton(
            direction: _ChevronDirection.right,
            isEnabled: canGoNext,
            onTap: canGoNext ? onNext : null,
          ),
        ],
      ),
    );
  }
}

enum _ChevronDirection { left, right }

/// Botón chevron minimalista (2 líneas) - Más pequeño
class _ChevronButton extends StatelessWidget {
  final _ChevronDirection direction;
  final bool isEnabled;
  final VoidCallback? onTap;

  const _ChevronButton({
    required this.direction,
    required this.isEnabled,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28, // Más pequeño
        height: 28,
        alignment: Alignment.center,
        child: CustomPaint(
          size: const Size(10, 16), // Más pequeño
          painter: _ChevronPainter(
            direction: direction,
            color: isEnabled ? AppTheme.primary600 : AppTheme.gray300,
          ),
        ),
      ),
    );
  }
}

/// Painter para dibujar chevron minimalista (2 líneas)
class _ChevronPainter extends CustomPainter {
  final _ChevronDirection direction;
  final Color color;

  _ChevronPainter({required this.direction, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.0 // Más fino
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    if (direction == _ChevronDirection.left) {
      // Chevron izquierdo: >
      path.moveTo(size.width * 0.8, 0);
      path.lineTo(size.width * 0.2, size.height * 0.5);
      path.lineTo(size.width * 0.8, size.height);
    } else {
      // Chevron derecho: <
      path.moveTo(size.width * 0.2, 0);
      path.lineTo(size.width * 0.8, size.height * 0.5);
      path.lineTo(size.width * 0.2, size.height);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ChevronPainter oldDelegate) {
    return oldDelegate.direction != direction || oldDelegate.color != color;
  }
}

/// Card promocional para activar búsqueda avanzada
/// Se muestra después de 20 anuncios, luego cada 40 para usuarios no autenticados
class _AdvancedSearchPromoCard extends StatelessWidget {
  final String searchText;
  final VoidCallback? onDismiss;
  
  const _AdvancedSearchPromoCard({required this.searchText, this.onDismiss});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final authProvider = context.watch<AuthProvider>();
    
    // No mostrar si el usuario está autenticado
    if (authProvider.isAuthenticated) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primary200, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary500.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con icono y título
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icono de estrellas/magia
              const Text(
                '✨',
                style: TextStyle(fontSize: 24),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.advancedSearchPromoTitle,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                    height: 1.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Lista de beneficios
          _buildBenefitItem(context, l10n.advancedSearchPromoBenefit1(searchText)),
          const SizedBox(height: 6),
          _buildBenefitItem(context, l10n.advancedSearchPromoBenefit2),
          const SizedBox(height: 6),
          _buildBenefitItem(context, l10n.advancedSearchPromoBenefit3),
          const SizedBox(height: 16),
          
          // Botones
          Row(
            children: [
              // Botón principal
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _onActivateAdvanced(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    l10n.advancedSearchPromoActivate,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Botón secundario - cierra la tarjeta
              TextButton(
                onPressed: onDismiss,
                child: Text(
                  l10n.advancedSearchPromoNotNow,
                  style: TextStyle(
                    color: AppTheme.gray500,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitItem(BuildContext context, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.check,
          size: 18,
          color: Colors.green.shade600,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.gray700,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }

  void _onActivateAdvanced(BuildContext context) {
    // Mostrar modal de registro
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (ctx) => RegistrationModal(
        onClose: () => Navigator.of(ctx).pop(),
        message: context.l10n.registrationModalAdvancedSearch,
      ),
    );
  }
}

/// Primera posición donde se inserta la card promocional
const int _firstPromoPosition = 20;
/// Intervalo entre cards promocionales subsiguientes
const int _promoInterval = 40;

/// Calcula las posiciones de las promo cards que deben mostrarse
List<int> _getPromoPositions(int totalResults, Set<int> dismissedPositions) {
  final positions = <int>[];
  // Primera posición en 20
  if (totalResults > _firstPromoPosition && !dismissedPositions.contains(_firstPromoPosition)) {
    positions.add(_firstPromoPosition);
  }
  // Siguientes cada 40 (60, 100, 140...)
  int nextPosition = _firstPromoPosition + _promoInterval;
  while (nextPosition < totalResults) {
    if (!dismissedPositions.contains(nextPosition)) {
      positions.add(nextPosition);
    }
    nextPosition += _promoInterval;
  }
  return positions;
}

/// 1. Sección "Todos los resultados" con scroll vertical
class _AllResultsSection extends StatefulWidget {
  @override
  State<_AllResultsSection> createState() => _AllResultsSectionState();
}

class _AllResultsSectionState extends State<_AllResultsSection> {
  final Set<int> _dismissedPromoPositions = {};
  
  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    final results = searchProvider.filteredResults;
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';
    
    // Calcular posiciones de promo cards
    final promoPositions = !authProvider.isAuthenticated 
        ? _getPromoPositions(results.length, _dismissedPromoPositions)
        : <int>[];
    final showPromoCard = promoPositions.isNotEmpty;
    
    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }
    
    // Vista de lista con promo cards en múltiples posiciones
    if (viewMode == ViewMode.list) {
      final totalItems = results.length + promoPositions.length;
      
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: totalItems,
        itemBuilder: (context, index) {
          // Calcular cuántas promo cards hay antes de este índice
          int promosBefore = 0;
          int? currentPromoPosition;
          for (final pos in promoPositions) {
            if (pos + promosBefore < index) {
              promosBefore++;
            } else if (pos + promosBefore == index) {
              currentPromoPosition = pos;
              break;
            }
          }
          
          // Si este índice es una promo card
          if (currentPromoPosition != null) {
            return _AdvancedSearchPromoCard(
              searchText: searchText,
              onDismiss: () => _dismissPromoAt(currentPromoPosition!),
            );
          }
          
          // Si no, mostrar resultado ajustando el índice
          final resultIndex = index - promosBefore;
          if (resultIndex < results.length) {
            return _ResultListItem(result: results[resultIndex]);
          }
          return const SizedBox.shrink();
        },
      );
    }
    
    // Vista mosaico - usar CustomScrollView con múltiples promo cards
    return _buildGridWithMultiplePromoCards(
      context: context,
      results: results,
      promoPositions: promoPositions,
      searchText: searchText,
      onDismissPromo: _dismissPromoAt,
    );
  }
}

/// 2. Sección "Los más cercanos" con scroll vertical
class _NearestResultsSectionVertical extends StatefulWidget {
  @override
  State<_NearestResultsSectionVertical> createState() => _NearestResultsSectionVerticalState();
}

class _NearestResultsSectionVerticalState extends State<_NearestResultsSectionVertical> {
  final Set<int> _dismissedPromoPositions = {};
  
  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';
    
    // Ordenar por cercanía
    final nearestResults = List<SearchResult>.from(searchProvider.filteredResults)
      ..sort((a, b) {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance!.compareTo(b.distance!);
      });

    if (nearestResults.isEmpty) {
      return const Center(child: Text('No hay resultados cercanos'));
    }
    
    final promoPositions = !authProvider.isAuthenticated 
        ? _getPromoPositions(nearestResults.length, _dismissedPromoPositions)
        : <int>[];

    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }
    
    // Vista de lista con promo cards
    if (viewMode == ViewMode.list) {
      final totalItems = nearestResults.length + promoPositions.length;
      
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: totalItems,
        itemBuilder: (context, index) {
          int promosBefore = 0;
          int? currentPromoPosition;
          for (final pos in promoPositions) {
            if (pos + promosBefore < index) {
              promosBefore++;
            } else if (pos + promosBefore == index) {
              currentPromoPosition = pos;
              break;
            }
          }
          
          if (currentPromoPosition != null) {
            return _AdvancedSearchPromoCard(
              searchText: searchText,
              onDismiss: () => _dismissPromoAt(currentPromoPosition!),
            );
          }
          
          final resultIndex = index - promosBefore;
          if (resultIndex < nearestResults.length) {
            return _ResultListItem(result: nearestResults[resultIndex]);
          }
          return const SizedBox.shrink();
        },
      );
    }
    
    // Vista mosaico
    return _buildGridWithMultiplePromoCards(
      context: context,
      results: nearestResults,
      promoPositions: promoPositions,
      searchText: searchText,
      onDismissPromo: _dismissPromoAt,
    );
  }
}

/// 3. Sección "Los más económicos" con scroll vertical
class _CheapestResultsSection extends StatefulWidget {
  @override
  State<_CheapestResultsSection> createState() => _CheapestResultsSectionState();
}

class _CheapestResultsSectionState extends State<_CheapestResultsSection> {
  final Set<int> _dismissedPromoPositions = {};
  
  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';
    
    // Ordenar por precio
    final cheapestResults = List<SearchResult>.from(searchProvider.filteredResults)
      ..sort((a, b) => a.price.compareTo(b.price));
    
    final promoPositions = !authProvider.isAuthenticated 
        ? _getPromoPositions(cheapestResults.length, _dismissedPromoPositions)
        : <int>[];

    if (cheapestResults.isEmpty) {
      return const Center(child: Text('No hay resultados'));
    }

    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }
    
    // Vista de lista con promo cards
    if (viewMode == ViewMode.list) {
      final totalItems = cheapestResults.length + promoPositions.length;
      
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: totalItems,
        itemBuilder: (context, index) {
          int promosBefore = 0;
          int? currentPromoPosition;
          for (final pos in promoPositions) {
            if (pos + promosBefore < index) {
              promosBefore++;
            } else if (pos + promosBefore == index) {
              currentPromoPosition = pos;
              break;
            }
          }
          
          if (currentPromoPosition != null) {
            return _AdvancedSearchPromoCard(
              searchText: searchText,
              onDismiss: () => _dismissPromoAt(currentPromoPosition!),
            );
          }
          
          final resultIndex = index - promosBefore;
          if (resultIndex < cheapestResults.length) {
            return _ResultListItem(result: cheapestResults[resultIndex]);
          }
          return const SizedBox.shrink();
        },
      );
    }
    
    // Vista mosaico
    return _buildGridWithMultiplePromoCards(
      context: context,
      results: cheapestResults,
      promoPositions: promoPositions,
      searchText: searchText,
      onDismissPromo: _dismissPromoAt,
    );
  }
}

/// Helper function para construir grid con múltiples promo cards insertadas
Widget _buildGridWithMultiplePromoCards({
  required BuildContext context,
  required List<SearchResult> results,
  required List<int> promoPositions,
  required String searchText,
  required void Function(int) onDismissPromo,
}) {
  return LayoutBuilder(
    builder: (context, constraints) {
      final screenWidth = MediaQuery.of(context).size.width;
      final isMobile = screenWidth < 600;
      
      final spacing = isMobile ? 8.0 : 12.0;
      final horizontalPadding = isMobile ? 12.0 : 16.0;
      
      int actualColumns;
      double aspectRatio;
      
      if (isMobile) {
        actualColumns = 2;
        aspectRatio = 193 / 251;
      } else {
        final cardWidth = 200.0;
        final availableWidth = constraints.maxWidth - (horizontalPadding * 2);
        final columnsCount = (availableWidth / (cardWidth + spacing)).floor();
        actualColumns = columnsCount > 0 ? columnsCount : 1;
        aspectRatio = 0.75;
      }
      
      if (promoPositions.isEmpty) {
        return GridView.builder(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: actualColumns,
            crossAxisSpacing: spacing,
            mainAxisSpacing: spacing,
            childAspectRatio: aspectRatio,
          ),
          itemCount: results.length,
          itemBuilder: (context, index) => _ResultGridItem(result: results[index]),
        );
      }
      
      // Construir slivers con promo cards intercaladas
      final slivers = <Widget>[];
      int lastPosition = 0;
      
      for (final promoPos in promoPositions) {
        // Añadir grid desde la última posición hasta esta promo
        if (promoPos > lastPosition) {
          final segment = results.sublist(lastPosition, promoPos.clamp(0, results.length));
          if (segment.isNotEmpty) {
            slivers.add(
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _ResultGridItem(result: segment[index]),
                    childCount: segment.length,
                  ),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: actualColumns,
                    crossAxisSpacing: spacing,
                    mainAxisSpacing: spacing,
                    childAspectRatio: aspectRatio,
                  ),
                ),
              ),
            );
          }
        }
        
        // Añadir promo card
        slivers.add(
          SliverPadding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            sliver: SliverToBoxAdapter(
              child: _AdvancedSearchPromoCard(
                searchText: searchText,
                onDismiss: () => onDismissPromo(promoPos),
              ),
            ),
          ),
        );
        
        lastPosition = promoPos;
      }
      
      // Añadir el resto de resultados después de la última promo
      if (lastPosition < results.length) {
        final remaining = results.sublist(lastPosition);
        slivers.add(
          SliverPadding(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _ResultGridItem(result: remaining[index]),
                childCount: remaining.length,
              ),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: actualColumns,
                crossAxisSpacing: spacing,
                mainAxisSpacing: spacing,
                childAspectRatio: aspectRatio,
              ),
            ),
          ),
        );
      }
      
      return CustomScrollView(slivers: slivers);
    },
  );
}

/// Shipping indicator - always visible, crossed out when not shippable
class _ShippingIndicator extends StatelessWidget {
  final bool isShippable;
  final double size;

  const _ShippingIndicator({required this.isShippable, this.size = 14});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.local_shipping_outlined,
            size: size,
            color: isShippable ? AppTheme.gray500 : AppTheme.gray300,
          ),
          if (!isShippable)
            CustomPaint(
              size: Size(size, size),
              painter: _StrikeThroughPainter(color: AppTheme.gray400),
            ),
        ],
      ),
    );
  }
}

/// Custom painter for diagonal strike-through line
class _StrikeThroughPainter extends CustomPainter {
  final Color color;
  _StrikeThroughPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      Offset(size.width * 0.8, size.height * 0.2),
      Offset(size.width * 0.2, size.height * 0.8),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Item de resultado en modo lista - Rediseñado
class _ResultListItem extends StatelessWidget {
  final SearchResult result;

  const _ResultListItem({required this.result});

  void _showDetailModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    const double imageSize = 56;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: AppTheme.gray200),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Imagen
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: result.hasImage
                      ? NetworkImageWidget(
                          key: ValueKey(result.imageUrl),
                          imageUrl: result.imageUrl!,
                          width: imageSize,
                          height: imageSize,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          width: imageSize,
                          height: imageSize,
                          color: AppTheme.gray200,
                          child: Icon(Icons.image_outlined, size: 22, color: AppTheme.gray400),
                        ),
                ),
                const SizedBox(width: 10),
                
                // Información - altura igual a la imagen
                Expanded(
                  child: SizedBox(
                    height: imageSize,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Línea 1: Título + Icono plataforma (alineado con parte SUPERIOR de la imagen)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                result.title,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  height: 1.2,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            PlatformIconWithFlag(
                              platform: result.platform,
                              countryCode: result.countryCode,
                              size: 24,
                            ),
                          ],
                        ),
                        // Línea 2: Precio + Envío/Ubicación (alineado con parte INFERIOR de la imagen)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Precio a la izquierda (muy destacado)
                            Text(
                              '${result.price.toStringAsFixed(2)} €',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF667EEA),
                                height: 1.0,
                              ),
                            ),
                            const Spacer(),
                            // Envío y ubicación a la derecha
                            _ShippingIndicator(isShippable: result.isShippable, size: 12),
                            const SizedBox(width: 6),
                            Icon(Icons.near_me, size: 10, color: AppTheme.gray500),
                            const SizedBox(width: 2),
                            Text(
                              result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.gray600,
                                height: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Item de resultado en modo cuadrícula - Compacto para móvil (193x251 en iPhone 14 Pro Max)
class _ResultGridItem extends StatelessWidget {
  final SearchResult result;

  const _ResultGridItem({required this.result});

  void _showDetailModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final borderRadius = isMobile ? 8.0 : 12.0;
    final imagePadding = isMobile ? 4.0 : 6.0;
    
    return Card(
      elevation: 1,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen con marco blanco alrededor
            Expanded(
              flex: 60,
              child: Container(
                padding: EdgeInsets.all(imagePadding),
                color: Colors.white,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(borderRadius - 2),
                  child: result.hasImage
                      ? NetworkImageWidget(
                          key: ValueKey(result.imageUrl),
                          imageUrl: result.imageUrl!,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          color: AppTheme.gray200,
                          child: Center(
                            child: Icon(
                              Icons.image_outlined, 
                              size: isMobile ? 28 : 40, 
                              color: AppTheme.gray400,
                            ),
                          ),
                        ),
                ),
              ),
            ),
            
            // Información compacta
            Padding(
              padding: EdgeInsets.all(isMobile ? 6 : 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Título + icono plataforma (altura fija 2 líneas)
                  SizedBox(
                    height: isMobile ? 28 : 32, // Altura fija para 2 líneas
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            result.title,
                            style: TextStyle(
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: FontWeight.w600,
                              height: 1.2,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        PlatformIconWithFlag(
                          platform: result.platform,
                          countryCode: result.countryCode,
                          size: isMobile ? 20 : 24,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Precio (muy destacado)
                  Text(
                    '${result.price.toStringAsFixed(2)} €',
                    style: TextStyle(
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF667EEA),
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Envío + Distancia
                  Row(
                    children: [
                      _ShippingIndicator(isShippable: result.isShippable, size: isMobile ? 10 : 12),
                      SizedBox(width: isMobile ? 4 : 6),
                      Icon(Icons.near_me, size: isMobile ? 8 : 10, color: AppTheme.gray500),
                      const SizedBox(width: 2),
                      Text(
                        result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                        style: TextStyle(fontSize: isMobile ? 9 : 11, color: AppTheme.gray600),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
