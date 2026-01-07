import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_it.dart';
import 'app_localizations_pt.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('de'),
    Locale('en'),
    Locale('es'),
    Locale('fr'),
    Locale('it'),
    Locale('pt')
  ];

  /// No description provided for @navbarFeatures.
  ///
  /// In en, this message translates to:
  /// **'Features'**
  String get navbarFeatures;

  /// No description provided for @navbarPricing.
  ///
  /// In en, this message translates to:
  /// **'Pricing'**
  String get navbarPricing;

  /// No description provided for @navbarContact.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get navbarContact;

  /// No description provided for @navbarStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get navbarStart;

  /// No description provided for @heroTitle.
  ///
  /// In en, this message translates to:
  /// **'Optimize Your Prices with'**
  String get heroTitle;

  /// No description provided for @heroTitleHighlight.
  ///
  /// In en, this message translates to:
  /// **'Artificial Intelligence'**
  String get heroTitleHighlight;

  /// No description provided for @heroTitleLine1.
  ///
  /// In en, this message translates to:
  /// **'The Universe of'**
  String get heroTitleLine1;

  /// No description provided for @heroTitleLine2.
  ///
  /// In en, this message translates to:
  /// **'second-hand, in one click'**
  String get heroTitleLine2;

  /// No description provided for @heroDescription.
  ///
  /// In en, this message translates to:
  /// **'We automatically expand your search from your local environment to platforms worldwide, connecting buyers and sellers globally.'**
  String get heroDescription;

  /// No description provided for @heroSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search second-hand products...'**
  String get heroSearchPlaceholder;

  /// No description provided for @heroSearchButton.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get heroSearchButton;

  /// No description provided for @heroStartFree.
  ///
  /// In en, this message translates to:
  /// **'Create Free Account'**
  String get heroStartFree;

  /// No description provided for @heroViewDemo.
  ///
  /// In en, this message translates to:
  /// **'View Demo'**
  String get heroViewDemo;

  /// No description provided for @homeHeroTitle.
  ///
  /// In en, this message translates to:
  /// **'The Second-hand Universe, in one click'**
  String get homeHeroTitle;

  /// No description provided for @homeHeroSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sell faster. Buy smarter. We analyze thousands of listings and tell you the ideal price based on the real market.'**
  String get homeHeroSubtitle;

  /// No description provided for @homeHeroCta.
  ///
  /// In en, this message translates to:
  /// **'Create Free Account'**
  String get homeHeroCta;

  /// No description provided for @homeHeroSecondaryCta.
  ///
  /// In en, this message translates to:
  /// **'See features'**
  String get homeHeroSecondaryCta;

  /// No description provided for @homeSearchTypesTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose your search type'**
  String get homeSearchTypesTitle;

  /// No description provided for @homeSearchTypeTag1.
  ///
  /// In en, this message translates to:
  /// **'Fast'**
  String get homeSearchTypeTag1;

  /// No description provided for @homeSearchType1Title.
  ///
  /// In en, this message translates to:
  /// **'Classic search'**
  String get homeSearchType1Title;

  /// No description provided for @homeSearchType1Bullet1.
  ///
  /// In en, this message translates to:
  /// **'Simultaneous search across national and international second-hand platforms'**
  String get homeSearchType1Bullet1;

  /// No description provided for @homeSearchType1Bullet2.
  ///
  /// In en, this message translates to:
  /// **'Aggregated results'**
  String get homeSearchType1Bullet2;

  /// No description provided for @homeSearchType1Bullet3.
  ///
  /// In en, this message translates to:
  /// **'Filters on found listings'**
  String get homeSearchType1Bullet3;

  /// No description provided for @homeSearchType1Cta.
  ///
  /// In en, this message translates to:
  /// **'Use classic search'**
  String get homeSearchType1Cta;

  /// No description provided for @homeSearchTypeTag2.
  ///
  /// In en, this message translates to:
  /// **'More precise'**
  String get homeSearchTypeTag2;

  /// No description provided for @homeSearchType2Title.
  ///
  /// In en, this message translates to:
  /// **'Advanced search (AI)'**
  String get homeSearchType2Title;

  /// No description provided for @homeSearchType2Bullet1.
  ///
  /// In en, this message translates to:
  /// **'We apply AI to show you only relevant listings'**
  String get homeSearchType2Bullet1;

  /// No description provided for @homeSearchType2Bullet2.
  ///
  /// In en, this message translates to:
  /// **'Filters accessories and related but different products'**
  String get homeSearchType2Bullet2;

  /// No description provided for @homeSearchType2Bullet3.
  ///
  /// In en, this message translates to:
  /// **'Optimized and refined results'**
  String get homeSearchType2Bullet3;

  /// No description provided for @homeSearchType2Cta.
  ///
  /// In en, this message translates to:
  /// **'Use advanced search'**
  String get homeSearchType2Cta;

  /// No description provided for @homeSearchTypeTag3.
  ///
  /// In en, this message translates to:
  /// **'For selling'**
  String get homeSearchTypeTag3;

  /// No description provided for @homeSearchType3Title.
  ///
  /// In en, this message translates to:
  /// **'Market analysis'**
  String get homeSearchType3Title;

  /// No description provided for @homeSearchType3Bullet1.
  ///
  /// In en, this message translates to:
  /// **'National and international market analysis'**
  String get homeSearchType3Bullet1;

  /// No description provided for @homeSearchType3Bullet2.
  ///
  /// In en, this message translates to:
  /// **'Demand metrics by price, platform and country'**
  String get homeSearchType3Bullet2;

  /// No description provided for @homeSearchType3Bullet3.
  ///
  /// In en, this message translates to:
  /// **'Optimal selling price estimation'**
  String get homeSearchType3Bullet3;

  /// No description provided for @homeSearchType3Cta.
  ///
  /// In en, this message translates to:
  /// **'Analyze my product'**
  String get homeSearchType3Cta;

  /// No description provided for @homeMiniBenefit1.
  ///
  /// In en, this message translates to:
  /// **'Global market in a single search'**
  String get homeMiniBenefit1;

  /// No description provided for @homeMiniBenefit2.
  ///
  /// In en, this message translates to:
  /// **'Clean results thanks to AI'**
  String get homeMiniBenefit2;

  /// No description provided for @homeMiniBenefit3.
  ///
  /// In en, this message translates to:
  /// **'Ideal price based on real market'**
  String get homeMiniBenefit3;

  /// No description provided for @homeFinalCtaTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to get started?'**
  String get homeFinalCtaTitle;

  /// No description provided for @homeFinalCtaSecondary.
  ///
  /// In en, this message translates to:
  /// **'Talk to Sales'**
  String get homeFinalCtaSecondary;

  /// No description provided for @useCasesTitle.
  ///
  /// In en, this message translates to:
  /// **'Two ways to use Pricofy'**
  String get useCasesTitle;

  /// No description provided for @useCasesSellTitle.
  ///
  /// In en, this message translates to:
  /// **'If you want to sell'**
  String get useCasesSellTitle;

  /// No description provided for @useCasesSellDescription.
  ///
  /// In en, this message translates to:
  /// **'Don\'t know what price to sell at? We calculate ideal, fast and minimum price based on real listings in your area.'**
  String get useCasesSellDescription;

  /// No description provided for @useCasesSellStep1.
  ///
  /// In en, this message translates to:
  /// **'Upload photos and details.'**
  String get useCasesSellStep1;

  /// No description provided for @useCasesSellStep2.
  ///
  /// In en, this message translates to:
  /// **'Report with recommended price and ideal platforms.'**
  String get useCasesSellStep2;

  /// No description provided for @useCasesSellStep3.
  ///
  /// In en, this message translates to:
  /// **'Publish with confidence.'**
  String get useCasesSellStep3;

  /// No description provided for @useCasesSellButton.
  ///
  /// In en, this message translates to:
  /// **'Value my product'**
  String get useCasesSellButton;

  /// No description provided for @useCasesBuyTitle.
  ///
  /// In en, this message translates to:
  /// **'If you want to buy'**
  String get useCasesBuyTitle;

  /// No description provided for @useCasesBuyDescription.
  ///
  /// In en, this message translates to:
  /// **'We search for you the best available price according to condition and desired filters.'**
  String get useCasesBuyDescription;

  /// No description provided for @useCasesBuyStep1.
  ///
  /// In en, this message translates to:
  /// **'Tell us what you\'re looking for and in what condition.'**
  String get useCasesBuyStep1;

  /// No description provided for @useCasesBuyStep2.
  ///
  /// In en, this message translates to:
  /// **'We compare trusted platforms.'**
  String get useCasesBuyStep2;

  /// No description provided for @useCasesBuyStep3.
  ///
  /// In en, this message translates to:
  /// **'We send you the link with the lowest price.'**
  String get useCasesBuyStep3;

  /// No description provided for @useCasesBuyButton.
  ///
  /// In en, this message translates to:
  /// **'Search product'**
  String get useCasesBuyButton;

  /// No description provided for @featuresTitle.
  ///
  /// In en, this message translates to:
  /// **'Main Features'**
  String get featuresTitle;

  /// No description provided for @featuresSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Everything you need to optimize your prices'**
  String get featuresSubtitle;

  /// No description provided for @featuresAiTitle.
  ///
  /// In en, this message translates to:
  /// **'Advanced AI'**
  String get featuresAiTitle;

  /// No description provided for @featuresAiDescription.
  ///
  /// In en, this message translates to:
  /// **'Machine learning algorithms that analyze thousands of data points to give you the optimal price.'**
  String get featuresAiDescription;

  /// No description provided for @featuresRealTimeTitle.
  ///
  /// In en, this message translates to:
  /// **'Real Time'**
  String get featuresRealTimeTitle;

  /// No description provided for @featuresRealTimeDescription.
  ///
  /// In en, this message translates to:
  /// **'Constant market price updates to keep you always competitive.'**
  String get featuresRealTimeDescription;

  /// No description provided for @featuresAnalyticsTitle.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get featuresAnalyticsTitle;

  /// No description provided for @featuresAnalyticsDescription.
  ///
  /// In en, this message translates to:
  /// **'Detailed dashboards with key metrics to make better decisions.'**
  String get featuresAnalyticsDescription;

  /// No description provided for @featuresSecurityTitle.
  ///
  /// In en, this message translates to:
  /// **'Secure'**
  String get featuresSecurityTitle;

  /// No description provided for @featuresSecurityDescription.
  ///
  /// In en, this message translates to:
  /// **'Your data is protected with enterprise-level encryption.'**
  String get featuresSecurityDescription;

  /// No description provided for @featuresPageTitle.
  ///
  /// In en, this message translates to:
  /// **'Pricofy Features'**
  String get featuresPageTitle;

  /// No description provided for @featuresPageSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Discover how Pricofy helps you buy better and sell faster'**
  String get featuresPageSubtitle;

  /// No description provided for @featuresProblemBadge.
  ///
  /// In en, this message translates to:
  /// **'The Real Problem'**
  String get featuresProblemBadge;

  /// No description provided for @featuresProblemTitle.
  ///
  /// In en, this message translates to:
  /// **'The second-hand market is fragmented'**
  String get featuresProblemTitle;

  /// No description provided for @featuresProblem1Title.
  ///
  /// In en, this message translates to:
  /// **'Geographically limited search'**
  String get featuresProblem1Title;

  /// No description provided for @featuresProblem1Desc.
  ///
  /// In en, this message translates to:
  /// **'You only search on platforms in your area, missing opportunities where the product could be cheaper or in better condition.'**
  String get featuresProblem1Desc;

  /// No description provided for @featuresProblem1Stat.
  ///
  /// In en, this message translates to:
  /// **'of buyers willing to buy with shipping'**
  String get featuresProblem1Stat;

  /// No description provided for @featuresProblem2Title.
  ///
  /// In en, this message translates to:
  /// **'Irrelevant results'**
  String get featuresProblem2Title;

  /// No description provided for @featuresProblem2Desc.
  ///
  /// In en, this message translates to:
  /// **'You waste time filtering accessories and products that aren\'t what you\'re looking for. Searches return noise.'**
  String get featuresProblem2Desc;

  /// No description provided for @featuresProblem2Stat.
  ///
  /// In en, this message translates to:
  /// **'of sellers willing to ship'**
  String get featuresProblem2Stat;

  /// No description provided for @featuresProblem3Title.
  ///
  /// In en, this message translates to:
  /// **'Lack of demand knowledge'**
  String get featuresProblem3Title;

  /// No description provided for @featuresProblem3Desc.
  ///
  /// In en, this message translates to:
  /// **'You don\'t know the real market price or how much demand there is. You sell blind or buy without reference.'**
  String get featuresProblem3Desc;

  /// No description provided for @featuresProblem3Stat.
  ///
  /// In en, this message translates to:
  /// **'fewer pricing errors with real data'**
  String get featuresProblem3Stat;

  /// No description provided for @featuresSolutionBadge.
  ///
  /// In en, this message translates to:
  /// **'The Pricofy Solution'**
  String get featuresSolutionBadge;

  /// No description provided for @featuresSolutionTitle.
  ///
  /// In en, this message translates to:
  /// **'4 pillars that transform your experience'**
  String get featuresSolutionTitle;

  /// No description provided for @featuresSolution1Title.
  ///
  /// In en, this message translates to:
  /// **'Automatic global search'**
  String get featuresSolution1Title;

  /// No description provided for @featuresSolution1Desc.
  ///
  /// In en, this message translates to:
  /// **'We expand your search to platforms worldwide with a single click.'**
  String get featuresSolution1Desc;

  /// No description provided for @featuresSolution2Title.
  ///
  /// In en, this message translates to:
  /// **'Smart filtering with AI'**
  String get featuresSolution2Title;

  /// No description provided for @featuresSolution2Desc.
  ///
  /// In en, this message translates to:
  /// **'We eliminate accessories and irrelevant results. You only see what you\'re really looking for.'**
  String get featuresSolution2Desc;

  /// No description provided for @featuresSolution3Title.
  ///
  /// In en, this message translates to:
  /// **'Democratization of access'**
  String get featuresSolution3Title;

  /// No description provided for @featuresSolution3Desc.
  ///
  /// In en, this message translates to:
  /// **'Market information that only professionals had before, now for everyone.'**
  String get featuresSolution3Desc;

  /// No description provided for @featuresSolution4Title.
  ///
  /// In en, this message translates to:
  /// **'Global connection'**
  String get featuresSolution4Title;

  /// No description provided for @featuresSolution4Desc.
  ///
  /// In en, this message translates to:
  /// **'We connect buyers and sellers from different countries, breaking barriers.'**
  String get featuresSolution4Desc;

  /// No description provided for @featuresFlowsTitle.
  ///
  /// In en, this message translates to:
  /// **'Use flows'**
  String get featuresFlowsTitle;

  /// No description provided for @featuresFlowBuyerTitle.
  ///
  /// In en, this message translates to:
  /// **'For Buyers'**
  String get featuresFlowBuyerTitle;

  /// No description provided for @featuresFlowBuyer1.
  ///
  /// In en, this message translates to:
  /// **'Describe what product you\'re looking for and in what condition'**
  String get featuresFlowBuyer1;

  /// No description provided for @featuresFlowBuyer2.
  ///
  /// In en, this message translates to:
  /// **'Pricofy searches across multiple platforms and countries'**
  String get featuresFlowBuyer2;

  /// No description provided for @featuresFlowBuyer3.
  ///
  /// In en, this message translates to:
  /// **'We filter with AI to show you only what\'s relevant'**
  String get featuresFlowBuyer3;

  /// No description provided for @featuresFlowBuyer4.
  ///
  /// In en, this message translates to:
  /// **'Find the best price and buy with confidence'**
  String get featuresFlowBuyer4;

  /// No description provided for @featuresFlowSellerTitle.
  ///
  /// In en, this message translates to:
  /// **'For Sellers'**
  String get featuresFlowSellerTitle;

  /// No description provided for @featuresFlowSeller1.
  ///
  /// In en, this message translates to:
  /// **'Upload photos and details of your product'**
  String get featuresFlowSeller1;

  /// No description provided for @featuresFlowSeller2.
  ///
  /// In en, this message translates to:
  /// **'We analyze the national and international market'**
  String get featuresFlowSeller2;

  /// No description provided for @featuresFlowSeller3.
  ///
  /// In en, this message translates to:
  /// **'Receive ideal, fast, and minimum recommended price'**
  String get featuresFlowSeller3;

  /// No description provided for @featuresFlowSeller4.
  ///
  /// In en, this message translates to:
  /// **'Publish on the ideal platforms for your product'**
  String get featuresFlowSeller4;

  /// No description provided for @featuresFlowSeller5.
  ///
  /// In en, this message translates to:
  /// **'Monitor and adjust as the market changes'**
  String get featuresFlowSeller5;

  /// No description provided for @featuresCompareTitle.
  ///
  /// In en, this message translates to:
  /// **'Pricofy vs. doing it manually'**
  String get featuresCompareTitle;

  /// No description provided for @featuresCompareManualHeader.
  ///
  /// In en, this message translates to:
  /// **'Doing it manually'**
  String get featuresCompareManualHeader;

  /// No description provided for @featuresComparePricofyHeader.
  ///
  /// In en, this message translates to:
  /// **'With Pricofy'**
  String get featuresComparePricofyHeader;

  /// No description provided for @featuresCompare1Feature.
  ///
  /// In en, this message translates to:
  /// **'Multi-platform/multi-country search'**
  String get featuresCompare1Feature;

  /// No description provided for @featuresCompare1Manual.
  ///
  /// In en, this message translates to:
  /// **'Open apps one by one, repeat search and filters on each platform/country'**
  String get featuresCompare1Manual;

  /// No description provided for @featuresCompare1Pricofy.
  ///
  /// In en, this message translates to:
  /// **'One search expands to multiple countries/platforms'**
  String get featuresCompare1Pricofy;

  /// No description provided for @featuresCompare2Feature.
  ///
  /// In en, this message translates to:
  /// **'Noise (accessories/irrelevants)'**
  String get featuresCompare2Feature;

  /// No description provided for @featuresCompare2Manual.
  ///
  /// In en, this message translates to:
  /// **'You deal with irrelevant results and waste time filtering'**
  String get featuresCompare2Manual;

  /// No description provided for @featuresCompare2Pricofy.
  ///
  /// In en, this message translates to:
  /// **'AI cleans results and removes accessories/unrelated items'**
  String get featuresCompare2Pricofy;

  /// No description provided for @featuresCompare3Feature.
  ///
  /// In en, this message translates to:
  /// **'Consolidated results'**
  String get featuresCompare3Feature;

  /// No description provided for @featuresCompare3Manual.
  ///
  /// In en, this message translates to:
  /// **'Separate lists, hard to compare'**
  String get featuresCompare3Manual;

  /// No description provided for @featuresCompare3Pricofy.
  ///
  /// In en, this message translates to:
  /// **'Consolidated list sorted by price/relevance with complete info'**
  String get featuresCompare3Pricofy;

  /// No description provided for @featuresCompare4Feature.
  ///
  /// In en, this message translates to:
  /// **'Discover ideal selling price'**
  String get featuresCompare4Feature;

  /// No description provided for @featuresCompare4Manual.
  ///
  /// In en, this message translates to:
  /// **'Rough estimate looking at scattered listings'**
  String get featuresCompare4Manual;

  /// No description provided for @featuresCompare4Pricofy.
  ///
  /// In en, this message translates to:
  /// **'Recommendation based on real listings (ideal/fast/minimum price)'**
  String get featuresCompare4Pricofy;

  /// No description provided for @featuresCompare5Feature.
  ///
  /// In en, this message translates to:
  /// **'Understand demand'**
  String get featuresCompare5Feature;

  /// No description provided for @featuresCompare5Manual.
  ///
  /// In en, this message translates to:
  /// **'No clear metrics by country/platform/price'**
  String get featuresCompare5Manual;

  /// No description provided for @featuresCompare5Pricofy.
  ///
  /// In en, this message translates to:
  /// **'Market analysis with demand metrics by price, platform and country'**
  String get featuresCompare5Pricofy;

  /// No description provided for @featuresCompare6Feature.
  ///
  /// In en, this message translates to:
  /// **'Monitoring and alerts'**
  String get featuresCompare6Feature;

  /// No description provided for @featuresCompare6Manual.
  ///
  /// In en, this message translates to:
  /// **'Check every day manually'**
  String get featuresCompare6Manual;

  /// No description provided for @featuresCompare6Pricofy.
  ///
  /// In en, this message translates to:
  /// **'Alerts when market changes or new listings appear'**
  String get featuresCompare6Pricofy;

  /// No description provided for @featuresCompareConclusion.
  ///
  /// In en, this message translates to:
  /// **'Manual is possible, but scales poorly. Pricofy reduces friction and gives you quick decisions with real data.'**
  String get featuresCompareConclusion;

  /// No description provided for @featuresCtaTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to transform your experience?'**
  String get featuresCtaTitle;

  /// No description provided for @featuresCtaButton.
  ///
  /// In en, this message translates to:
  /// **'Create Free Account'**
  String get featuresCtaButton;

  /// No description provided for @featuresCtaSecondary.
  ///
  /// In en, this message translates to:
  /// **'View pricing'**
  String get featuresCtaSecondary;

  /// No description provided for @pricingTitle.
  ///
  /// In en, this message translates to:
  /// **'Plans and Pricing'**
  String get pricingTitle;

  /// No description provided for @pricingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose the perfect plan for your needs'**
  String get pricingSubtitle;

  /// No description provided for @pricingDescription.
  ///
  /// In en, this message translates to:
  /// **'From occasional users to market professionals, we have a plan for you.'**
  String get pricingDescription;

  /// No description provided for @pricingFreePlan.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get pricingFreePlan;

  /// No description provided for @pricingFreePrice.
  ///
  /// In en, this message translates to:
  /// **'0€'**
  String get pricingFreePrice;

  /// No description provided for @pricingFreeDescription.
  ///
  /// In en, this message translates to:
  /// **'To get started'**
  String get pricingFreeDescription;

  /// No description provided for @pricingFreeFeature1.
  ///
  /// In en, this message translates to:
  /// **'1 free evaluation'**
  String get pricingFreeFeature1;

  /// No description provided for @pricingFreeFeature2.
  ///
  /// In en, this message translates to:
  /// **'Basic access'**
  String get pricingFreeFeature2;

  /// No description provided for @pricingFreeFeature3.
  ///
  /// In en, this message translates to:
  /// **'Email support'**
  String get pricingFreeFeature3;

  /// No description provided for @pricingFreeButton.
  ///
  /// In en, this message translates to:
  /// **'Get started'**
  String get pricingFreeButton;

  /// No description provided for @pricingFreemiumName.
  ///
  /// In en, this message translates to:
  /// **'Freemium'**
  String get pricingFreemiumName;

  /// No description provided for @pricingFreemiumPrice.
  ///
  /// In en, this message translates to:
  /// **'0'**
  String get pricingFreemiumPrice;

  /// No description provided for @pricingFreemiumPriceUnit.
  ///
  /// In en, this message translates to:
  /// **'€/month'**
  String get pricingFreemiumPriceUnit;

  /// No description provided for @pricingFreemiumDescription.
  ///
  /// In en, this message translates to:
  /// **'Very occasional searches'**
  String get pricingFreemiumDescription;

  /// No description provided for @pricingFreemiumFeaturesEvaluations.
  ///
  /// In en, this message translates to:
  /// **'1 evaluation per day'**
  String get pricingFreemiumFeaturesEvaluations;

  /// No description provided for @pricingFreemiumFeaturesSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Title and description suggestions'**
  String get pricingFreemiumFeaturesSuggestions;

  /// No description provided for @pricingFreemiumFeaturesSellBuy.
  ///
  /// In en, this message translates to:
  /// **'Option to sell and buy'**
  String get pricingFreemiumFeaturesSellBuy;

  /// No description provided for @pricingFreemiumFeaturesEmailReports.
  ///
  /// In en, this message translates to:
  /// **'Email reports'**
  String get pricingFreemiumFeaturesEmailReports;

  /// No description provided for @pricingFreemiumButton.
  ///
  /// In en, this message translates to:
  /// **'Start Free'**
  String get pricingFreemiumButton;

  /// No description provided for @pricingHobbyName.
  ///
  /// In en, this message translates to:
  /// **'Hobby'**
  String get pricingHobbyName;

  /// No description provided for @pricingHobbyPrice.
  ///
  /// In en, this message translates to:
  /// **'5.9'**
  String get pricingHobbyPrice;

  /// No description provided for @pricingHobbyPriceUnit.
  ///
  /// In en, this message translates to:
  /// **'€/month'**
  String get pricingHobbyPriceUnit;

  /// No description provided for @pricingHobbyDescription.
  ///
  /// In en, this message translates to:
  /// **'Recurrent searches'**
  String get pricingHobbyDescription;

  /// No description provided for @pricingHobbyFeaturesEvaluations.
  ///
  /// In en, this message translates to:
  /// **'100 evaluations per month'**
  String get pricingHobbyFeaturesEvaluations;

  /// No description provided for @pricingHobbyFeaturesSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Title and description suggestions'**
  String get pricingHobbyFeaturesSuggestions;

  /// No description provided for @pricingHobbyFeaturesSellBuy.
  ///
  /// In en, this message translates to:
  /// **'Option to sell and buy'**
  String get pricingHobbyFeaturesSellBuy;

  /// No description provided for @pricingHobbyFeaturesEmailReports.
  ///
  /// In en, this message translates to:
  /// **'Email reports'**
  String get pricingHobbyFeaturesEmailReports;

  /// No description provided for @pricingHobbyFeaturesDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get pricingHobbyFeaturesDashboard;

  /// No description provided for @pricingHobbyFeaturesAlerts.
  ///
  /// In en, this message translates to:
  /// **'Personalized market alerts'**
  String get pricingHobbyFeaturesAlerts;

  /// No description provided for @pricingHobbyButton.
  ///
  /// In en, this message translates to:
  /// **'Start with Hobby'**
  String get pricingHobbyButton;

  /// No description provided for @pricingProPlan.
  ///
  /// In en, this message translates to:
  /// **'Pro'**
  String get pricingProPlan;

  /// No description provided for @pricingProPrice.
  ///
  /// In en, this message translates to:
  /// **'9.99€/month'**
  String get pricingProPrice;

  /// No description provided for @pricingProDescription.
  ///
  /// In en, this message translates to:
  /// **'For professionals'**
  String get pricingProDescription;

  /// No description provided for @pricingProFeature1.
  ///
  /// In en, this message translates to:
  /// **'Unlimited evaluations'**
  String get pricingProFeature1;

  /// No description provided for @pricingProFeature2.
  ///
  /// In en, this message translates to:
  /// **'Advanced dashboard'**
  String get pricingProFeature2;

  /// No description provided for @pricingProFeature3.
  ///
  /// In en, this message translates to:
  /// **'Email reports'**
  String get pricingProFeature3;

  /// No description provided for @pricingProFeature4.
  ///
  /// In en, this message translates to:
  /// **'Priority support'**
  String get pricingProFeature4;

  /// No description provided for @pricingProButton.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get pricingProButton;

  /// No description provided for @pricingEnterprisePlan.
  ///
  /// In en, this message translates to:
  /// **'Enterprise'**
  String get pricingEnterprisePlan;

  /// No description provided for @pricingEnterprisePrice.
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get pricingEnterprisePrice;

  /// No description provided for @pricingEnterpriseDescription.
  ///
  /// In en, this message translates to:
  /// **'Custom solution for enterprises'**
  String get pricingEnterpriseDescription;

  /// No description provided for @pricingEnterpriseFeature1.
  ///
  /// In en, this message translates to:
  /// **'Unlimited evaluations'**
  String get pricingEnterpriseFeature1;

  /// No description provided for @pricingEnterpriseFeature2.
  ///
  /// In en, this message translates to:
  /// **'Dedicated API'**
  String get pricingEnterpriseFeature2;

  /// No description provided for @pricingEnterpriseFeature3.
  ///
  /// In en, this message translates to:
  /// **'24/7 priority support'**
  String get pricingEnterpriseFeature3;

  /// No description provided for @pricingEnterpriseFeature4.
  ///
  /// In en, this message translates to:
  /// **'Custom integration'**
  String get pricingEnterpriseFeature4;

  /// No description provided for @pricingEnterpriseButton.
  ///
  /// In en, this message translates to:
  /// **'Contact sales'**
  String get pricingEnterpriseButton;

  /// No description provided for @pricingFaqTitle.
  ///
  /// In en, this message translates to:
  /// **'Frequently Asked Questions'**
  String get pricingFaqTitle;

  /// No description provided for @pricingFaqQuestion1.
  ///
  /// In en, this message translates to:
  /// **'Can I change plans at any time?'**
  String get pricingFaqQuestion1;

  /// No description provided for @pricingFaqAnswer1.
  ///
  /// In en, this message translates to:
  /// **'Yes, you can upgrade or change your plan at any time from your account.'**
  String get pricingFaqAnswer1;

  /// No description provided for @pricingFaqQuestion2.
  ///
  /// In en, this message translates to:
  /// **'What happens if I exceed the evaluation limit?'**
  String get pricingFaqQuestion2;

  /// No description provided for @pricingFaqAnswer2.
  ///
  /// In en, this message translates to:
  /// **'We will notify you when you approach the limit and you can upgrade your plan or wait until the next month.'**
  String get pricingFaqAnswer2;

  /// No description provided for @pricingFaqQuestion3.
  ///
  /// In en, this message translates to:
  /// **'Do plans include support?'**
  String get pricingFaqQuestion3;

  /// No description provided for @pricingFaqAnswer3.
  ///
  /// In en, this message translates to:
  /// **'All plans include support. The Pro plan includes priority support.'**
  String get pricingFaqAnswer3;

  /// No description provided for @marketProblemBadge.
  ///
  /// In en, this message translates to:
  /// **'The Real Problem'**
  String get marketProblemBadge;

  /// No description provided for @marketProblemTitle.
  ///
  /// In en, this message translates to:
  /// **'The second-hand market is geographically fragmented'**
  String get marketProblemTitle;

  /// No description provided for @marketProblemSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Even though you\'re willing to buy with shipping, you only search on platforms in your area. Why miss opportunities?'**
  String get marketProblemSubtitle;

  /// No description provided for @marketProblem1Title.
  ///
  /// In en, this message translates to:
  /// **'Geographically limited search'**
  String get marketProblem1Title;

  /// No description provided for @marketProblem1Description.
  ///
  /// In en, this message translates to:
  /// **'Even though you\'re willing to buy with shipping, you only search on Vinted, eBay, and local platforms in your country. You miss opportunities worldwide where the same product could be cheaper or in better condition.'**
  String get marketProblem1Description;

  /// No description provided for @marketProblem1Stat.
  ///
  /// In en, this message translates to:
  /// **'60% of buyers are willing to buy with shipping'**
  String get marketProblem1Stat;

  /// No description provided for @marketProblem2Title.
  ///
  /// In en, this message translates to:
  /// **'Sellers with limited reach'**
  String get marketProblem2Title;

  /// No description provided for @marketProblem2Description.
  ///
  /// In en, this message translates to:
  /// **'80% of sellers are willing to ship their product, but only publish on local platforms. You close the barrier by limiting your reach to your city or country, when you could sell worldwide if you find the perfect buyer.'**
  String get marketProblem2Description;

  /// No description provided for @marketProblem2Stat.
  ///
  /// In en, this message translates to:
  /// **'80% of sellers are willing to ship'**
  String get marketProblem2Stat;

  /// No description provided for @marketProblem3Title.
  ///
  /// In en, this message translates to:
  /// **'Thousands of irrelevant results'**
  String get marketProblem3Title;

  /// No description provided for @marketProblem3Description.
  ///
  /// In en, this message translates to:
  /// **'It would be unmanageable to read hundreds and thousands of ads on platforms worldwide if half of them are irrelevant ads, accessories or related but different products.'**
  String get marketProblem3Description;

  /// No description provided for @marketProblem3Stat.
  ///
  /// In en, this message translates to:
  /// **'65% of results are irrelevant without filtering'**
  String get marketProblem3Stat;

  /// No description provided for @marketProblem4Title.
  ///
  /// In en, this message translates to:
  /// **'Unknown real demand'**
  String get marketProblem4Title;

  /// No description provided for @marketProblem4Description.
  ///
  /// In en, this message translates to:
  /// **'Sellers don\'t know the true demand for their product, nor the price they could set, nor if they\'re targeting the right audience on the ideal platform in the corresponding country. The price depends on the value the buyer wants to give, and therefore on the buyer\'s real need which depends on many unknowns for the seller.'**
  String get marketProblem4Description;

  /// No description provided for @marketProblem4Stat.
  ///
  /// In en, this message translates to:
  /// **'Unknown global demand'**
  String get marketProblem4Stat;

  /// No description provided for @marketProblemCtaTitle.
  ///
  /// In en, this message translates to:
  /// **'Why search only in your area when you can search worldwide?'**
  String get marketProblemCtaTitle;

  /// No description provided for @marketProblemCtaDescription.
  ///
  /// In en, this message translates to:
  /// **'PRICOFY eliminates these geographical barriers and connects buyers and sellers worldwide'**
  String get marketProblemCtaDescription;

  /// No description provided for @globalSolutionBadge.
  ///
  /// In en, this message translates to:
  /// **'The PRICOFY Solution'**
  String get globalSolutionBadge;

  /// No description provided for @globalSolutionTitle.
  ///
  /// In en, this message translates to:
  /// **'We globalize and democratize the second-hand market'**
  String get globalSolutionTitle;

  /// No description provided for @globalSolutionSubtitle.
  ///
  /// In en, this message translates to:
  /// **'One search. All markets. The smartest way to find exactly what you want.'**
  String get globalSolutionSubtitle;

  /// No description provided for @globalSolution1Title.
  ///
  /// In en, this message translates to:
  /// **'Automatic Global Search'**
  String get globalSolution1Title;

  /// No description provided for @globalSolution1Description.
  ///
  /// In en, this message translates to:
  /// **'We automatically expand your reach from your limited and known environment to platforms worldwide. One search connects you with the true market supply.'**
  String get globalSolution1Description;

  /// No description provided for @globalSolution1Highlight.
  ///
  /// In en, this message translates to:
  /// **'From local to global in one click'**
  String get globalSolution1Highlight;

  /// No description provided for @globalSolution2Title.
  ///
  /// In en, this message translates to:
  /// **'Intelligent AI Filtering'**
  String get globalSolution2Title;

  /// No description provided for @globalSolution2Description.
  ///
  /// In en, this message translates to:
  /// **'We automatically clean results using advanced AI, eliminating irrelevant ads, accessories and related products. It would be unmanageable to read thousands of ads without this filtering.'**
  String get globalSolution2Description;

  /// No description provided for @globalSolution2Highlight.
  ///
  /// In en, this message translates to:
  /// **'65% fewer irrelevant results'**
  String get globalSolution2Highlight;

  /// No description provided for @globalSolution3Title.
  ///
  /// In en, this message translates to:
  /// **'Access Democratization'**
  String get globalSolution3Title;

  /// No description provided for @globalSolution3Description.
  ///
  /// In en, this message translates to:
  /// **'Before, only a few knew how to search well on multiple platforms and countries. Now anyone can access the global second-hand market with one click.'**
  String get globalSolution3Description;

  /// No description provided for @globalSolution3Highlight.
  ///
  /// In en, this message translates to:
  /// **'Global access for everyone'**
  String get globalSolution3Highlight;

  /// No description provided for @globalSolution4Title.
  ///
  /// In en, this message translates to:
  /// **'Global Connection'**
  String get globalSolution4Title;

  /// No description provided for @globalSolution4Description.
  ///
  /// In en, this message translates to:
  /// **'We connect buyers and sellers worldwide to unlock true supply and demand. Your product can find its ideal buyer in any country.'**
  String get globalSolution4Description;

  /// No description provided for @globalSolution4Highlight.
  ///
  /// In en, this message translates to:
  /// **'Connected global market'**
  String get globalSolution4Highlight;

  /// No description provided for @globalSolutionBuyersTitle.
  ///
  /// In en, this message translates to:
  /// **'For Buyers'**
  String get globalSolutionBuyersTitle;

  /// No description provided for @globalSolutionBuyersItem1.
  ///
  /// In en, this message translates to:
  /// **'Automatic search on platforms worldwide'**
  String get globalSolutionBuyersItem1;

  /// No description provided for @globalSolutionBuyersItem2.
  ///
  /// In en, this message translates to:
  /// **'Clean and relevant results, without accessories or related products'**
  String get globalSolutionBuyersItem2;

  /// No description provided for @globalSolutionBuyersItem3.
  ///
  /// In en, this message translates to:
  /// **'Access to true global supply, not just your area'**
  String get globalSolutionBuyersItem3;

  /// No description provided for @globalSolutionBuyersItem4.
  ///
  /// In en, this message translates to:
  /// **'Find the best price in any country'**
  String get globalSolutionBuyersItem4;

  /// No description provided for @globalSolutionSellersTitle.
  ///
  /// In en, this message translates to:
  /// **'For Sellers'**
  String get globalSolutionSellersTitle;

  /// No description provided for @globalSolutionSellersItem1.
  ///
  /// In en, this message translates to:
  /// **'Connect with buyers worldwide'**
  String get globalSolutionSellersItem1;

  /// No description provided for @globalSolutionSellersItem2.
  ///
  /// In en, this message translates to:
  /// **'Discover the true global demand for your product'**
  String get globalSolutionSellersItem2;

  /// No description provided for @globalSolutionSellersItem3.
  ///
  /// In en, this message translates to:
  /// **'Prices based on real worldwide demand'**
  String get globalSolutionSellersItem3;

  /// No description provided for @globalSolutionSellersItem4.
  ///
  /// In en, this message translates to:
  /// **'Find the perfect buyer in any country'**
  String get globalSolutionSellersItem4;

  /// No description provided for @globalSolutionButtonText.
  ///
  /// In en, this message translates to:
  /// **'Create Free Account'**
  String get globalSolutionButtonText;

  /// No description provided for @statsItem1Highlight.
  ///
  /// In en, this message translates to:
  /// **'Worldwide market'**
  String get statsItem1Highlight;

  /// No description provided for @statsItem1Label.
  ///
  /// In en, this message translates to:
  /// **'Global Search'**
  String get statsItem1Label;

  /// No description provided for @statsItem1Description.
  ///
  /// In en, this message translates to:
  /// **'Platforms from multiple countries in one search'**
  String get statsItem1Description;

  /// No description provided for @statsItem2Highlight.
  ///
  /// In en, this message translates to:
  /// **'Clean results'**
  String get statsItem2Highlight;

  /// No description provided for @statsItem2Label.
  ///
  /// In en, this message translates to:
  /// **'Intelligent Filtering'**
  String get statsItem2Label;

  /// No description provided for @statsItem2Description.
  ///
  /// In en, this message translates to:
  /// **'65% fewer irrelevant results thanks to our AI'**
  String get statsItem2Description;

  /// No description provided for @statsItem3Highlight.
  ///
  /// In en, this message translates to:
  /// **'For everyone'**
  String get statsItem3Highlight;

  /// No description provided for @statsItem3Label.
  ///
  /// In en, this message translates to:
  /// **'Democratized Access'**
  String get statsItem3Label;

  /// No description provided for @statsItem3Description.
  ///
  /// In en, this message translates to:
  /// **'Before only a few knew how to search well. Now anyone can.'**
  String get statsItem3Description;

  /// No description provided for @ctaTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to connect with the second-hand market?'**
  String get ctaTitle;

  /// No description provided for @ctaSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Join hundreds of users who are already maximizing their revenue with Pricofy'**
  String get ctaSubtitle;

  /// No description provided for @ctaDescription.
  ///
  /// In en, this message translates to:
  /// **'Join hundreds of users who are already maximizing their revenue with Pricofy'**
  String get ctaDescription;

  /// No description provided for @ctaStartFree.
  ///
  /// In en, this message translates to:
  /// **'Start Free Trial'**
  String get ctaStartFree;

  /// No description provided for @ctaTalkSales.
  ///
  /// In en, this message translates to:
  /// **'Talk to Sales'**
  String get ctaTalkSales;

  /// No description provided for @footerDescription.
  ///
  /// In en, this message translates to:
  /// **'Smart price optimization for your business.'**
  String get footerDescription;

  /// No description provided for @footerProduct.
  ///
  /// In en, this message translates to:
  /// **'Product'**
  String get footerProduct;

  /// No description provided for @footerCompany.
  ///
  /// In en, this message translates to:
  /// **'Company'**
  String get footerCompany;

  /// No description provided for @footerLegal.
  ///
  /// In en, this message translates to:
  /// **'Legal'**
  String get footerLegal;

  /// No description provided for @footerFeatures.
  ///
  /// In en, this message translates to:
  /// **'Features'**
  String get footerFeatures;

  /// No description provided for @footerPricing.
  ///
  /// In en, this message translates to:
  /// **'Pricing'**
  String get footerPricing;

  /// No description provided for @footerDocumentation.
  ///
  /// In en, this message translates to:
  /// **'Documentation'**
  String get footerDocumentation;

  /// No description provided for @footerAbout.
  ///
  /// In en, this message translates to:
  /// **'About Us'**
  String get footerAbout;

  /// No description provided for @footerBlog.
  ///
  /// In en, this message translates to:
  /// **'Blog'**
  String get footerBlog;

  /// No description provided for @footerContact.
  ///
  /// In en, this message translates to:
  /// **'Contact'**
  String get footerContact;

  /// No description provided for @footerPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get footerPrivacy;

  /// No description provided for @footerTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms'**
  String get footerTerms;

  /// No description provided for @footerCookies.
  ///
  /// In en, this message translates to:
  /// **'Cookies'**
  String get footerCookies;

  /// No description provided for @footerCopyright.
  ///
  /// In en, this message translates to:
  /// **'All rights reserved.'**
  String get footerCopyright;

  /// No description provided for @contactTitle.
  ///
  /// In en, this message translates to:
  /// **'Contact Us'**
  String get contactTitle;

  /// No description provided for @contactDescription.
  ///
  /// In en, this message translates to:
  /// **'Have questions? We\'re here to help. Send us a message and we\'ll get back to you as soon as possible.'**
  String get contactDescription;

  /// No description provided for @contactContactInfo.
  ///
  /// In en, this message translates to:
  /// **'Contact Information'**
  String get contactContactInfo;

  /// No description provided for @contactEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get contactEmail;

  /// No description provided for @contactPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get contactPhone;

  /// No description provided for @contactLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get contactLocation;

  /// No description provided for @contactLocationValue.
  ///
  /// In en, this message translates to:
  /// **'Spain'**
  String get contactLocationValue;

  /// No description provided for @contactSchedule.
  ///
  /// In en, this message translates to:
  /// **'Business Hours'**
  String get contactSchedule;

  /// No description provided for @contactScheduleWeekdays.
  ///
  /// In en, this message translates to:
  /// **'Monday - Friday:'**
  String get contactScheduleWeekdays;

  /// No description provided for @contactScheduleWeekdaysTime.
  ///
  /// In en, this message translates to:
  /// **'9:00 - 18:00'**
  String get contactScheduleWeekdaysTime;

  /// No description provided for @contactScheduleWeekend.
  ///
  /// In en, this message translates to:
  /// **'Saturday - Sunday:'**
  String get contactScheduleWeekend;

  /// No description provided for @contactScheduleWeekendTime.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get contactScheduleWeekendTime;

  /// No description provided for @contactSendMessage.
  ///
  /// In en, this message translates to:
  /// **'Send us a Message'**
  String get contactSendMessage;

  /// No description provided for @contactName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get contactName;

  /// No description provided for @contactNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Your name'**
  String get contactNamePlaceholder;

  /// No description provided for @contactEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'your@email.com'**
  String get contactEmailPlaceholder;

  /// No description provided for @contactPhoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get contactPhoneLabel;

  /// No description provided for @contactPhonePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'+34 600 000 000'**
  String get contactPhonePlaceholder;

  /// No description provided for @contactComment.
  ///
  /// In en, this message translates to:
  /// **'Comment'**
  String get contactComment;

  /// No description provided for @contactCommentPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Tell us how we can help you...'**
  String get contactCommentPlaceholder;

  /// No description provided for @contactSend.
  ///
  /// In en, this message translates to:
  /// **'Send Message'**
  String get contactSend;

  /// No description provided for @contactSending.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get contactSending;

  /// No description provided for @contactSuccess.
  ///
  /// In en, this message translates to:
  /// **'Message sent successfully! We will get back to you soon.'**
  String get contactSuccess;

  /// No description provided for @contactRequired.
  ///
  /// In en, this message translates to:
  /// **'*'**
  String get contactRequired;

  /// No description provided for @contactErrorNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Name is required'**
  String get contactErrorNameRequired;

  /// No description provided for @contactErrorEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Email is not valid'**
  String get contactErrorEmailInvalid;

  /// No description provided for @contactErrorPhoneRequired.
  ///
  /// In en, this message translates to:
  /// **'Phone number is required'**
  String get contactErrorPhoneRequired;

  /// No description provided for @contactErrorPhoneInvalid.
  ///
  /// In en, this message translates to:
  /// **'Phone format is not valid'**
  String get contactErrorPhoneInvalid;

  /// No description provided for @contactErrorCommentRequired.
  ///
  /// In en, this message translates to:
  /// **'Comment is required'**
  String get contactErrorCommentRequired;

  /// No description provided for @contactErrorCommentMinLength.
  ///
  /// In en, this message translates to:
  /// **'Comment must be at least 10 characters'**
  String get contactErrorCommentMinLength;

  /// No description provided for @contactErrorSubmitError.
  ///
  /// In en, this message translates to:
  /// **'Error sending message. Please try again.'**
  String get contactErrorSubmitError;

  /// No description provided for @formTitle.
  ///
  /// In en, this message translates to:
  /// **'Service Request'**
  String get formTitle;

  /// No description provided for @formEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formEmail;

  /// No description provided for @formEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'your@email.com'**
  String get formEmailPlaceholder;

  /// No description provided for @formCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get formCountry;

  /// No description provided for @formCountryPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select your country'**
  String get formCountryPlaceholder;

  /// No description provided for @formCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get formCity;

  /// No description provided for @formCityPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter your city'**
  String get formCityPlaceholder;

  /// No description provided for @formAction.
  ///
  /// In en, this message translates to:
  /// **'What do you want to do?'**
  String get formAction;

  /// No description provided for @formActionPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select an option'**
  String get formActionPlaceholder;

  /// No description provided for @formActionSell.
  ///
  /// In en, this message translates to:
  /// **'I want to sell a product'**
  String get formActionSell;

  /// No description provided for @formActionBuy.
  ///
  /// In en, this message translates to:
  /// **'I want to buy at the best price'**
  String get formActionBuy;

  /// No description provided for @formProductType.
  ///
  /// In en, this message translates to:
  /// **'Product type'**
  String get formProductType;

  /// No description provided for @formProductTypePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select a category'**
  String get formProductTypePlaceholder;

  /// No description provided for @formProductTypeElectronics.
  ///
  /// In en, this message translates to:
  /// **'Electronics'**
  String get formProductTypeElectronics;

  /// No description provided for @formProductTypeMobiles.
  ///
  /// In en, this message translates to:
  /// **'Mobile phones and Tablets'**
  String get formProductTypeMobiles;

  /// No description provided for @formProductTypeIT.
  ///
  /// In en, this message translates to:
  /// **'IT'**
  String get formProductTypeIT;

  /// No description provided for @formProductTypeAudioVideo.
  ///
  /// In en, this message translates to:
  /// **'Audio and Video'**
  String get formProductTypeAudioVideo;

  /// No description provided for @formProductTypeCars.
  ///
  /// In en, this message translates to:
  /// **'Cars and Motorcycles'**
  String get formProductTypeCars;

  /// No description provided for @formProductTypeBikes.
  ///
  /// In en, this message translates to:
  /// **'Bicycles'**
  String get formProductTypeBikes;

  /// No description provided for @formProductTypeClothing.
  ///
  /// In en, this message translates to:
  /// **'Clothing and Accessories'**
  String get formProductTypeClothing;

  /// No description provided for @formProductTypeHome.
  ///
  /// In en, this message translates to:
  /// **'Home and Garden'**
  String get formProductTypeHome;

  /// No description provided for @formProductTypeSports.
  ///
  /// In en, this message translates to:
  /// **'Sports and Leisure'**
  String get formProductTypeSports;

  /// No description provided for @formProductTypeBooks.
  ///
  /// In en, this message translates to:
  /// **'Books and Music'**
  String get formProductTypeBooks;

  /// No description provided for @formProductTypeToys.
  ///
  /// In en, this message translates to:
  /// **'Toys and Babies'**
  String get formProductTypeToys;

  /// No description provided for @formProductTypeOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get formProductTypeOther;

  /// No description provided for @formModelBrand.
  ///
  /// In en, this message translates to:
  /// **'Model / Brand'**
  String get formModelBrand;

  /// No description provided for @formModelBrandPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'E.g. iPhone 13, Bugaboo Bee 5...'**
  String get formModelBrandPlaceholder;

  /// No description provided for @formCondition.
  ///
  /// In en, this message translates to:
  /// **'Condition'**
  String get formCondition;

  /// No description provided for @formConditionPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select product condition'**
  String get formConditionPlaceholder;

  /// No description provided for @formConditionNew.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get formConditionNew;

  /// No description provided for @formConditionLikeNew.
  ///
  /// In en, this message translates to:
  /// **'Like new'**
  String get formConditionLikeNew;

  /// No description provided for @formConditionGood.
  ///
  /// In en, this message translates to:
  /// **'Good condition'**
  String get formConditionGood;

  /// No description provided for @formConditionUsed.
  ///
  /// In en, this message translates to:
  /// **'Used'**
  String get formConditionUsed;

  /// No description provided for @formConditionRepair.
  ///
  /// In en, this message translates to:
  /// **'Needs repair'**
  String get formConditionRepair;

  /// No description provided for @formAccessories.
  ///
  /// In en, this message translates to:
  /// **'Included accessories (optional)'**
  String get formAccessories;

  /// No description provided for @formAccessoriesPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Describe included accessories...'**
  String get formAccessoriesPlaceholder;

  /// No description provided for @formUrgency.
  ///
  /// In en, this message translates to:
  /// **'Urgency'**
  String get formUrgency;

  /// No description provided for @formUrgencyFast.
  ///
  /// In en, this message translates to:
  /// **'I want to sell fast'**
  String get formUrgencyFast;

  /// No description provided for @formUrgencyNoRush.
  ///
  /// In en, this message translates to:
  /// **'No rush'**
  String get formUrgencyNoRush;

  /// No description provided for @formUrgencyBestPrice.
  ///
  /// In en, this message translates to:
  /// **'I\'m looking for the best price'**
  String get formUrgencyBestPrice;

  /// No description provided for @formPhotos.
  ///
  /// In en, this message translates to:
  /// **'Photos (up to 6)'**
  String get formPhotos;

  /// No description provided for @formPhotosSelected.
  ///
  /// In en, this message translates to:
  /// **'file(s) selected'**
  String get formPhotosSelected;

  /// No description provided for @formPhotosSelectButton.
  ///
  /// In en, this message translates to:
  /// **'Select photos'**
  String get formPhotosSelectButton;

  /// No description provided for @formPhotosMax.
  ///
  /// In en, this message translates to:
  /// **'Each photo must be less than 5MB'**
  String get formPhotosMax;

  /// No description provided for @formPhotosMin.
  ///
  /// In en, this message translates to:
  /// **'At least 1 photo required'**
  String get formPhotosMin;

  /// No description provided for @formSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit request'**
  String get formSubmit;

  /// No description provided for @formSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get formSubmitting;

  /// No description provided for @formCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get formCancel;

  /// No description provided for @formSuccess.
  ///
  /// In en, this message translates to:
  /// **'Request sent successfully! Thank you for contacting us.'**
  String get formSuccess;

  /// No description provided for @formDetectingCountry.
  ///
  /// In en, this message translates to:
  /// **'Detecting country...'**
  String get formDetectingCountry;

  /// No description provided for @formPostalCode.
  ///
  /// In en, this message translates to:
  /// **'Postal Code (optional)'**
  String get formPostalCode;

  /// No description provided for @formPostalCodeHelper.
  ///
  /// In en, this message translates to:
  /// **'Improves location precision'**
  String get formPostalCodeHelper;

  /// No description provided for @formPostalCodeError.
  ///
  /// In en, this message translates to:
  /// **'Must be 5 digits'**
  String get formPostalCodeError;

  /// No description provided for @formRequestEvaluation.
  ///
  /// In en, this message translates to:
  /// **'Request Evaluation'**
  String get formRequestEvaluation;

  /// No description provided for @formInsufficientFunds.
  ///
  /// In en, this message translates to:
  /// **'Insufficient Funds'**
  String get formInsufficientFunds;

  /// No description provided for @formInsufficientFundsMessage.
  ///
  /// In en, this message translates to:
  /// **'You do not have sufficient funds for this evaluation.'**
  String get formInsufficientFundsMessage;

  /// No description provided for @formCost.
  ///
  /// In en, this message translates to:
  /// **'Cost'**
  String get formCost;

  /// No description provided for @formYourBalance.
  ///
  /// In en, this message translates to:
  /// **'Your balance'**
  String get formYourBalance;

  /// No description provided for @formAddFunds.
  ///
  /// In en, this message translates to:
  /// **'Add Funds'**
  String get formAddFunds;

  /// No description provided for @formViewPlans.
  ///
  /// In en, this message translates to:
  /// **'View Plans'**
  String get formViewPlans;

  /// No description provided for @formRequired.
  ///
  /// In en, this message translates to:
  /// **'*'**
  String get formRequired;

  /// No description provided for @formErrorEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get formErrorEmailRequired;

  /// No description provided for @formErrorEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Email is not valid'**
  String get formErrorEmailInvalid;

  /// No description provided for @formErrorCountryRequired.
  ///
  /// In en, this message translates to:
  /// **'Country is required'**
  String get formErrorCountryRequired;

  /// No description provided for @formErrorCityRequired.
  ///
  /// In en, this message translates to:
  /// **'City is required'**
  String get formErrorCityRequired;

  /// No description provided for @formErrorActionRequired.
  ///
  /// In en, this message translates to:
  /// **'You must select an action'**
  String get formErrorActionRequired;

  /// No description provided for @formErrorProductTypeRequired.
  ///
  /// In en, this message translates to:
  /// **'Product type is required'**
  String get formErrorProductTypeRequired;

  /// No description provided for @formErrorModelBrandRequired.
  ///
  /// In en, this message translates to:
  /// **'Model/brand is required'**
  String get formErrorModelBrandRequired;

  /// No description provided for @formErrorConditionRequired.
  ///
  /// In en, this message translates to:
  /// **'Condition is required'**
  String get formErrorConditionRequired;

  /// No description provided for @formErrorUrgencyRequired.
  ///
  /// In en, this message translates to:
  /// **'Urgency is required'**
  String get formErrorUrgencyRequired;

  /// No description provided for @formErrorPhotosRequired.
  ///
  /// In en, this message translates to:
  /// **'Photos are required to sell'**
  String get formErrorPhotosRequired;

  /// No description provided for @formErrorPhotosMax.
  ///
  /// In en, this message translates to:
  /// **'Maximum 6 photos allowed'**
  String get formErrorPhotosMax;

  /// No description provided for @formErrorPhotosMaxFiles.
  ///
  /// In en, this message translates to:
  /// **'Maximum 6 files allowed'**
  String get formErrorPhotosMaxFiles;

  /// No description provided for @formErrorOnePerDay.
  ///
  /// In en, this message translates to:
  /// **'Only one evaluation per day is allowed'**
  String get formErrorOnePerDay;

  /// No description provided for @formErrorSubmitError.
  ///
  /// In en, this message translates to:
  /// **'Error submitting request. Please try again.'**
  String get formErrorSubmitError;

  /// No description provided for @errorBadRequest.
  ///
  /// In en, this message translates to:
  /// **'Invalid request'**
  String get errorBadRequest;

  /// No description provided for @errorUnauthorized.
  ///
  /// In en, this message translates to:
  /// **'Session expired. Please sign in again.'**
  String get errorUnauthorized;

  /// No description provided for @errorForbidden.
  ///
  /// In en, this message translates to:
  /// **'You do not have permission to perform this action'**
  String get errorForbidden;

  /// No description provided for @errorNotFound.
  ///
  /// In en, this message translates to:
  /// **'Resource not found'**
  String get errorNotFound;

  /// No description provided for @errorValidationError.
  ///
  /// In en, this message translates to:
  /// **'The data provided is invalid'**
  String get errorValidationError;

  /// No description provided for @errorRateLimited.
  ///
  /// In en, this message translates to:
  /// **'Too many requests. Please wait a moment.'**
  String get errorRateLimited;

  /// No description provided for @errorRecaptchaFailed.
  ///
  /// In en, this message translates to:
  /// **'Security verification failed. Please reload the page.'**
  String get errorRecaptchaFailed;

  /// No description provided for @errorDisposableEmail.
  ///
  /// In en, this message translates to:
  /// **'Disposable email addresses are not allowed'**
  String get errorDisposableEmail;

  /// No description provided for @errorEmailRateLimit.
  ///
  /// In en, this message translates to:
  /// **'Too many attempts with this email'**
  String get errorEmailRateLimit;

  /// No description provided for @errorIpRateLimit.
  ///
  /// In en, this message translates to:
  /// **'Too many attempts from your IP address'**
  String get errorIpRateLimit;

  /// No description provided for @errorPaymentRequired.
  ///
  /// In en, this message translates to:
  /// **'Payment required to continue'**
  String get errorPaymentRequired;

  /// No description provided for @errorInsufficientFunds.
  ///
  /// In en, this message translates to:
  /// **'Insufficient funds'**
  String get errorInsufficientFunds;

  /// No description provided for @errorInvalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get errorInvalidEmail;

  /// No description provided for @errorInternalError.
  ///
  /// In en, this message translates to:
  /// **'Internal server error'**
  String get errorInternalError;

  /// No description provided for @errorServiceUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Service temporarily unavailable'**
  String get errorServiceUnavailable;

  /// No description provided for @errorTimeout.
  ///
  /// In en, this message translates to:
  /// **'Connection timed out'**
  String get errorTimeout;

  /// No description provided for @errorConnectionError.
  ///
  /// In en, this message translates to:
  /// **'Connection error. Check your internet.'**
  String get errorConnectionError;

  /// No description provided for @errorUnknown.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred'**
  String get errorUnknown;

  /// No description provided for @betaTitle.
  ///
  /// In en, this message translates to:
  /// **'Get Beta Access to Pricofy'**
  String get betaTitle;

  /// No description provided for @betaSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Only 3,000 spots available'**
  String get betaSubtitle;

  /// No description provided for @betaDescription.
  ///
  /// In en, this message translates to:
  /// **'Be among the first to try our AI-powered price analysis tool. Complete all 3 steps to secure your spot.'**
  String get betaDescription;

  /// No description provided for @betaHowItWorksTitle.
  ///
  /// In en, this message translates to:
  /// **'How to get access?'**
  String get betaHowItWorksTitle;

  /// No description provided for @betaHowItWorksDescription.
  ///
  /// In en, this message translates to:
  /// **'Complete these 3 simple steps and you will get a real spot in the beta'**
  String get betaHowItWorksDescription;

  /// No description provided for @betaStep1Title.
  ///
  /// In en, this message translates to:
  /// **'Follow us on Instagram'**
  String get betaStep1Title;

  /// No description provided for @betaStep1Description.
  ///
  /// In en, this message translates to:
  /// **'Follow our @pricofy account on Instagram'**
  String get betaStep1Description;

  /// No description provided for @betaStep1Instructions.
  ///
  /// In en, this message translates to:
  /// **'1. Open Instagram\\n2. Search for @pricofy\\n3. Click Follow\\n4. Enable notifications to stay updated'**
  String get betaStep1Instructions;

  /// No description provided for @betaStep1.
  ///
  /// In en, this message translates to:
  /// **'Follow @pricofy'**
  String get betaStep1;

  /// No description provided for @betaStep2Title.
  ///
  /// In en, this message translates to:
  /// **'Comment on our post'**
  String get betaStep2Title;

  /// No description provided for @betaStep2Description.
  ///
  /// In en, this message translates to:
  /// **'Mention 3 friends in our latest post'**
  String get betaStep2Description;

  /// No description provided for @betaStep2Instructions.
  ///
  /// In en, this message translates to:
  /// **'1. Go to our latest post on @pricofy\\n2. Write a comment mentioning 3 friends (@friend1 @friend2 @friend3)\\n3. Make sure your comment is public'**
  String get betaStep2Instructions;

  /// No description provided for @betaStep3Title.
  ///
  /// In en, this message translates to:
  /// **'Invite 3 friends'**
  String get betaStep3Title;

  /// No description provided for @betaStep3Description.
  ///
  /// In en, this message translates to:
  /// **'Share your referral link and get 3 sign-ups'**
  String get betaStep3Description;

  /// No description provided for @betaStep3Instructions.
  ///
  /// In en, this message translates to:
  /// **'Share your personalized link with friends. When 3 of them register using your link, you will complete this step.'**
  String get betaStep3Instructions;

  /// No description provided for @betaStep3Progress.
  ///
  /// In en, this message translates to:
  /// **'You need {count} more invitations'**
  String betaStep3Progress(String count);

  /// No description provided for @betaStep3Complete.
  ///
  /// In en, this message translates to:
  /// **'You have completed all 3 invitations!'**
  String get betaStep3Complete;

  /// No description provided for @betaEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'your@email.com'**
  String get betaEmailPlaceholder;

  /// No description provided for @betaInstagramPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'your_username'**
  String get betaInstagramPlaceholder;

  /// No description provided for @betaRegisterButton.
  ///
  /// In en, this message translates to:
  /// **'Register for Beta'**
  String get betaRegisterButton;

  /// No description provided for @betaCheckStatusButton.
  ///
  /// In en, this message translates to:
  /// **'Check my status'**
  String get betaCheckStatusButton;

  /// No description provided for @betaLoading.
  ///
  /// In en, this message translates to:
  /// **'Registering...'**
  String get betaLoading;

  /// No description provided for @betaChecking.
  ///
  /// In en, this message translates to:
  /// **'Checking...'**
  String get betaChecking;

  /// No description provided for @betaVirtualPosition.
  ///
  /// In en, this message translates to:
  /// **'Virtual position'**
  String get betaVirtualPosition;

  /// No description provided for @betaRealPosition.
  ///
  /// In en, this message translates to:
  /// **'Your real position'**
  String get betaRealPosition;

  /// No description provided for @betaApprovedTitle.
  ///
  /// In en, this message translates to:
  /// **'Congratulations!'**
  String get betaApprovedTitle;

  /// No description provided for @betaApprovedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You have position #{position} of {max}'**
  String betaApprovedSubtitle(String position, String max);

  /// No description provided for @betaRegisteredTitle.
  ///
  /// In en, this message translates to:
  /// **'You are on the list'**
  String get betaRegisteredTitle;

  /// No description provided for @betaRegisteredSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Complete the steps to get your real position'**
  String get betaRegisteredSubtitle;

  /// No description provided for @betaRegisteredSuccess.
  ///
  /// In en, this message translates to:
  /// **'You have successfully registered!'**
  String get betaRegisteredSuccess;

  /// No description provided for @betaStepsTitle.
  ///
  /// In en, this message translates to:
  /// **'Your pending steps'**
  String get betaStepsTitle;

  /// No description provided for @betaStepsCompletedWaiting.
  ///
  /// In en, this message translates to:
  /// **'You have completed all steps. We are verifying your account.'**
  String get betaStepsCompletedWaiting;

  /// No description provided for @betaCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get betaCompleted;

  /// No description provided for @betaVerifySteps.
  ///
  /// In en, this message translates to:
  /// **'Verify my steps'**
  String get betaVerifySteps;

  /// No description provided for @betaInvitationsRegistered.
  ///
  /// In en, this message translates to:
  /// **'invitations registered'**
  String get betaInvitationsRegistered;

  /// No description provided for @betaShareLink.
  ///
  /// In en, this message translates to:
  /// **'Share this link with your friends:'**
  String get betaShareLink;

  /// No description provided for @betaCopyLink.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get betaCopyLink;

  /// No description provided for @betaLinkCopied.
  ///
  /// In en, this message translates to:
  /// **'Link copied!'**
  String get betaLinkCopied;

  /// No description provided for @betaWaitlistReminder.
  ///
  /// In en, this message translates to:
  /// **'Save this URL to check your status:'**
  String get betaWaitlistReminder;

  /// No description provided for @betaNoInstagramText.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have Instagram?'**
  String get betaNoInstagramText;

  /// No description provided for @betaContactLabel.
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get betaContactLabel;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get commonLoading;

  /// No description provided for @commonLoadingMore.
  ///
  /// In en, this message translates to:
  /// **'Loading more...'**
  String get commonLoadingMore;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// No description provided for @commonConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get commonConfirm;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonError.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get commonError;

  /// No description provided for @commonRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// No description provided for @commonBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// No description provided for @commonSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get commonSearch;

  /// No description provided for @commonClear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get commonClear;

  /// No description provided for @commonReset.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get commonReset;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonOr.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get commonOr;

  /// No description provided for @authWelcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get authWelcomeBack;

  /// No description provided for @authEnterYourCode.
  ///
  /// In en, this message translates to:
  /// **'Enter Your Code'**
  String get authEnterYourCode;

  /// No description provided for @authEmailAddress.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get authEmailAddress;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get authNewPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authConfirmPassword;

  /// No description provided for @authVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Verification Code'**
  String get authVerificationCode;

  /// No description provided for @authMfaCode.
  ///
  /// In en, this message translates to:
  /// **'MFA Code'**
  String get authMfaCode;

  /// No description provided for @authSendLoginCode.
  ///
  /// In en, this message translates to:
  /// **'Send Login Code'**
  String get authSendLoginCode;

  /// No description provided for @authVerifyAndLogin.
  ///
  /// In en, this message translates to:
  /// **'Verify & Login'**
  String get authVerifyAndLogin;

  /// No description provided for @authResendCode.
  ///
  /// In en, this message translates to:
  /// **'Resend code'**
  String get authResendCode;

  /// No description provided for @authUseDifferentEmail.
  ///
  /// In en, this message translates to:
  /// **'Use different email'**
  String get authUseDifferentEmail;

  /// No description provided for @authCheckYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Check your email'**
  String get authCheckYourEmail;

  /// No description provided for @authCheckYourEmailDescription.
  ///
  /// In en, this message translates to:
  /// **'We sent a verification code to your email. Enter it below to continue.'**
  String get authCheckYourEmailDescription;

  /// No description provided for @authVerifying.
  ///
  /// In en, this message translates to:
  /// **'Verifying...'**
  String get authVerifying;

  /// No description provided for @authChanging.
  ///
  /// In en, this message translates to:
  /// **'Changing...'**
  String get authChanging;

  /// No description provided for @authChangePassword.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get authChangePassword;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get authForgotPassword;

  /// No description provided for @authResetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get authResetPassword;

  /// No description provided for @authVerifyCode.
  ///
  /// In en, this message translates to:
  /// **'Verify code'**
  String get authVerifyCode;

  /// No description provided for @authSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authSignIn;

  /// No description provided for @authSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get authSignUp;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get authLogout;

  /// No description provided for @authLogoutConfirm.
  ///
  /// In en, this message translates to:
  /// **'Logout?'**
  String get authLogoutConfirm;

  /// No description provided for @authAdminLogin.
  ///
  /// In en, this message translates to:
  /// **'Admin Login'**
  String get authAdminLogin;

  /// No description provided for @authPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password required'**
  String get authPasswordRequired;

  /// No description provided for @authEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email required'**
  String get authEmailRequired;

  /// No description provided for @authEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email'**
  String get authEmailInvalid;

  /// No description provided for @authCodeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid code. Please try again.'**
  String get authCodeInvalid;

  /// No description provided for @authCodeExpired.
  ///
  /// In en, this message translates to:
  /// **'Code expired. Please request a new one.'**
  String get authCodeExpired;

  /// No description provided for @authVerificationFailed.
  ///
  /// In en, this message translates to:
  /// **'Verification failed'**
  String get authVerificationFailed;

  /// No description provided for @authPasswordChangeRequired.
  ///
  /// In en, this message translates to:
  /// **'Please change your password to continue'**
  String get authPasswordChangeRequired;

  /// No description provided for @authErrorDisposableEmail.
  ///
  /// In en, this message translates to:
  /// **'Disposable email addresses are not allowed. Please use a permanent email.'**
  String get authErrorDisposableEmail;

  /// No description provided for @authErrorRateLimited.
  ///
  /// In en, this message translates to:
  /// **'Too many attempts. Please try again later.'**
  String get authErrorRateLimited;

  /// No description provided for @authErrorRecaptchaFailed.
  ///
  /// In en, this message translates to:
  /// **'Security verification failed. Please refresh and try again.'**
  String get authErrorRecaptchaFailed;

  /// No description provided for @authErrorUserNotFound.
  ///
  /// In en, this message translates to:
  /// **'User not found. Please check your email.'**
  String get authErrorUserNotFound;

  /// No description provided for @authErrorSendCodeFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to send code. Please try again.'**
  String get authErrorSendCodeFailed;

  /// No description provided for @authAdditionalVerificationRequired.
  ///
  /// In en, this message translates to:
  /// **'Additional verification required'**
  String get authAdditionalVerificationRequired;

  /// No description provided for @authSocialLoginWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get authSocialLoginWithGoogle;

  /// No description provided for @authSocialLoginWithApple.
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple'**
  String get authSocialLoginWithApple;

  /// No description provided for @authSocialLoginWithFacebook.
  ///
  /// In en, this message translates to:
  /// **'Continue with Facebook'**
  String get authSocialLoginWithFacebook;

  /// No description provided for @authSignInDescription.
  ///
  /// In en, this message translates to:
  /// **'Sign in to access your evaluations'**
  String get authSignInDescription;

  /// No description provided for @authNewUserMessage.
  ///
  /// In en, this message translates to:
  /// **'New user? Just enter your email above - we\'ll create your account automatically!'**
  String get authNewUserMessage;

  /// No description provided for @authAdminLoginRestricted.
  ///
  /// In en, this message translates to:
  /// **'Restricted access for administrators only'**
  String get authAdminLoginRestricted;

  /// No description provided for @authPasswordMinLength.
  ///
  /// In en, this message translates to:
  /// **'Minimum 8 characters'**
  String get authPasswordMinLength;

  /// No description provided for @authPasswordsDoNotMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get authPasswordsDoNotMatch;

  /// No description provided for @authPasswordNeedsUppercase.
  ///
  /// In en, this message translates to:
  /// **'Must contain at least one uppercase letter'**
  String get authPasswordNeedsUppercase;

  /// No description provided for @authPasswordNeedsLowercase.
  ///
  /// In en, this message translates to:
  /// **'Must contain at least one lowercase letter'**
  String get authPasswordNeedsLowercase;

  /// No description provided for @authPasswordNeedsDigit.
  ///
  /// In en, this message translates to:
  /// **'Must contain at least one digit'**
  String get authPasswordNeedsDigit;

  /// No description provided for @authPasswordRequirements.
  ///
  /// In en, this message translates to:
  /// **'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit'**
  String get authPasswordRequirements;

  /// No description provided for @authMfaEnterCode.
  ///
  /// In en, this message translates to:
  /// **'Enter code from your authenticator'**
  String get authMfaEnterCode;

  /// No description provided for @authMfaCodeRequired.
  ///
  /// In en, this message translates to:
  /// **'6-digit code required'**
  String get authMfaCodeRequired;

  /// No description provided for @authForgotPasswordQuestion.
  ///
  /// In en, this message translates to:
  /// **'Forgot your password?'**
  String get authForgotPasswordQuestion;

  /// No description provided for @authForgotPasswordDescription.
  ///
  /// In en, this message translates to:
  /// **'Enter your email to receive a reset code'**
  String get authForgotPasswordDescription;

  /// No description provided for @authResetPasswordDescription.
  ///
  /// In en, this message translates to:
  /// **'Enter the code sent to your email and your new password'**
  String get authResetPasswordDescription;

  /// No description provided for @authPasswordResetSuccess.
  ///
  /// In en, this message translates to:
  /// **'Password reset successful!'**
  String get authPasswordResetSuccess;

  /// No description provided for @authRedirectingToLogin.
  ///
  /// In en, this message translates to:
  /// **'Redirecting to login...'**
  String get authRedirectingToLogin;

  /// No description provided for @authResetCodeSent.
  ///
  /// In en, this message translates to:
  /// **'Reset code sent!'**
  String get authResetCodeSent;

  /// No description provided for @authCheckEmailRedirecting.
  ///
  /// In en, this message translates to:
  /// **'Check your email. Redirecting...'**
  String get authCheckEmailRedirecting;

  /// No description provided for @authSendResetCode.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Code'**
  String get authSendResetCode;

  /// No description provided for @authBackToUserLogin.
  ///
  /// In en, this message translates to:
  /// **'Back to user login'**
  String get authBackToUserLogin;

  /// No description provided for @authBackToAdminLogin.
  ///
  /// In en, this message translates to:
  /// **'Back to Admin Login'**
  String get authBackToAdminLogin;

  /// No description provided for @authVerificationCodeHelper.
  ///
  /// In en, this message translates to:
  /// **'6-digit code from your email'**
  String get authVerificationCodeHelper;

  /// No description provided for @authVerificationCodeWillBeSent.
  ///
  /// In en, this message translates to:
  /// **'A verification code will be sent to your email'**
  String get authVerificationCodeWillBeSent;

  /// No description provided for @authTermsPrefix.
  ///
  /// In en, this message translates to:
  /// **'By continuing, you agree to our '**
  String get authTermsPrefix;

  /// No description provided for @authTermsOfService.
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get authTermsOfService;

  /// No description provided for @authTermsAnd.
  ///
  /// In en, this message translates to:
  /// **' and '**
  String get authTermsAnd;

  /// No description provided for @authPrivacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get authPrivacyPolicy;

  /// No description provided for @authTermsGoogleSuffix.
  ///
  /// In en, this message translates to:
  /// **' apply.'**
  String get authTermsGoogleSuffix;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @navMyEvaluations.
  ///
  /// In en, this message translates to:
  /// **'My Evaluations'**
  String get navMyEvaluations;

  /// No description provided for @navNewEvaluation.
  ///
  /// In en, this message translates to:
  /// **'New Evaluation'**
  String get navNewEvaluation;

  /// No description provided for @navAdminPanel.
  ///
  /// In en, this message translates to:
  /// **'Admin Panel'**
  String get navAdminPanel;

  /// No description provided for @navFavorites.
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get navFavorites;

  /// No description provided for @profileMyProfile.
  ///
  /// In en, this message translates to:
  /// **'My Profile'**
  String get profileMyProfile;

  /// No description provided for @profileData.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileData;

  /// No description provided for @profileWallet.
  ///
  /// In en, this message translates to:
  /// **'Wallet'**
  String get profileWallet;

  /// No description provided for @profileSubscription.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get profileSubscription;

  /// No description provided for @profileInvoices.
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get profileInvoices;

  /// No description provided for @profileFirstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get profileFirstName;

  /// No description provided for @profileLastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get profileLastName;

  /// No description provided for @profilePhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get profilePhone;

  /// No description provided for @profileSaveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get profileSaveChanges;

  /// No description provided for @profileUpdatedSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get profileUpdatedSuccess;

  /// No description provided for @profileEditProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profileEditProfile;

  /// No description provided for @profileAdministrator.
  ///
  /// In en, this message translates to:
  /// **'Administrator'**
  String get profileAdministrator;

  /// No description provided for @walletYourBalance.
  ///
  /// In en, this message translates to:
  /// **'Your balance'**
  String get walletYourBalance;

  /// No description provided for @walletAddFunds.
  ///
  /// In en, this message translates to:
  /// **'Add Funds'**
  String get walletAddFunds;

  /// No description provided for @walletInsufficientFunds.
  ///
  /// In en, this message translates to:
  /// **'Insufficient Funds'**
  String get walletInsufficientFunds;

  /// No description provided for @walletCost.
  ///
  /// In en, this message translates to:
  /// **'Cost'**
  String get walletCost;

  /// No description provided for @walletViewPlans.
  ///
  /// In en, this message translates to:
  /// **'View Plans'**
  String get walletViewPlans;

  /// No description provided for @dashboardSearchResults.
  ///
  /// In en, this message translates to:
  /// **'Search Results'**
  String get dashboardSearchResults;

  /// No description provided for @dashboardRecentSearches.
  ///
  /// In en, this message translates to:
  /// **'Recent searches'**
  String get dashboardRecentSearches;

  /// No description provided for @dashboardNoActiveSearch.
  ///
  /// In en, this message translates to:
  /// **'No active search'**
  String get dashboardNoActiveSearch;

  /// No description provided for @dashboardWhatDoYouWantToSearch.
  ///
  /// In en, this message translates to:
  /// **'What do you want to search?'**
  String get dashboardWhatDoYouWantToSearch;

  /// No description provided for @dashboardSearchingResults.
  ///
  /// In en, this message translates to:
  /// **'Searching results...'**
  String get dashboardSearchingResults;

  /// No description provided for @dashboardStartingSearch.
  ///
  /// In en, this message translates to:
  /// **'Starting search...'**
  String get dashboardStartingSearch;

  /// No description provided for @dashboardSearchError.
  ///
  /// In en, this message translates to:
  /// **'Search error'**
  String get dashboardSearchError;

  /// No description provided for @dashboardNoResultsFound.
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get dashboardNoResultsFound;

  /// No description provided for @dashboardNoResultsWithFilters.
  ///
  /// In en, this message translates to:
  /// **'No results with these filters'**
  String get dashboardNoResultsWithFilters;

  /// No description provided for @dashboardTryDifferentTerms.
  ///
  /// In en, this message translates to:
  /// **'Try different terms'**
  String get dashboardTryDifferentTerms;

  /// No description provided for @dashboardScrollToLoadMore.
  ///
  /// In en, this message translates to:
  /// **'Scroll to load more'**
  String get dashboardScrollToLoadMore;

  /// No description provided for @dashboardTotalResults.
  ///
  /// In en, this message translates to:
  /// **'{total} results'**
  String dashboardTotalResults(int total);

  /// No description provided for @dashboardFilteredResults.
  ///
  /// In en, this message translates to:
  /// **'{filtered} of {total} results'**
  String dashboardFilteredResults(int filtered, int total);

  /// No description provided for @dashboardResultsAvailable.
  ///
  /// In en, this message translates to:
  /// **'{count} available'**
  String dashboardResultsAvailable(int count);

  /// No description provided for @dashboardGuestMode.
  ///
  /// In en, this message translates to:
  /// **'Guest Mode'**
  String get dashboardGuestMode;

  /// No description provided for @dashboardThisSessionOnly.
  ///
  /// In en, this message translates to:
  /// **'This session only'**
  String get dashboardThisSessionOnly;

  /// No description provided for @dashboardRepeatSearch.
  ///
  /// In en, this message translates to:
  /// **'Repeat search'**
  String get dashboardRepeatSearch;

  /// No description provided for @searchFilters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get searchFilters;

  /// No description provided for @searchApplyFilters.
  ///
  /// In en, this message translates to:
  /// **'Apply filters'**
  String get searchApplyFilters;

  /// No description provided for @searchClearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get searchClearFilters;

  /// No description provided for @searchSortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort by:'**
  String get searchSortBy;

  /// No description provided for @searchSort.
  ///
  /// In en, this message translates to:
  /// **'Sort'**
  String get searchSort;

  /// No description provided for @searchResetOrder.
  ///
  /// In en, this message translates to:
  /// **'Reset order'**
  String get searchResetOrder;

  /// No description provided for @searchSecondarySortCriteria.
  ///
  /// In en, this message translates to:
  /// **'+ Secondary sort:'**
  String get searchSecondarySortCriteria;

  /// No description provided for @searchSearchInResults.
  ///
  /// In en, this message translates to:
  /// **'Search in results...'**
  String get searchSearchInResults;

  /// No description provided for @searchSearchByTitle.
  ///
  /// In en, this message translates to:
  /// **'Search by title...'**
  String get searchSearchByTitle;

  /// No description provided for @searchSearchProducts.
  ///
  /// In en, this message translates to:
  /// **'Search products...'**
  String get searchSearchProducts;

  /// No description provided for @searchPriceRange.
  ///
  /// In en, this message translates to:
  /// **'Price range'**
  String get searchPriceRange;

  /// No description provided for @searchMaxDistance.
  ///
  /// In en, this message translates to:
  /// **'Maximum distance'**
  String get searchMaxDistance;

  /// No description provided for @searchNoLimit.
  ///
  /// In en, this message translates to:
  /// **'No limit'**
  String get searchNoLimit;

  /// No description provided for @searchPlatform.
  ///
  /// In en, this message translates to:
  /// **'Platform'**
  String get searchPlatform;

  /// No description provided for @searchAllPlatforms.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get searchAllPlatforms;

  /// No description provided for @searchShippable.
  ///
  /// In en, this message translates to:
  /// **'Shippable'**
  String get searchShippable;

  /// No description provided for @searchShipping.
  ///
  /// In en, this message translates to:
  /// **'Shipping'**
  String get searchShipping;

  /// No description provided for @searchPickupOnly.
  ///
  /// In en, this message translates to:
  /// **'Pickup only'**
  String get searchPickupOnly;

  /// No description provided for @searchSeller.
  ///
  /// In en, this message translates to:
  /// **'Seller'**
  String get searchSeller;

  /// No description provided for @searchPublished.
  ///
  /// In en, this message translates to:
  /// **'Published'**
  String get searchPublished;

  /// No description provided for @sortPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get sortPrice;

  /// No description provided for @sortPriceLowToHigh.
  ///
  /// In en, this message translates to:
  /// **'Price: low to high'**
  String get sortPriceLowToHigh;

  /// No description provided for @sortPriceHighToLow.
  ///
  /// In en, this message translates to:
  /// **'Price: high to low'**
  String get sortPriceHighToLow;

  /// No description provided for @sortPriceLowest.
  ///
  /// In en, this message translates to:
  /// **'Price (lowest)'**
  String get sortPriceLowest;

  /// No description provided for @sortDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get sortDate;

  /// No description provided for @sortDateNewest.
  ///
  /// In en, this message translates to:
  /// **'Date (newest)'**
  String get sortDateNewest;

  /// No description provided for @sortDateOldest.
  ///
  /// In en, this message translates to:
  /// **'Date: oldest'**
  String get sortDateOldest;

  /// No description provided for @sortDistance.
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get sortDistance;

  /// No description provided for @sortDistanceClosest.
  ///
  /// In en, this message translates to:
  /// **'Distance (closest)'**
  String get sortDistanceClosest;

  /// No description provided for @sortDistanceFarthest.
  ///
  /// In en, this message translates to:
  /// **'Distance: farthest'**
  String get sortDistanceFarthest;

  /// No description provided for @sortRelevance.
  ///
  /// In en, this message translates to:
  /// **'Relevance'**
  String get sortRelevance;

  /// No description provided for @sortPlatform.
  ///
  /// In en, this message translates to:
  /// **'Platform'**
  String get sortPlatform;

  /// No description provided for @filtersAndSort.
  ///
  /// In en, this message translates to:
  /// **'Filters & Sorting'**
  String get filtersAndSort;

  /// No description provided for @filtersTab.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get filtersTab;

  /// No description provided for @sortTab.
  ///
  /// In en, this message translates to:
  /// **'Sort'**
  String get sortTab;

  /// No description provided for @filterPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get filterPrice;

  /// No description provided for @filterShipping.
  ///
  /// In en, this message translates to:
  /// **'Shipping'**
  String get filterShipping;

  /// No description provided for @filterCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get filterCountry;

  /// No description provided for @filterCondition.
  ///
  /// In en, this message translates to:
  /// **'Condition'**
  String get filterCondition;

  /// No description provided for @filterDistance.
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get filterDistance;

  /// No description provided for @filterPlatforms.
  ///
  /// In en, this message translates to:
  /// **'Platforms'**
  String get filterPlatforms;

  /// No description provided for @shippingWithShipping.
  ///
  /// In en, this message translates to:
  /// **'With shipping'**
  String get shippingWithShipping;

  /// No description provided for @shippingInPerson.
  ///
  /// In en, this message translates to:
  /// **'In person'**
  String get shippingInPerson;

  /// No description provided for @shippingAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get shippingAll;

  /// No description provided for @sortAddCriterion.
  ///
  /// In en, this message translates to:
  /// **'Add criterion'**
  String get sortAddCriterion;

  /// No description provided for @sortDragToReorder.
  ///
  /// In en, this message translates to:
  /// **'Add and order criteria by priority'**
  String get sortDragToReorder;

  /// No description provided for @sortPriceLabel.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get sortPriceLabel;

  /// No description provided for @sortDateLabel.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get sortDateLabel;

  /// No description provided for @sortDistanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get sortDistanceLabel;

  /// No description provided for @sortAscending.
  ///
  /// In en, this message translates to:
  /// **'ascending'**
  String get sortAscending;

  /// No description provided for @sortDescending.
  ///
  /// In en, this message translates to:
  /// **'descending'**
  String get sortDescending;

  /// No description provided for @sortLowToHigh.
  ///
  /// In en, this message translates to:
  /// **'low to high'**
  String get sortLowToHigh;

  /// No description provided for @sortHighToLow.
  ///
  /// In en, this message translates to:
  /// **'high to low'**
  String get sortHighToLow;

  /// No description provided for @clearAll.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clearAll;

  /// No description provided for @applyFilters.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get applyFilters;

  /// No description provided for @dashboardResultsFound.
  ///
  /// In en, this message translates to:
  /// **'Results found'**
  String get dashboardResultsFound;

  /// No description provided for @evaluationLoadingEvaluation.
  ///
  /// In en, this message translates to:
  /// **'Loading evaluation...'**
  String get evaluationLoadingEvaluation;

  /// No description provided for @evaluationNotFound.
  ///
  /// In en, this message translates to:
  /// **'Evaluation not found'**
  String get evaluationNotFound;

  /// No description provided for @evaluationListingDetails.
  ///
  /// In en, this message translates to:
  /// **'Listing details'**
  String get evaluationListingDetails;

  /// No description provided for @evaluationViewFullListing.
  ///
  /// In en, this message translates to:
  /// **'View full listing'**
  String get evaluationViewFullListing;

  /// No description provided for @evaluationListingsFound.
  ///
  /// In en, this message translates to:
  /// **'Listings found'**
  String get evaluationListingsFound;

  /// No description provided for @evaluationFound.
  ///
  /// In en, this message translates to:
  /// **'Found'**
  String get evaluationFound;

  /// No description provided for @evaluationFiltered.
  ///
  /// In en, this message translates to:
  /// **'Filtered'**
  String get evaluationFiltered;

  /// No description provided for @evaluationDiscarded.
  ///
  /// In en, this message translates to:
  /// **'Discarded'**
  String get evaluationDiscarded;

  /// No description provided for @evaluationPlatforms.
  ///
  /// In en, this message translates to:
  /// **'Platforms'**
  String get evaluationPlatforms;

  /// No description provided for @evaluationRecommendedSellingPrices.
  ///
  /// In en, this message translates to:
  /// **'Recommended selling prices'**
  String get evaluationRecommendedSellingPrices;

  /// No description provided for @evaluationRequestDetails.
  ///
  /// In en, this message translates to:
  /// **'Request Details'**
  String get evaluationRequestDetails;

  /// No description provided for @evaluationSummary.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get evaluationSummary;

  /// No description provided for @evaluationBuying.
  ///
  /// In en, this message translates to:
  /// **'Buying'**
  String get evaluationBuying;

  /// No description provided for @evaluationSelling.
  ///
  /// In en, this message translates to:
  /// **'Selling'**
  String get evaluationSelling;

  /// No description provided for @evaluationProduct.
  ///
  /// In en, this message translates to:
  /// **'Product'**
  String get evaluationProduct;

  /// No description provided for @evaluationCondition.
  ///
  /// In en, this message translates to:
  /// **'Condition'**
  String get evaluationCondition;

  /// No description provided for @evaluationDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get evaluationDescription;

  /// No description provided for @evaluationAccessories.
  ///
  /// In en, this message translates to:
  /// **'Accessories'**
  String get evaluationAccessories;

  /// No description provided for @evaluationPhotos.
  ///
  /// In en, this message translates to:
  /// **'Photos'**
  String get evaluationPhotos;

  /// No description provided for @evaluationLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get evaluationLocation;

  /// No description provided for @evaluationUrgency.
  ///
  /// In en, this message translates to:
  /// **'Urgency'**
  String get evaluationUrgency;

  /// No description provided for @evaluationType.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get evaluationType;

  /// No description provided for @evaluationAvailable.
  ///
  /// In en, this message translates to:
  /// **'Available'**
  String get evaluationAvailable;

  /// No description provided for @adminRequests.
  ///
  /// In en, this message translates to:
  /// **'Requests'**
  String get adminRequests;

  /// No description provided for @adminContacts.
  ///
  /// In en, this message translates to:
  /// **'Contacts'**
  String get adminContacts;

  /// No description provided for @adminUsers.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get adminUsers;

  /// No description provided for @adminCountries.
  ///
  /// In en, this message translates to:
  /// **'Countries'**
  String get adminCountries;

  /// No description provided for @adminEditUserProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit User Profile'**
  String get adminEditUserProfile;

  /// No description provided for @adminEmailReadOnly.
  ///
  /// In en, this message translates to:
  /// **'Email (read-only)'**
  String get adminEmailReadOnly;

  /// No description provided for @adminDeleteUser.
  ///
  /// In en, this message translates to:
  /// **'Delete user'**
  String get adminDeleteUser;

  /// No description provided for @adminConfirmDelete.
  ///
  /// In en, this message translates to:
  /// **'Confirm Delete'**
  String get adminConfirmDelete;

  /// No description provided for @adminUserDeleted.
  ///
  /// In en, this message translates to:
  /// **'User deleted'**
  String get adminUserDeleted;

  /// No description provided for @adminMakeAdmin.
  ///
  /// In en, this message translates to:
  /// **'Make admin'**
  String get adminMakeAdmin;

  /// No description provided for @adminRemoveAdmin.
  ///
  /// In en, this message translates to:
  /// **'Remove admin'**
  String get adminRemoveAdmin;

  /// No description provided for @adminMakeUser.
  ///
  /// In en, this message translates to:
  /// **'Make user'**
  String get adminMakeUser;

  /// No description provided for @adminRemoveUser.
  ///
  /// In en, this message translates to:
  /// **'Remove user'**
  String get adminRemoveUser;

  /// No description provided for @adminChangeGroup.
  ///
  /// In en, this message translates to:
  /// **'Change Group'**
  String get adminChangeGroup;

  /// No description provided for @timeJustNow.
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get timeJustNow;

  /// No description provided for @timeMinutesAgo.
  ///
  /// In en, this message translates to:
  /// **'{mins} min ago'**
  String timeMinutesAgo(int mins);

  /// No description provided for @timeHoursAgo.
  ///
  /// In en, this message translates to:
  /// **'{hours} h ago'**
  String timeHoursAgo(int hours);

  /// No description provided for @timeDaysAgo.
  ///
  /// In en, this message translates to:
  /// **'{days} d ago'**
  String timeDaysAgo(int days);

  /// No description provided for @commonFieldRequired.
  ///
  /// In en, this message translates to:
  /// **'Required field'**
  String get commonFieldRequired;

  /// No description provided for @commonResults.
  ///
  /// In en, this message translates to:
  /// **'results'**
  String get commonResults;

  /// No description provided for @commonTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get commonTotal;

  /// No description provided for @commonBuy.
  ///
  /// In en, this message translates to:
  /// **'Buy'**
  String get commonBuy;

  /// No description provided for @commonSell.
  ///
  /// In en, this message translates to:
  /// **'Sell'**
  String get commonSell;

  /// No description provided for @footerRecaptchaProtected.
  ///
  /// In en, this message translates to:
  /// **'This site is protected by reCAPTCHA and the Google '**
  String get footerRecaptchaProtected;

  /// No description provided for @footerRecaptchaPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get footerRecaptchaPrivacy;

  /// No description provided for @footerRecaptchaAnd.
  ///
  /// In en, this message translates to:
  /// **' and '**
  String get footerRecaptchaAnd;

  /// No description provided for @footerRecaptchaTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get footerRecaptchaTerms;

  /// No description provided for @footerRecaptchaApply.
  ///
  /// In en, this message translates to:
  /// **' apply.'**
  String get footerRecaptchaApply;

  /// No description provided for @countrySpain.
  ///
  /// In en, this message translates to:
  /// **'Spain'**
  String get countrySpain;

  /// No description provided for @countryItaly.
  ///
  /// In en, this message translates to:
  /// **'Italy'**
  String get countryItaly;

  /// No description provided for @countryPortugal.
  ///
  /// In en, this message translates to:
  /// **'Portugal'**
  String get countryPortugal;

  /// No description provided for @countryFrance.
  ///
  /// In en, this message translates to:
  /// **'France'**
  String get countryFrance;

  /// No description provided for @countryGermany.
  ///
  /// In en, this message translates to:
  /// **'Germany'**
  String get countryGermany;

  /// No description provided for @searchingIn.
  ///
  /// In en, this message translates to:
  /// **'Searching in {platform}...'**
  String searchingIn(String platform);

  /// No description provided for @dashboardApplyingFilters.
  ///
  /// In en, this message translates to:
  /// **'Applying filters...'**
  String get dashboardApplyingFilters;

  /// No description provided for @navDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// No description provided for @guestModeBannerTitle.
  ///
  /// In en, this message translates to:
  /// **'Guest Mode'**
  String get guestModeBannerTitle;

  /// No description provided for @guestModeBannerMessage.
  ///
  /// In en, this message translates to:
  /// **'Sign up for free to access advanced searches, sales analysis and more features'**
  String get guestModeBannerMessage;

  /// No description provided for @guestModeBannerCTA.
  ///
  /// In en, this message translates to:
  /// **'Sign up for free'**
  String get guestModeBannerCTA;

  /// No description provided for @guestModeBannerRest.
  ///
  /// In en, this message translates to:
  /// **' to access advanced searches, sales analysis and more features'**
  String get guestModeBannerRest;

  /// No description provided for @guestModeSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get guestModeSignUp;

  /// No description provided for @registrationModalTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign up to continue'**
  String get registrationModalTitle;

  /// No description provided for @registrationModalDefault.
  ///
  /// In en, this message translates to:
  /// **'Sign up to access all platform features.'**
  String get registrationModalDefault;

  /// No description provided for @registrationModalBenefitsTitle.
  ///
  /// In en, this message translates to:
  /// **'With an account you can:'**
  String get registrationModalBenefitsTitle;

  /// No description provided for @registrationModalBenefit1.
  ///
  /// In en, this message translates to:
  /// **'Advanced and intelligent searches'**
  String get registrationModalBenefit1;

  /// No description provided for @registrationModalBenefit2.
  ///
  /// In en, this message translates to:
  /// **'Product sales analysis'**
  String get registrationModalBenefit2;

  /// No description provided for @registrationModalBenefit3.
  ///
  /// In en, this message translates to:
  /// **'Save favorites and archive searches'**
  String get registrationModalBenefit3;

  /// No description provided for @registrationModalBenefit4.
  ///
  /// In en, this message translates to:
  /// **'Complete search history'**
  String get registrationModalBenefit4;

  /// No description provided for @registrationModalSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up for free'**
  String get registrationModalSignUp;

  /// No description provided for @registrationModalLater.
  ///
  /// In en, this message translates to:
  /// **'Maybe later'**
  String get registrationModalLater;

  /// No description provided for @registrationModalAdvancedSearch.
  ///
  /// In en, this message translates to:
  /// **'Activate advanced search to better filter your results.'**
  String get registrationModalAdvancedSearch;

  /// No description provided for @advancedSearchPromoTitle.
  ///
  /// In en, this message translates to:
  /// **'Improve these results with Advanced Search'**
  String get advancedSearchPromoTitle;

  /// No description provided for @advancedSearchPromoBenefit1.
  ///
  /// In en, this message translates to:
  /// **'Remove unexpected results related to your search for {searchTerm}'**
  String advancedSearchPromoBenefit1(String searchTerm);

  /// No description provided for @advancedSearchPromoBenefit2.
  ///
  /// In en, this message translates to:
  /// **'Find advanced filters for your results'**
  String get advancedSearchPromoBenefit2;

  /// No description provided for @advancedSearchPromoBenefit3.
  ///
  /// In en, this message translates to:
  /// **'Create alerts for new offers'**
  String get advancedSearchPromoBenefit3;

  /// No description provided for @advancedSearchPromoActivate.
  ///
  /// In en, this message translates to:
  /// **'Activate advanced'**
  String get advancedSearchPromoActivate;

  /// No description provided for @advancedSearchPromoNotNow.
  ///
  /// In en, this message translates to:
  /// **'Not now'**
  String get advancedSearchPromoNotNow;

  /// No description provided for @restrictedSell.
  ///
  /// In en, this message translates to:
  /// **'Sales searches require a registered account'**
  String get restrictedSell;

  /// No description provided for @restrictedFavorites.
  ///
  /// In en, this message translates to:
  /// **'Favorites require a registered account'**
  String get restrictedFavorites;

  /// No description provided for @restrictedProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile requires a registered account'**
  String get restrictedProfile;

  /// No description provided for @dashboardSmartSearches.
  ///
  /// In en, this message translates to:
  /// **'Your Smart Searches'**
  String get dashboardSmartSearches;

  /// No description provided for @dashboardSmartSearchesDescription.
  ///
  /// In en, this message translates to:
  /// **'From Buy you have two types of search:'**
  String get dashboardSmartSearchesDescription;

  /// No description provided for @dashboardClassicSearch.
  ///
  /// In en, this message translates to:
  /// **'Classic'**
  String get dashboardClassicSearch;

  /// No description provided for @dashboardClassicSearchDescription.
  ///
  /// In en, this message translates to:
  /// **'Everything in one click.'**
  String get dashboardClassicSearchDescription;

  /// No description provided for @dashboardIntelligentSearch.
  ///
  /// In en, this message translates to:
  /// **'Intelligent'**
  String get dashboardIntelligentSearch;

  /// No description provided for @dashboardIntelligentSearchDescription.
  ///
  /// In en, this message translates to:
  /// **'Straight to what you want, no fuss.'**
  String get dashboardIntelligentSearchDescription;

  /// No description provided for @dashboardStartBuying.
  ///
  /// In en, this message translates to:
  /// **'Go to Buy'**
  String get dashboardStartBuying;

  /// No description provided for @dashboardSalesAnalysis.
  ///
  /// In en, this message translates to:
  /// **'Your Sales Analysis'**
  String get dashboardSalesAnalysis;

  /// No description provided for @dashboardSalesDescription.
  ///
  /// In en, this message translates to:
  /// **'Analyze the market to know what price to sell your product.'**
  String get dashboardSalesDescription;

  /// No description provided for @dashboardStartSelling.
  ///
  /// In en, this message translates to:
  /// **'Go to Sell'**
  String get dashboardStartSelling;

  /// No description provided for @dashboardSignUpToSell.
  ///
  /// In en, this message translates to:
  /// **'Sign up to sell'**
  String get dashboardSignUpToSell;

  /// No description provided for @dashboardConfiguredAlerts.
  ///
  /// In en, this message translates to:
  /// **'Configured alerts'**
  String get dashboardConfiguredAlerts;

  /// No description provided for @dashboardMarketAlertsDescription.
  ///
  /// In en, this message translates to:
  /// **'Automatic market alerts. Activate them and you won\'t be surprised \'Oh no! Someone posted one cheaper than yours\''**
  String get dashboardMarketAlertsDescription;

  /// No description provided for @dashboardOfferAlertsDescription.
  ///
  /// In en, this message translates to:
  /// **'Automatic market offer alerts. Activate them and we\'ll notify you if someone sells that Bicycle you want so much'**
  String get dashboardOfferAlertsDescription;

  /// No description provided for @dashboardNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get dashboardNotifications;

  /// No description provided for @dashboardNoNotifications.
  ///
  /// In en, this message translates to:
  /// **'You have no pending notifications'**
  String get dashboardNoNotifications;

  /// No description provided for @dashboardNoFavorites.
  ///
  /// In en, this message translates to:
  /// **'You have no saved favorites'**
  String get dashboardNoFavorites;

  /// No description provided for @dashboardSignUpForFavorites.
  ///
  /// In en, this message translates to:
  /// **'Sign up to save favorites'**
  String get dashboardSignUpForFavorites;

  /// No description provided for @dashboardNoBuySearches.
  ///
  /// In en, this message translates to:
  /// **'You don\'t have any buy searches yet'**
  String get dashboardNoBuySearches;

  /// No description provided for @dashboardNoSellSearches.
  ///
  /// In en, this message translates to:
  /// **'You don\'t have any sell searches yet'**
  String get dashboardNoSellSearches;

  /// No description provided for @buyEmptyStateTitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us what you\'re looking for'**
  String get buyEmptyStateTitle;

  /// No description provided for @buyEmptyStateDescription.
  ///
  /// In en, this message translates to:
  /// **'Tell us what you\'re looking for and Pricofy will search all second-hand platforms, focusing on the best result for you.'**
  String get buyEmptyStateDescription;

  /// No description provided for @buyEmptyStateNote.
  ///
  /// In en, this message translates to:
  /// **'Because if you\'re looking for an iPhone, you don\'t want to see headphones, empty boxes, or Spiderman cases 😉'**
  String get buyEmptyStateNote;

  /// No description provided for @searchProgressSearching.
  ///
  /// In en, this message translates to:
  /// **'Searching offers...'**
  String get searchProgressSearching;

  /// No description provided for @searchProgressAnalyzing.
  ///
  /// In en, this message translates to:
  /// **'Analyzing prices...'**
  String get searchProgressAnalyzing;

  /// No description provided for @searchProgressFinding.
  ///
  /// In en, this message translates to:
  /// **'Finding the best deals...'**
  String get searchProgressFinding;

  /// No description provided for @searchProgressAlmostDone.
  ///
  /// In en, this message translates to:
  /// **'Almost done...'**
  String get searchProgressAlmostDone;

  /// No description provided for @detectingLocation.
  ///
  /// In en, this message translates to:
  /// **'Detecting location...'**
  String get detectingLocation;

  /// No description provided for @locationSourcePostalCentroid.
  ///
  /// In en, this message translates to:
  /// **'Precise location (GPS/postal code)'**
  String get locationSourcePostalCentroid;

  /// No description provided for @locationSourceCapitalFallback.
  ///
  /// In en, this message translates to:
  /// **'Approximate (country capital)'**
  String get locationSourceCapitalFallback;

  /// No description provided for @locationSourceIpApproximate.
  ///
  /// In en, this message translates to:
  /// **'Approximate (IP detection)'**
  String get locationSourceIpApproximate;

  /// No description provided for @locationSourceFallback.
  ///
  /// In en, this message translates to:
  /// **'Default location'**
  String get locationSourceFallback;

  /// No description provided for @sectionAllResults.
  ///
  /// In en, this message translates to:
  /// **'All results'**
  String get sectionAllResults;

  /// No description provided for @sectionNearest.
  ///
  /// In en, this message translates to:
  /// **'Nearest'**
  String get sectionNearest;

  /// No description provided for @sectionCheapest.
  ///
  /// In en, this message translates to:
  /// **'Cheapest'**
  String get sectionCheapest;

  /// No description provided for @filterExtras.
  ///
  /// In en, this message translates to:
  /// **'Extras'**
  String get filterExtras;

  /// No description provided for @filterExtrasWarranty.
  ///
  /// In en, this message translates to:
  /// **'With warranty only'**
  String get filterExtrasWarranty;

  /// No description provided for @filterExtrasWarrantyDesc.
  ///
  /// In en, this message translates to:
  /// **'Products with official warranty'**
  String get filterExtrasWarrantyDesc;

  /// No description provided for @filterExtrasInvoice.
  ///
  /// In en, this message translates to:
  /// **'With invoice'**
  String get filterExtrasInvoice;

  /// No description provided for @filterExtrasInvoiceDesc.
  ///
  /// In en, this message translates to:
  /// **'Products with purchase invoice'**
  String get filterExtrasInvoiceDesc;

  /// No description provided for @filterExtrasBuyerProtection.
  ///
  /// In en, this message translates to:
  /// **'Buyer protection'**
  String get filterExtrasBuyerProtection;

  /// No description provided for @filterExtrasBuyerProtectionDesc.
  ///
  /// In en, this message translates to:
  /// **'Platforms with return guarantee'**
  String get filterExtrasBuyerProtectionDesc;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
        'de',
        'en',
        'es',
        'fr',
        'it',
        'pt'
      ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'de':
      return AppLocalizationsDe();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fr':
      return AppLocalizationsFr();
    case 'it':
      return AppLocalizationsIt();
    case 'pt':
      return AppLocalizationsPt();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
