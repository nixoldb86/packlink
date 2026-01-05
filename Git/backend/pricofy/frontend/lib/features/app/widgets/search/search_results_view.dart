// Search Results View Widget
//
// Displays search results from the SearchProvider with:
// - Toggle between list and cards view
// - Search within results
// - Filtering and sorting controls
// - Pagination

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
import '../../../../core/models/sort_criteria.dart';
import '../../../../shared/components/images/network_image_widget.dart';
import '../../../../shared/components/loading/search_progress_indicator.dart';
import '../../../../shared/components/loading/youtube_style_progress_bar.dart';
import '../../../../shared/components/loading/animated_search_icon.dart';
import '../../../../shared/components/loading/motivational_text_rotator.dart';
import '../../../../core/utils/country_flags.dart';
import 'search_controls.dart';
import 'search_result_detail_modal.dart';
import 'search_results_map_view.dart';
import 'location_indicator.dart';
import '../modals/search_type_modal.dart';
import '../modals/registration_modal.dart';
import '../../../../config/routes.dart';

/// Widget que construye solo el header de búsqueda (para usar como stickyHeader)
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
    // Mark as editing when text differs from the last search
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
    setState(() {
      _showSearchTypeModal = false;
    });
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
    setState(() {
      _showSearchTypeModal = false;
    });
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
    setState(() {
      _showSearchTypeModal = false;
    });
    context.go('${AppRoutes.appSell}?product=${Uri.encodeComponent(_pendingSearchText)}');
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    // Sync controller with provider's search text
    if (_lastSearchText != searchProvider.searchText) {
      _lastSearchText = searchProvider.searchText;
      _searchController.text = searchProvider.searchText ?? '';
      // Reset editing state when search text changes from provider
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
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Barra de búsqueda con barra de progreso
            _buildSearchBar(context, searchProvider, l10n),

            // Motivational text - only when searching AND no results yet
            if (isSearching && !hasResults) ...[
              const SizedBox(height: 16),
              const Center(child: MotivationalTextRotator()),
            ],

            const SizedBox(height: 12),

            // Location indicator - shows where distances are calculated from
            Row(
              children: [
                const LocationIndicator(),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 8),

            // Controles (filtros, ordenar, vista)
            // Show as soon as we have any results (not waiting for all scrapers)
            if (hasResults) ...[
              const SearchControlsBar(),
              const SizedBox(height: 12),
            ],

            // Chips de filtros activos
            if (searchProvider.hasActiveFiltersOrSorting && hasResults) ...[
              _buildActiveFiltersChips(context, searchProvider, l10n),
              const SizedBox(height: 8),
            ],
          ],
        ),
        
        // Modals
        if (_showSearchTypeModal)
          SearchTypeModal(
            searchText: _pendingSearchText,
            isGuestMode: !context.read<AuthProvider>().isAuthenticated,
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
              // Redirigir a la landing para registro
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

  Widget _buildSearchBar(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    // Check if mobile (< 768px - no sidebar visible)
    final isMobile = MediaQuery.of(context).size.width < 768;
    final isSearching = searchProvider.status == SearchStatus.searching;

    return Column(
      mainAxisSize: MainAxisSize.min,
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
              // Logo on mobile only (when sidebar is hidden)
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
                width: 40,
                height: 40,
                margin: const EdgeInsets.only(right: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary600,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: AnimatedSearchIcon(
                    isSearching: isSearching,
                    isEditing: _isEditing,
                    size: 20,
                    color: Colors.white,
                  ),
                  padding: EdgeInsets.zero,
                  onPressed: () => _handleSearchSubmit(_searchController.text),
                ),
              ),
            ],
          ),
        ),
        // YouTube-style progress bar (only visible when searching)
        if (isSearching) ...[
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: YouTubeStyleProgressBar(
              progress: searchProvider.smoothedProgressPercent,
              isVisible: true,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildActiveFiltersChips(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    final filters = searchProvider.filters;
    final chips = <Widget>[];

    // Sorting chips
    for (final criteria in searchProvider.sortCriteria) {
      if (!criteria.isDefault) {
        chips.add(_buildSortChip(criteria, searchProvider, l10n));
      }
    }

    // Separator
    if (chips.isNotEmpty && (searchProvider.searchInResults.isNotEmpty || filters.hasActiveFilters)) {
      chips.add(Container(width: 1, height: 24, margin: const EdgeInsets.symmetric(horizontal: 4), color: AppTheme.gray300));
    }

    // Filter chips
    if (searchProvider.searchInResults.isNotEmpty) {
      chips.add(_buildFilterChip('"${searchProvider.searchInResults}"', () => searchProvider.setSearchInResults('')));
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      String priceText = filters.minPrice != null && filters.maxPrice != null
          ? '${filters.minPrice!.toInt()}-${filters.maxPrice!.toInt()} €'
          : filters.minPrice != null ? '> ${filters.minPrice!.toInt()} €' : '< ${filters.maxPrice!.toInt()} €';
      chips.add(_buildFilterChip(priceText, () => searchProvider.applyFilters(filters.copyWith(clearMinPrice: true, clearMaxPrice: true)), color: Colors.green));
    }

    if (filters.maxDistance != null) {
      chips.add(_buildFilterChip('< ${filters.maxDistance!.toInt()} km', () => searchProvider.applyFilters(filters.copyWith(clearMaxDistance: true)), color: Colors.blue));
    }

    if (filters.hasShipping != null) {
      final shippingLabel = filters.hasShipping! ? l10n.shippingWithShipping : l10n.shippingInPerson;
      chips.add(_buildFilterChip(shippingLabel, () => searchProvider.applyFilters(filters.copyWith(clearHasShipping: true)), color: Colors.teal));
    }

    for (final platform in filters.platforms) {
      chips.add(_buildFilterChip(platform, () {
        final newPlatforms = List<String>.from(filters.platforms)..remove(platform);
        searchProvider.applyFilters(filters.copyWith(platforms: newPlatforms));
      }));
    }

    if (chips.isNotEmpty) {
      chips.add(TextButton(
        onPressed: () {
          searchProvider.clearFilters();
          searchProvider.clearSorting();
        },
        style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8)),
        child: Text(l10n.commonClear, style: TextStyle(color: AppTheme.gray600, fontSize: 13)),
      ));
    }

    return Wrap(spacing: 8, runSpacing: 8, children: chips);
  }

  Widget _buildSortChip(SortCriteria criteria, SearchProvider searchProvider, dynamic l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primary100,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primary300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: () => searchProvider.toggleSortCriterion(criteria.field),
            child: Text(criteria.directionArrow, style: TextStyle(fontSize: 14, color: AppTheme.primary700, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 4),
          Text(criteria.getFieldLabel(l10n), style: TextStyle(fontSize: 13, color: AppTheme.primary700, fontWeight: FontWeight.w500)),
          const SizedBox(width: 4),
          InkWell(
            onTap: () => searchProvider.removeSortCriterion(criteria.field),
            child: Icon(Icons.close, size: 16, color: AppTheme.primary600),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onRemove, {Color? color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: (color ?? AppTheme.primary600).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: (color ?? AppTheme.primary600).withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: color ?? AppTheme.primary700, fontWeight: FontWeight.w500)),
          const SizedBox(width: 4),
          InkWell(onTap: onRemove, child: Icon(Icons.close, size: 16, color: color ?? AppTheme.primary600)),
        ],
      ),
    );
  }
}

/// Widget que construye el body de resultados de búsqueda
class SearchResultsBody extends StatelessWidget {
  final VoidCallback? onClearSearch;

  const SearchResultsBody({super.key, this.onClearSearch});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    // Contador de resultados - más prominente como en monolito
    Widget? resultsCount;
    if (searchProvider.status == SearchStatus.completed) {
      final total = searchProvider.totalResults;
      final hasFilters = searchProvider.filters.hasActiveFilters || searchProvider.searchInResults.isNotEmpty;
      final filtered = searchProvider.filteredResultsCount;

      resultsCount = Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 16),
        child: Row(
          children: [
            Text(
              l10n.dashboardResultsFound,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.gray900,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.primary100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                hasFilters ? '$filtered/$total' : '$total',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primary700,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (resultsCount != null) resultsCount,
        _buildContent(context, searchProvider, l10n),
      ],
    );
  }

  Widget _buildContent(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    // Show loading state when applying filters
    if (searchProvider.isApplyingFilters) {
      return _buildFilterLoadingState(l10n);
    }

    switch (searchProvider.status) {
      case SearchStatus.idle:
        return _buildEmptyState(l10n);
      case SearchStatus.searching:
        return _buildLoadingState(context, searchProvider, l10n);
      case SearchStatus.completed:
        if (searchProvider.filteredResults.isEmpty) {
          if (searchProvider.hasActiveFilters && searchProvider.results.isNotEmpty) {
            return _buildNoFilteredResultsState(searchProvider, l10n);
          }
          return _buildNoResultsState(l10n);
        }
        // Handle view mode: cards, list, or map
        switch (searchProvider.viewMode) {
          case ViewMode.cards:
            return _buildCardsView(context, searchProvider, l10n);
          case ViewMode.list:
            return _buildListView(context, searchProvider, l10n);
          case ViewMode.map:
            // Map needs explicit height since it's inside a Column/ListView
            return SizedBox(
              height: MediaQuery.of(context).size.height * 0.7,
              child: const SearchResultsMapView(),
            );
        }
      case SearchStatus.error:
        return _buildErrorState(context, searchProvider, l10n);
    }
  }

  Widget _buildFilterLoadingState(dynamic l10n) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                color: AppTheme.primary600,
                strokeWidth: 2,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              l10n.dashboardApplyingFilters,
              style: TextStyle(fontSize: 14, color: AppTheme.gray500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(dynamic l10n) {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(l10n.dashboardNoActiveSearch, style: const TextStyle(fontSize: 18, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    final progress = searchProvider.progress;
    final hasPartialResults = searchProvider.results.isNotEmpty;
    final hasScraperTasks = progress != null && progress.scraperTasks.isNotEmpty;
    final authProvider = context.watch<AuthProvider>();
    final isAdmin = authProvider.isAdmin;

    // Progress indicator with scraper chips - only visible for admin users
    Widget? progressWidget;
    if (isAdmin && progress != null && hasScraperTasks) {
      progressWidget = SearchProgressIndicator(progress: progress);
    }

    // Build the loading UI
    // Note: The search bar already shows the animated icon, progress bar,
    // and motivational text rotator - no need for additional spinners here
    return Column(
      children: [
        if (progressWidget != null) progressWidget,
        if (hasPartialResults) ...[
          const SizedBox(height: 8),
          searchProvider.viewMode == ViewMode.cards
              ? _buildCardsView(context, searchProvider, l10n)
              : _buildListView(context, searchProvider, l10n),
        ],
      ],
    );
  }

  Widget _buildNoResultsState(dynamic l10n) {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(l10n.dashboardNoResultsFound, style: const TextStyle(fontSize: 18, color: Colors.grey)),
            const SizedBox(height: 8),
            Text(l10n.dashboardTryDifferentTerms, style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }

  Widget _buildNoFilteredResultsState(SearchProvider searchProvider, dynamic l10n) {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.filter_list_off, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(l10n.dashboardNoResultsWithFilters, style: const TextStyle(fontSize: 18, color: Colors.grey)),
            const SizedBox(height: 8),
            Text(l10n.dashboardResultsAvailable(searchProvider.totalResults), style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => searchProvider.clearFilters(),
              icon: const Icon(Icons.clear),
              label: Text(l10n.searchClearFilters),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary600, foregroundColor: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    return SizedBox(
      height: 300,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 80, color: Colors.red.shade300),
            const SizedBox(height: 16),
            Text(l10n.dashboardSearchError, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(searchProvider.error ?? '', style: TextStyle(fontSize: 14, color: Colors.grey.shade700), textAlign: TextAlign.center),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                if (searchProvider.searchText != null) {
                  final userLanguage = Localizations.localeOf(context).languageCode;
                  searchProvider.startSearch(searchProvider.searchText!, userLanguage: userLanguage);
                }
              },
              icon: const Icon(Icons.refresh),
              label: Text(l10n.commonRetry),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardsView(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    // Use displayedResults for virtual pagination (not filteredResults)
    final results = searchProvider.displayedResults;
    final hasMore = searchProvider.hasMoreResults;
    final isLoadingMore = searchProvider.isLoadingMore;

    return Column(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            const double targetCardWidth = 160;
            const double spacing = 8;
            int crossAxisCount = ((constraints.maxWidth + spacing) / (targetCardWidth + spacing)).floor().clamp(2, 8);
            final double cardWidth = (constraints.maxWidth - (spacing * (crossAxisCount - 1))) / crossAxisCount;
            final double cardHeight = cardWidth + 70;

            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: spacing,
                mainAxisSpacing: spacing,
                childAspectRatio: cardWidth / cardHeight,
              ),
              itemCount: results.length,
              itemBuilder: (context, index) => _ResultCard(key: ValueKey(results[index].id), result: results[index]),
            );
          },
        ),
        if (hasMore) _buildLoadMoreIndicator(isLoadingMore, l10n),
        const SizedBox(height: 80),
      ],
    );
  }

  Widget _buildListView(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    // Use displayedResults for virtual pagination (not filteredResults)
    final results = searchProvider.displayedResults;
    final hasMore = searchProvider.hasMoreResults;
    final isLoadingMore = searchProvider.isLoadingMore;

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 80),
      itemCount: results.length + (hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == results.length) return _buildLoadMoreIndicator(isLoadingMore, l10n);
        return _ResultListItem(key: ValueKey(results[index].id), result: results[index]);
      },
    );
  }

  Widget _buildLoadMoreIndicator(bool isLoading, dynamic l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      alignment: Alignment.center,
      child: isLoading
          ? Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary600)),
                const SizedBox(width: 12),
                Text(l10n.commonLoadingMore, style: TextStyle(color: AppTheme.gray500)),
              ],
            )
          : Text(l10n.dashboardScrollToLoadMore, style: TextStyle(color: AppTheme.gray400)),
    );
  }
}

/// Card individual de resultado (grid view)
class _ResultCard extends StatelessWidget {
  final SearchResult result;
  const _ResultCard({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: AppTheme.gray200)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _showDetailModal(context),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 1.0, // Proporción 1:1 (cuadrada) para todas las imágenes
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: result.hasImage
                      ? IgnorePointer(child: NetworkImageWidget(imageUrl: result.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, __) => _buildPlaceholder()))
                      : _buildPlaceholder(),
                ),
              ),
              const SizedBox(height: 6),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(result.title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.gray900), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ),
                  const SizedBox(width: 6),
                  _buildPlatformIcon(result.platform),
                ],
              ),
              // Optional badges row (condition, brand, size)
              if (result.hasCondition || result.hasBrand || result.hasSize) ...[
                const SizedBox(height: 3),
                Wrap(
                  spacing: 3,
                  runSpacing: 2,
                  children: [
                    if (result.hasCondition) _buildBadge(result.conditionDisplayName, _getConditionColor(result.condition!)),
                    if (result.hasBrand) _buildBadge(result.brand!, AppTheme.primary600),
                    if (result.hasSize) _buildBadge(result.size!, Colors.purple),
                  ],
                ),
              ],
              const SizedBox(height: 2),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(result.formattedPrice, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primary600)),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (result.isShippable) ...[
                        Icon(Icons.local_shipping_outlined, size: 12, color: AppTheme.gray400),
                        const SizedBox(width: 4),
                      ],
                      if (result.countryCode != null && result.countryCode!.isNotEmpty) ...[
                        Text(getCountryFlagEmoji(result.countryCode), style: const TextStyle(fontSize: 12)),
                        const SizedBox(width: 4),
                      ],
                      if (result.distance != null) ...[
                        Icon(Icons.near_me, size: 10, color: AppTheme.gray400),
                        const SizedBox(width: 1),
                        Text('${result.distance!.toStringAsFixed(0)}km', style: TextStyle(fontSize: 10, color: AppTheme.gray400)),
                      ],
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 0.5),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 8, fontWeight: FontWeight.w500, color: color),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'new':
        return Colors.green;
      case 'like_new':
        return Colors.teal;
      case 'good':
        return Colors.blue;
      case 'used':
        return Colors.orange;
      case 'acceptable':
        return Colors.red;
      default:
        return AppTheme.gray500;
    }
  }

  void _showDetailModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  Widget _buildPlaceholder() => Container(
        width: double.infinity,
        height: double.infinity,
        color: AppTheme.gray100,
        child: Icon(Icons.image_outlined, size: 40, color: AppTheme.gray400),
      );

  Widget _buildPlatformIcon(String platform) {
    final lower = platform.toLowerCase();
    if (lower == 'wallapop' || lower == 'milanuncios' || lower == 'vinted' || lower == 'backmarket' || lower == 'ebay' || lower == 'leboncoin') {
      return SizedBox(
        height: 20,
        width: 20,
        child: Image.asset('assets/images/platforms/$lower.png', fit: BoxFit.contain, errorBuilder: (_, __, ___) => _buildPlatformFallback(platform)),
      );
    }
    return _buildPlatformFallback(platform);
  }

  Widget _buildPlatformFallback(String platform) {
    final color = AppTheme.platformColor(platform);
    final short = platform.length >= 2 ? platform.substring(0, 2).toUpperCase() : platform.toUpperCase();
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
      child: Center(child: Text(short, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: color))),
    );
  }
}

/// Item individual de resultado (list view)
class _ResultListItem extends StatelessWidget {
  final SearchResult result;
  const _ResultListItem({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              result.hasImage
                  ? IgnorePointer(child: NetworkImageWidget(imageUrl: result.imageUrl!, width: 60, height: 60, fit: BoxFit.cover, borderRadius: BorderRadius.circular(6), errorBuilder: (_, __) => _buildPlaceholder()))
                  : ClipRRect(borderRadius: BorderRadius.circular(6), child: _buildPlaceholder()),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(result.title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.gray900), maxLines: 1, overflow: TextOverflow.ellipsis),
                    // Optional badges row (condition, brand, size)
                    if (result.hasCondition || result.hasBrand || result.hasSize) ...[
                      const SizedBox(height: 3),
                      Wrap(
                        spacing: 4,
                        runSpacing: 2,
                        children: [
                          if (result.hasCondition) _buildBadge(result.conditionDisplayName, _getConditionColor(result.condition!)),
                          if (result.hasBrand) _buildBadge(result.brand!, AppTheme.primary600),
                          if (result.hasSize) _buildBadge(result.size!, Colors.purple),
                        ],
                      ),
                    ],
                    if (result.location != null || result.countryCode != null || result.isShippable) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          if (result.isShippable) ...[
                            Icon(Icons.local_shipping_outlined, size: 12, color: AppTheme.gray400),
                            const SizedBox(width: 4),
                          ],
                          if (result.countryCode != null && result.countryCode!.isNotEmpty) ...[
                            Text(getCountryFlagEmoji(result.countryCode), style: const TextStyle(fontSize: 12)),
                            const SizedBox(width: 4),
                          ],
                          if (result.location != null) ...[
                            Icon(Icons.location_on, size: 12, color: AppTheme.gray400),
                            const SizedBox(width: 2),
                            Flexible(child: Text(result.location!, style: TextStyle(fontSize: 12, color: AppTheme.gray500), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          ],
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(result.formattedPrice, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primary600)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: AppTheme.platformColor(result.platform).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                    child: Text(result.platformDisplayName, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppTheme.platformColor(result.platform))),
                  ),
                ],
              ),
              const SizedBox(width: 8),
              Icon(Icons.chevron_right, color: AppTheme.gray400, size: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 0.5),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: color),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'new':
        return Colors.green;
      case 'like_new':
        return Colors.teal;
      case 'good':
        return Colors.blue;
      case 'used':
        return Colors.orange;
      case 'acceptable':
        return Colors.red;
      default:
        return AppTheme.gray500;
    }
  }

  void _showDetailModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  Widget _buildPlaceholder() => Container(width: 60, height: 60, color: AppTheme.gray100, child: Icon(Icons.image_outlined, size: 24, color: AppTheme.gray400));
}

/// Widget legacy que combina header y body (para compatibilidad)
class SearchResultsView extends StatelessWidget {
  final VoidCallback? onClearSearch;

  const SearchResultsView({super.key, this.onClearSearch});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SearchResultsHeader(),
        SearchResultsBody(onClearSearch: onClearSearch),
      ],
    );
  }
}
