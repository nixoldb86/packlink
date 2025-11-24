'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { getTranslation } from '@/lib/translations'
import LanguageSelector from './LanguageSelector'
import UserMenu from './UserMenu'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language } = useLanguage()
  const { user } = useAuth()
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const t = (key: string) => getTranslation(language, key)

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              {/* Logo: Imagen del logo de Pricofy */}
              <Image
                src="/images/logo_sin_Fondo.PNG"
                alt="Pricofy Logo"
                width={120}
                height={40}
                className="object-contain h-10 w-auto"
                priority
                unoptimized
              />
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/caracteristicas" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navbar.features')}
            </a>
            <a href="/pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navbar.pricing')}
            </a>
            <a href="/contacto" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navbar.contact')}
            </a>
            <LanguageSelector />
            <UserMenu />
          </div>

          {/* Mobile Menu Button and Language Selector */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a href="/caracteristicas" className="block text-gray-700 hover:text-primary-600">
              {t('navbar.features')}
            </a>
            <a href="/pricing" className="block text-gray-700 hover:text-primary-600">
              {t('navbar.pricing')}
            </a>
            <a href="/contacto" className="block text-gray-700 hover:text-primary-600">
              {t('navbar.contact')}
            </a>
            {!user && (
              <div>
                <UserMenu />
              </div>
            )}
            {user && (
              <a href="/dashboard" className="block text-gray-700 hover:text-primary-600">
                {language === 'es' ? 'Mi Dashboard' : 'My Dashboard'}
              </a>
            )}
            {user && isDashboard && (
              <div className="flex justify-center">
                <UserMenu />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
