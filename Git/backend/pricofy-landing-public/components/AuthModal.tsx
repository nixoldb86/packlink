'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithOtp, verifyOtp } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const t = (key: string) => getTranslation(language, key)

  const [isLogin, setIsLogin] = useState(true)
  const [useOtp, setUseOtp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isLogin && useOtp) {
        // Si estamos en modo OTP y el código ya fue enviado, verificamos el código
        if (otpSent) {
          const { error } = await verifyOtp(email, otpCode)
          if (error) {
            setError(error.message || t('auth.errors.otpVerifyFailed'))
          } else {
            setSuccess(t('auth.success.otpVerified'))
            setTimeout(() => {
              onClose()
              router.push('/dashboard')
            }, 1000)
          }
        } else {
          // Si el código no ha sido enviado, lo enviamos
          const { error } = await signInWithOtp(email)
          if (error) {
            setError(error.message || t('auth.errors.otpSendFailed'))
          } else {
            setOtpSent(true)
            setSuccess(t('auth.success.otpSent'))
          }
        }
      } else if (isLogin) {
        // Login con contraseña
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setError(error.message || t('auth.errors.signInFailed'))
        } else {
          onClose()
          router.push('/dashboard')
        }
      } else {
        // Registro con contraseña
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setError(error.message || t('auth.errors.signUpFailed'))
        } else {
          setSuccess(t('auth.success.signUp'))
          // Después del registro exitoso, también redirigir al dashboard
          setTimeout(() => {
            onClose()
            router.push('/dashboard')
          }, 1500)
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setSuccess(null)
    setOtpCode('')
    setLoading(true)

    try {
      const { error } = await signInWithOtp(email)
      if (error) {
        setError(error.message || t('auth.errors.otpSendFailed'))
      } else {
        setSuccess(t('auth.success.otpSent'))
      }
    } catch (err: any) {
      setError(err.message || t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      // Google sign in redirige automáticamente, pero cerramos el modal por si acaso
      onClose()
    } catch (err: any) {
      setError(err.message || t('auth.errors.googleSignInFailed'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLogin && useOtp
              ? t('auth.otp.title')
              : isLogin
              ? t('auth.login.title')
              : t('auth.signUp.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 sm:p-8">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
              {success}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full mb-4 px-4 sm:px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-3 font-medium text-gray-700 text-sm sm:text-base touch-manipulation"
          >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('auth.googleSignIn')}
        </button>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.or')}</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent && useOtp}
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {isLogin && useOtp && otpSent ? (
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.otp.codePlaceholder')}
                </label>
                <input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {t('auth.otp.resendCode')}
                </button>
              </div>
            ) : (
              !useOtp && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </div>
              )
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading
                ? t('auth.loading')
                : isLogin && useOtp
                ? otpSent
                  ? t('auth.otp.verifyCode')
                  : t('auth.otp.sendCode')
                : isLogin
                ? t('auth.login.button')
                : t('auth.signUp.button')}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 space-y-2 text-center">
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setUseOtp(!useOtp)
                  setOtpSent(false)
                  setOtpCode('')
                  setError(null)
                  setSuccess(null)
                }}
                className="block w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2 px-3 touch-manipulation"
              >
                {useOtp ? t('auth.otp.switchToPassword') : t('auth.otp.switchToOtp')}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setUseOtp(false)
                setOtpSent(false)
                setOtpCode('')
                setError(null)
                setSuccess(null)
              }}
              className="block w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2 px-3 touch-manipulation"
            >
              {isLogin ? t('auth.switchToSignUp') : t('auth.switchToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

