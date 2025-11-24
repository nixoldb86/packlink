'use client'

import { useState } from 'react'
import { validateEmail } from '@/lib/emailValidator'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    comentario: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = t('contact.errors.nameRequired')
    }

    // Validar email
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || t('contact.errors.emailInvalid')
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = t('contact.errors.phoneRequired')
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = t('contact.errors.phoneInvalid')
    }

    // Validar comentario
    if (!formData.comentario.trim()) {
      newErrors.comentario = t('contact.errors.commentRequired')
    } else if (formData.comentario.trim().length < 10) {
      newErrors.comentario = t('contact.errors.commentMinLength')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          comentario: formData.comentario.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('contact.errors.submitError'))
      }
      
      setSubmitSuccess(true)
      
      // Resetear formulario después de 3 segundos y cerrar modal
      setTimeout(() => {
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          comentario: '',
        })
        setSubmitSuccess(false)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: error instanceof Error ? error.message : t('contact.errors.submitError') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        comentario: '',
      })
      setErrors({})
      setSubmitSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('contact.sendMessage')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="contact-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              {t('contact.name')} <span className="text-red-500">{t('contact.required')}</span>
            </label>
            <input
              type="text"
              id="contact-nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('contact.namePlaceholder')}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('contact.email')} <span className="text-red-500">{t('contact.required')}</span>
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('contact.emailPlaceholder')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="contact-telefono" className="block text-sm font-medium text-gray-700 mb-1">
              {t('contact.phoneLabel')} <span className="text-red-500">{t('contact.required')}</span>
            </label>
            <input
              type="tel"
              id="contact-telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('contact.phonePlaceholder')}
            />
            {errors.telefono && <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>}
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="contact-comentario" className="block text-sm font-medium text-gray-700 mb-1">
              {t('contact.comment')} <span className="text-red-500">{t('contact.required')}</span>
            </label>
            <textarea
              id="contact-comentario"
              name="comentario"
              value={formData.comentario}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.comentario ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('contact.commentPlaceholder')}
            />
            {errors.comentario && <p className="mt-1 text-sm text-red-500">{errors.comentario}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {t('contact.success')}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('contact.sending') : (language === 'es' ? 'Enviar' : 'Send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

