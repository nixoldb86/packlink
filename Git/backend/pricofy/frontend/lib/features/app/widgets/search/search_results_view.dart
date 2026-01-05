// Search Results View Widget - Redesigned
//
// Nueva estructura con secciones pero manteniendo componentes originales:
// 1. SearchResultsHeader original (barra de búsqueda + ubicación + píldoras de países)
// 2. SearchControlsBar original (buscar en resultados + filtros)
// 3. Sección "Todos los resultados" (scroll vertical propio)
// 4. Sección "Los más cercanos" (scroll horizontal)
// 5. Sección "Los más económicos" (scroll vertical propio)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/theme.dart';
import '../../../../config/api_config.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/models/search_filters.dart';
import '../../../../shared/components/images/network_image_widget.dart';
import '../../../../shared/components/loading/motivational_text_rotator.dart';
import '../../../../shared/components/loading/youtube_style_progress_bar.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import '../../../../core/utils/country_flags.dart';
import 'search_controls.dart';
import 'search_result_detail_modal.dart';
import 'search_results_map_view.dart';
import 'location_indicator.dart';
import '../modals/search_type_modal.dart';
import '../modals/registration_modal.dart';
import '../../../../config/routes.dart';

/// Search Results View - New design with original components
class SearchResultsViewNew extends StatelessWidget {
  const SearchResultsViewNew({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SearchResultsHeader(),
        Expanded(
          child: _SearchResultsSections(),
        ),
      ],
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
        // Search bar
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppTheme.primary500, width: 2),
            borderRadius: BorderRadius.circular(50),
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
              if (isMobile) ...[
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: GestureDetector(
                    onTap: () => context.go('/'),
                    child: Image.asset(
                      'assets/images/solo_logo_sin_Fondo.png',
                      height: 36,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ],
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: l10n.dashboardWhatDoYouWantToSearch,
                    hintStyle: TextStyle(color: AppTheme.gray400, fontSize: 16),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 12 : 24,
                      vertical: 14,
                    ),
                  ),
                  style: TextStyle(fontSize: 16, color: AppTheme.gray900),
                  onSubmitted: (value) => _handleSearchSubmit(value),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(right: 4),
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
                        horizontal: isMobile ? 10 : 12,
                        vertical: isMobile ? 10 : 8, // Menos padding vertical en desktop
                      ),
                      child: Icon(
                        _isEditing ? Icons.arrow_forward : Icons.search,
                        color: Colors.white,
                        size: isMobile ? 20 : 24,
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
            padding: const EdgeInsets.only(top: 4),
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
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Barra de búsqueda
              _buildSearchBar(context, searchProvider, l10n),

              // Motivational text
              if (isSearching && !hasResults) ...[
                const SizedBox(height: 16),
                const Center(child: MotivationalTextRotator()),
              ],

              const SizedBox(height: 12),

              // Location indicator + Country pills + Animated controls
              // When controls are expanded, they take full width
              if (hasResults && _isControlsExpanded)
                AnimatedControlsBar(
                  isExpanded: _isControlsExpanded,
                  onToggle: () => setState(() => _isControlsExpanded = !_isControlsExpanded),
                )
              else
                Row(
                  children: [
                    const LocationIndicator(),
                    const SizedBox(width: 8),
                    Expanded(child: _CountryPills()),
                    if (hasResults) ...[
                      const SizedBox(width: 8),
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

/// Píldoras de países (funcionan como filtros)
class _CountryPills extends StatefulWidget {
  @override
  State<_CountryPills> createState() => _CountryPillsState();
}

class _CountryPillsState extends State<_CountryPills> {
  Set<String> _selectedCountries = {};

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

    if (countries.isEmpty) return const SizedBox.shrink();

    // Initialize all countries as selected if first time
    if (_selectedCountries.isEmpty && countries.isNotEmpty) {
      _selectedCountries = Set.from(countries);
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: countries.map((countryCode) {
          final flag = getCountryFlagEmoji(countryCode);
          final isSelected = _selectedCountries.contains(countryCode);
          
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
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
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary50 : AppTheme.gray100,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary500 : AppTheme.gray300,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(flag, style: const TextStyle(fontSize: 14)),
                    const SizedBox(width: 4),
                    Text(
                      countryCode,
                      style: TextStyle(
                        fontSize: 12,
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

/// Secciones de resultados con scroll inteligente
class _SearchResultsSections extends StatefulWidget {
  @override
  State<_SearchResultsSections> createState() => _SearchResultsSectionsState();
}

class _SearchResultsSectionsState extends State<_SearchResultsSections> {
  final ScrollController _mainScrollController = ScrollController();
  
  // Controlar qué sección está activa para el scroll
  bool _allResultsScrollActive = false;
  bool _cheapestScrollActive = false;
  
  @override
  void dispose() {
    _mainScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    
    if (searchProvider.status == SearchStatus.searching && !searchProvider.hasResults) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (!searchProvider.hasResults) {
      return const Center(child: Text('No hay resultados'));
    }

    return SingleChildScrollView(
      controller: _mainScrollController,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Sección "Todos los resultados"
          _AllResultsSectionWithSmartScroll(
            onScrollStateChanged: (active) {
              setState(() => _allResultsScrollActive = active);
            },
            isActive: _allResultsScrollActive,
          ),
          const SizedBox(height: 32),
          
          // 2. Sección "Los más cercanos" (scroll horizontal - no conflicto)
          _NearestResultsSection(),
          const SizedBox(height: 32),
          
          // 3. Sección "Los más económicos"
          _CheapestSectionWithSmartScroll(
            onScrollStateChanged: (active) {
              setState(() => _cheapestScrollActive = active);
            },
            isActive: _cheapestScrollActive,
          ),
          const SizedBox(height: 80), // Espacio para bottom nav
        ],
      ),
    );
  }
}

/// 1. Sección "Todos los resultados" con scroll inteligente
class _AllResultsSectionWithSmartScroll extends StatefulWidget {
  final Function(bool) onScrollStateChanged;
  final bool isActive;

  const _AllResultsSectionWithSmartScroll({
    required this.onScrollStateChanged,
    required this.isActive,
  });

  @override
  State<_AllResultsSectionWithSmartScroll> createState() => _AllResultsSectionWithSmartScrollState();
}

class _AllResultsSectionWithSmartScrollState extends State<_AllResultsSectionWithSmartScroll> {
  final ScrollController _scrollController = ScrollController();
  DateTime? _lastScrollTime;
  double _lastScrollPosition = 0;
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  // Detecta si el scroll es "lento" (interacción dentro de la sección)
  bool _isSlowScroll(ScrollNotification notification) {
    if (notification is ScrollUpdateNotification) {
      final now = DateTime.now();
      if (_lastScrollTime != null) {
        final timeDiff = now.difference(_lastScrollTime!).inMilliseconds;
        final posDiff = (notification.metrics.pixels - _lastScrollPosition).abs();
        
        // Velocidad en pixels por milisegundo
        if (timeDiff > 0) {
          final velocity = posDiff / timeDiff;
          // Si velocidad < 0.5 px/ms, es scroll lento (interacción de sección)
          return velocity < 0.5;
        }
      }
      _lastScrollTime = now;
      _lastScrollPosition = notification.metrics.pixels;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final results = searchProvider.filteredResults;
    final viewMode = searchProvider.viewMode;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Text(
          'Todos los resultados',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.gray900,
          ),
        ),
        const SizedBox(height: 12),
        
        // Vista de mapa ocupa toda la pantalla
        if (viewMode == ViewMode.map)
          SizedBox(
            height: 500,
            child: const SearchResultsMapView(),
          )
        else
          // Resultados con scroll vertical propio
          MouseRegion(
            onEnter: (_) => widget.onScrollStateChanged(true),
            onExit: (_) => widget.onScrollStateChanged(false),
            child: GestureDetector(
              onVerticalDragStart: (_) => widget.onScrollStateChanged(true),
              onVerticalDragEnd: (_) => widget.onScrollStateChanged(false),
              child: Container(
                height: 500,
                decoration: BoxDecoration(
                  border: widget.isActive 
                      ? Border.all(color: AppTheme.primary200, width: 2)
                      : null,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    // Si el scroll es lento, lo manejamos aquí; si es rápido, lo dejamos pasar
                    return widget.isActive && _isSlowScroll(notification);
                  },
                  child: ScrollConfiguration(
                    behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
                    child: viewMode == ViewMode.list
                        ? ListView.builder(
                            controller: _scrollController,
                            physics: widget.isActive 
                                ? const AlwaysScrollableScrollPhysics()
                                : const NeverScrollableScrollPhysics(),
                            itemCount: results.length,
                            itemBuilder: (context, index) {
                              return _ResultListItem(result: results[index]);
                            },
                          )
                        : LayoutBuilder(
                            builder: (context, constraints) {
                              final cardWidth = 200.0;
                              final spacing = 12.0;
                              final availableWidth = constraints.maxWidth;
                              final columnsCount = (availableWidth / (cardWidth + spacing)).floor();
                              final actualColumns = columnsCount > 0 ? columnsCount : 1;
                              
                              return GridView.builder(
                                controller: _scrollController,
                                physics: widget.isActive 
                                    ? const AlwaysScrollableScrollPhysics()
                                    : const NeverScrollableScrollPhysics(),
                                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: actualColumns,
                                  crossAxisSpacing: spacing,
                                  mainAxisSpacing: spacing,
                                  childAspectRatio: 0.75,
                                ),
                                itemCount: results.length,
                                itemBuilder: (context, index) {
                                  return _ResultGridItem(result: results[index]);
                                },
                              );
                            },
                          ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// 2. Sección "Los más cercanos" (scroll horizontal)
class _NearestResultsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    
    // Ordenar por cercanía
    final nearestResults = List<SearchResult>.from(searchProvider.filteredResults)
      ..sort((a, b) {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance!.compareTo(b.distance!);
      });

    if (nearestResults.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Los más cercanos',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.gray900,
          ),
        ),
        const SizedBox(height: 12),
        
        // Scroll horizontal
        SizedBox(
          height: 320, // Aumentada para acomodar títulos largos
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: nearestResults.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              return SizedBox(
                width: 200,
                child: _ResultGridItem(result: nearestResults[index]),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// 3. Sección "Los más económicos" con scroll inteligente
class _CheapestSectionWithSmartScroll extends StatefulWidget {
  final Function(bool) onScrollStateChanged;
  final bool isActive;

  const _CheapestSectionWithSmartScroll({
    required this.onScrollStateChanged,
    required this.isActive,
  });

  @override
  State<_CheapestSectionWithSmartScroll> createState() => _CheapestSectionWithSmartScrollState();
}

class _CheapestSectionWithSmartScrollState extends State<_CheapestSectionWithSmartScroll> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    
    // Ordenar por precio
    final cheapestResults = List<SearchResult>.from(searchProvider.filteredResults)
      ..sort((a, b) => a.price.compareTo(b.price));

    if (cheapestResults.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Los más económicos',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.gray900,
          ),
        ),
        const SizedBox(height: 12),
        
        // Resultados con scroll vertical propio
        MouseRegion(
          onEnter: (_) => widget.onScrollStateChanged(true),
          onExit: (_) => widget.onScrollStateChanged(false),
          child: GestureDetector(
            onVerticalDragStart: (_) => widget.onScrollStateChanged(true),
            onVerticalDragEnd: (_) => widget.onScrollStateChanged(false),
            child: Container(
              height: 500,
              decoration: BoxDecoration(
                border: widget.isActive 
                    ? Border.all(color: AppTheme.primary200, width: 2)
                    : null,
                borderRadius: BorderRadius.circular(12),
              ),
              child: ScrollConfiguration(
                behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
                child: ListView.builder(
                  controller: _scrollController,
                  physics: widget.isActive 
                      ? const AlwaysScrollableScrollPhysics()
                      : const NeverScrollableScrollPhysics(),
                  itemCount: cheapestResults.length,
                  itemBuilder: (context, index) {
                    return _ResultListItem(result: cheapestResults[index]);
                  },
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
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

/// Item de resultado en modo lista (diseño de "Los más económicos")
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
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppTheme.gray200),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            children: [
              // Imagen (más pequeña para hacer la card más estrecha)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: result.hasImage
                    ? NetworkImageWidget(
                        key: ValueKey(result.imageUrl),
                        imageUrl: result.imageUrl!,
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        width: 60,
                        height: 60,
                        color: AppTheme.gray200,
                        child: Icon(Icons.image_outlined, size: 24, color: AppTheme.gray400),
                      ),
              ),
              const SizedBox(width: 12),
              
              // Información
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        height: 1.2, // Reduced line height
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${result.price.toStringAsFixed(2)} €',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary600,
                        height: 1.0, // Tight line height
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        _ShippingIndicator(isShippable: result.isShippable, size: 14),
                        const SizedBox(width: 8),
                        Icon(Icons.near_me, size: 12, color: AppTheme.gray500),
                        const SizedBox(width: 2),
                        Text(
                          result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.gray600,
                            height: 1.0, // Tight line height
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Platform icon with flag
              PlatformIconWithFlag(
                platform: result.platform,
                countryCode: result.countryCode,
                size: 32,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Item de resultado en modo cuadrícula (para "Los más cercanos")
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
    return Card(
      elevation: 2,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Imagen
            AspectRatio(
              aspectRatio: 1.0,
              child: result.hasImage
                  ? NetworkImageWidget(
                      key: ValueKey(result.imageUrl),
                      imageUrl: result.imageUrl!,
                      fit: BoxFit.cover,
                    )
                  : Container(
                      color: AppTheme.gray200,
                      child: Icon(Icons.image_outlined, size: 40, color: AppTheme.gray400),
                    ),
            ),
            
            // Información (flexible para adaptarse al contenido)
            Flexible(
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      result.title,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${result.price.toStringAsFixed(2)} €',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _ShippingIndicator(isShippable: result.isShippable, size: 12),
                        const SizedBox(width: 6),
                        Icon(Icons.near_me, size: 10, color: AppTheme.gray500),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                            style: TextStyle(fontSize: 11, color: AppTheme.gray600),
                          ),
                        ),
                        // Platform icon with flag
                        PlatformIconWithFlag(
                          platform: result.platform,
                          countryCode: result.countryCode,
                          size: 24,
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
    );
  }
}
