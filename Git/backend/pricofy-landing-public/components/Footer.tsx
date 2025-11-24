'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'

export default function Footer() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">Pricofy</h3>
            <p className="text-sm">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/caracteristicas" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.documentation')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a></li>
              <li><a href="/contacto" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Pricofy. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
