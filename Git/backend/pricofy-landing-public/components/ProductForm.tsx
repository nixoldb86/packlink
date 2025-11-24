'use client'

import React, { useState, useEffect } from 'react'
import { validateEmail } from '@/lib/emailValidator'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { useAuth } from '@/contexts/AuthContext'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  initialAction?: 'vender' | 'comprar'
  initialProduct?: string
}

// La validación de email se importa desde lib/emailValidator.ts

export default function ProductForm({ isOpen, onClose, initialAction, initialProduct }: ProductFormProps) {
  const { language } = useLanguage()
  const { user } = useAuth()
  const t = (key: string) => getTranslation(language, key)
  
  // Traducciones para valores internos del formulario
  const actionSellValue = language === 'es' ? 'quiero vender un producto' : 'I want to sell a product'
  const actionBuyValue = language === 'es' ? 'quiero comprar al mejor precio' : 'I want to buy at the best price'
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    accion: initialAction === 'vender' ? actionSellValue : initialAction === 'comprar' ? actionBuyValue : '',
    modeloMarca: initialProduct || '',
    fotos: null as FileList | null,
  })
  
  // Estado para previsualizar imágenes
  const [previewImages, setPreviewImages] = useState<string[]>([])
  
  // Actualizar modeloMarca cuando cambia initialProduct
  useEffect(() => {
    if (initialProduct && isOpen) {
      setFormData(prev => ({ ...prev, modeloMarca: initialProduct }))
    }
  }, [initialProduct, isOpen])

  // Actualizar accion cuando cambia initialAction o se abre el modal
  useEffect(() => {
    if (isOpen) {
      const newAccion = initialAction === 'vender' ? actionSellValue : initialAction === 'comprar' ? actionBuyValue : ''
      setFormData(prev => ({ ...prev, accion: newAccion }))
    }
  }, [initialAction, isOpen, actionSellValue, actionBuyValue])
  
  // Actualizar email cuando el usuario se autentica
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user, formData.email])
  
  // Actualizar valores cuando cambia el idioma
  useEffect(() => {
    const oldSellValue = language === 'es' ? 'I want to sell a product' : 'quiero vender un producto'
    const oldBuyValue = language === 'es' ? 'I want to buy at the best price' : 'quiero comprar al mejor precio'
    
    if (formData.accion === oldSellValue) {
      setFormData(prev => ({ ...prev, accion: actionSellValue }))
    } else if (formData.accion === oldBuyValue) {
      setFormData(prev => ({ ...prev, accion: actionBuyValue }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])
  
  // Limpiar previsualizaciones cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setPreviewImages([])
    }
  }, [isOpen])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // La función validateEmail ahora se importa desde lib/emailValidator.ts

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleActionChange = (action: string) => {
    setFormData(prev => ({ ...prev, accion: action }))
    
    // Si cambia la acción, limpiar fotos si no es "vender"
    if (action !== actionSellValue) {
      setFormData(prev => ({ ...prev, fotos: null }))
    }
    
    // Limpiar error de acción
    if (errors.accion) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.accion
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 6) {
      setErrors(prev => ({ ...prev, fotos: t('form.errors.photosMaxFiles') }))
      return
    }
    setFormData(prev => ({ ...prev, fotos: files }))
    
    // Crear previsualizaciones
    if (files) {
      const fileArray = Array.from(files)
      const previewPromises = fileArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(previewPromises).then(previews => {
        setPreviewImages(previews)
      })
    } else {
      setPreviewImages([])
    }
    
    if (errors.fotos) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.fotos
        return newErrors
      })
    }
  }
  
  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    if (previewImages.length === 0) return
    
    // Actualizar previsualizaciones primero (esto actualizará el contador)
    const newPreviews = previewImages.filter((_, i) => i !== index)
    
    // Actualizar el FileList si hay fotos
    let newFileList: FileList | null = null
    if (formData.fotos && formData.fotos.length > 0) {
      const dt = new DataTransfer()
      const files = Array.from(formData.fotos)
      files.forEach((file, i) => {
        if (i !== index) {
          dt.items.add(file)
        }
      })
      newFileList = dt.files.length > 0 ? dt.files : null
    }
    
    // Actualizar ambos estados de forma síncrona
    setPreviewImages(newPreviews)
    setFormData(prev => ({ ...prev, fotos: newFileList }))
    
    // Actualizar el input file para mantener sincronización
    const fileInput = document.getElementById('fotos') as HTMLInputElement
    if (fileInput) {
      if (newFileList) {
        fileInput.files = newFileList
      } else {
        // Si no hay archivos, resetear el input
        fileInput.value = ''
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar email (solo si no está logueado)
    if (!user) {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || t('form.errors.emailInvalid')
      }
    }

    // Validar campos obligatorios
    if (!formData.accion) newErrors.accion = t('form.errors.actionRequired')
    // Solo validar modeloMarca si no es modo vender desde dashboard
    if (initialAction !== 'vender' && !formData.modeloMarca) newErrors.modeloMarca = t('form.errors.modelBrandRequired')

    // Si quiere vender, las fotos son obligatorias
    if (formData.accion === actionSellValue) {
      if (!formData.fotos || formData.fotos.length === 0) {
        newErrors.fotos = t('form.errors.photosRequired')
      } else if (formData.fotos.length > 6) {
        newErrors.fotos = t('form.errors.photosMax')
      }
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
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email || user?.email || '')
      formDataToSend.append('pais', 'España') // Valor por defecto
      formDataToSend.append('ciudad', '') // Valor por defecto
      formDataToSend.append('accion', formData.accion)
      formDataToSend.append('tipoProducto', 'general') // Valor por defecto
      formDataToSend.append('modeloMarca', formData.modeloMarca)
      formDataToSend.append('estado', 'buen_estado') // Valor por defecto
      formDataToSend.append('accesorios', '') // Valor por defecto
      formDataToSend.append('urgencia', t('form.urgencyFast')) // Valor por defecto
      formDataToSend.append('language', language) // Enviar idioma para el email

      if (formData.fotos) {
        for (let i = 0; i < formData.fotos.length; i++) {
          formDataToSend.append('fotos', formData.fotos[i])
        }
      }

      const response = await fetch('/api/submit-request', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Usar el mensaje del backend directamente (ya incluye el límite dinámico si está configurado)
        // Si no hay mensaje, usar la traducción por defecto
        let errorMessage = errorData.error || t('form.errors.submitError')
        // Si es el error de límite diario pero el mensaje del backend no está disponible, usar la traducción
        if (errorData.errorCode === 'ONE_PER_DAY' && !errorData.error) {
          errorMessage = t('form.errors.onePerDay')
        }
        throw new Error(errorMessage)
      }

      setSubmitSuccess(true)
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          email: user?.email || '',
          accion: '',
          modeloMarca: '',
          fotos: null,
        })
        setPreviewImages([])
        setSubmitSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: t('form.errors.submitError') })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {initialAction === 'vender' 
              ? (language === 'es' ? 'Fotografías de tu producto' : 'Product photos')
              : (language === 'es' ? 'Nueva búsqueda' : 'New evaluation')
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Modo simplificado para vender desde dashboard */}
          {initialAction === 'vender' ? (
            <>
              {/* Fotos */}
              <div>
                <input
                  type="file"
                  id="fotos"
                  name="fotos"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 text-sm
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md
                    hover:border-gray-400 hover:shadow-sm
                    ${errors.fotos ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                    text-gray-900`}
                />
                {previewImages.length > 0 && (
                  <p key={`counter-${previewImages.length}`} className="mt-2 text-sm text-gray-600">
                    {previewImages.length} {previewImages.length === 1 
                      ? (language === 'es' ? 'foto seleccionada' : 'photo selected')
                      : (language === 'es' ? 'fotos seleccionadas' : 'photos selected')
                    }
                  </p>
                )}
                {errors.fotos && <p className="mt-1 text-sm text-red-500">{errors.fotos}</p>}
                
                {/* Previsualización de imágenes */}
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md z-10"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Email - Solo mostrar si no está logueado */}
              {!user && (
                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-1">
                    {t('form.email')} <span className="text-red-500">{t('form.required')}</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-full transition-all duration-200 text-sm
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md
                      hover:border-gray-400 hover:shadow-sm
                      ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary-500'}
                      text-gray-900`}
                    placeholder={t('form.emailPlaceholder')}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              )}

              {/* Modelo / Marca */}
              <div>
                <label htmlFor="modeloMarca" className="block text-base font-semibold text-gray-700 mb-1">
                  {t('form.modelBrand')} <span className="text-red-500">{t('form.required')}</span>
                </label>
                <input
                  type="text"
                  id="modeloMarca"
                  name="modeloMarca"
                  value={formData.modeloMarca}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-full transition-all duration-200 text-sm
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md
                    hover:border-gray-400 hover:shadow-sm
                    ${errors.modeloMarca ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary-500'}
                    text-gray-900`}
                  placeholder={t('form.modelBrandPlaceholder')}
                />
                {errors.modeloMarca && <p className="mt-1 text-sm text-red-500">{errors.modeloMarca}</p>}
              </div>

              {/* ¿Qué quieres hacer? - Estilo píldora */}
              <div className="w-full">
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  {t('form.action')} <span className="text-red-500">{t('form.required')}</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleActionChange(actionSellValue)}
                    className={`flex-1 px-6 py-4 rounded-full font-semibold text-base transition-all duration-200 ${
                      formData.accion === actionSellValue
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    } ${errors.accion ? 'border-red-500' : ''}`}
                  >
                    {language === 'es' ? 'Vender' : 'Sell'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionChange(actionBuyValue)}
                    className={`flex-1 px-6 py-4 rounded-full font-semibold text-base transition-all duration-200 ${
                      formData.accion === actionBuyValue
                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    } ${errors.accion ? 'border-red-500' : ''}`}
                  >
                    {language === 'es' ? 'Comprar' : 'Buy'}
                  </button>
                </div>
                {errors.accion && <p className="mt-2 text-sm text-red-500">{errors.accion}</p>}
              </div>

              {/* Fotos - Solo mostrar si quiere vender */}
              {formData.accion === actionSellValue && (
                <div>
                  <label htmlFor="fotos" className="block text-base font-semibold text-gray-700 mb-1">
                    {t('form.photos')} <span className="text-red-500">{t('form.required')}</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({language === 'es' ? 'Máximo 6 imágenes' : 'Max 6 images'})
                    </span>
                  </label>
                  <input
                    type="file"
                    id="fotos"
                    name="fotos"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 text-sm
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md
                      hover:border-gray-400 hover:shadow-sm
                      ${errors.fotos ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                      text-gray-900`}
                  />
                  {formData.fotos && formData.fotos.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.fotos.length} {t('form.photosSelected')}
                    </p>
                  )}
                  {errors.fotos && <p className="mt-1 text-sm text-red-500">{errors.fotos}</p>}
                </div>
              )}
            </>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {t('form.success')}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (language === 'es' ? 'Enviando...' : 'Sending...')
                : (language === 'es' ? 'Enviar evaluación' : 'Send evaluation')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
