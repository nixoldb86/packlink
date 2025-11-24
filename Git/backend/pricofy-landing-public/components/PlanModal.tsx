'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Botón cerrar X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Texto informativo */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {language === 'es' ? 'Muchas gracias por tu interés' : 'Thank you for your interest'}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {language === 'es' 
                ? 'Aún estamos preparando los planes. Déjanos un mensaje y te avisaremos cuando estén listos.'
                : 'We are still preparing the plans. Leave us a message and we will notify you when they are ready.'}
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!formData.email) return
              
              setIsSubmitting(true)
              // Aquí iría la lógica de envío del formulario
              // Por ahora solo cerramos el modal después de un delay
              setTimeout(() => {
                setIsSubmitting(false)
                onClose()
                setFormData({ email: '', phone: '', comment: '' })
                alert(language === 'es' ? '¡Gracias! Te contactaremos pronto.' : 'Thank you! We will contact you soon.')
              }, 1000)
            }}
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'es' ? 'Email' : 'Email'} <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'es' ? 'Teléfono' : 'Phone'}
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder={language === 'es' ? '+34 600 000 000' : '+1 234 567 890'}
              />
            </div>

            {/* Comentario */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'es' ? 'Comentario' : 'Comment'}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder={language === 'es' ? 'Déjanos tu mensaje...' : 'Leave us your message...'}
              />
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.email}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting 
                ? (language === 'es' ? 'Enviando...' : 'Sending...')
                : (language === 'es' ? 'Enviar' : 'Send')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

