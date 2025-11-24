'use client'

// Forzar que esta página sea dinámica
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface Solicitud {
  id: number
  email: string
  pais: string
  ciudad: string
  accion: string
  tipo_producto: string
  modelo_marca: string
  estado: string
  accesorios: string | null
  urgencia: string | null
  fotos_paths: string | null
  created_at: string
}

interface Contacto {
  id: number
  nombre: string
  email: string
  telefono: string
  comentario: string
  created_at: string
}

type TabType = 'solicitudes' | 'contactos'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('solicitudes')
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchSolicitudes()
    } else {
      fetchContactos()
    }
  }, [activeTab])

  const fetchSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/solicitudes')
      const data = await response.json()
      
      if (response.ok) {
        setSolicitudes(Array.isArray(data) ? data : data.data || [])
      } else {
        setError(data.error || 'Error al cargar las solicitudes')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContactos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/contactos')
      const data = await response.json()
      
      if (response.ok) {
        setContactos(Array.isArray(data) ? data : data.data || [])
      } else {
        setError(data.error || 'Error al cargar los contactos')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const parseFotos = (fotosPaths: string | null): string[] => {
    if (!fotosPaths) return []
    try {
      return JSON.parse(fotosPaths)
    } catch {
      return []
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            
            {/* Tabs */}
            <div className="mt-4 flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'solicitudes'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Solicitudes ({solicitudes.length})
              </button>
              <button
                onClick={() => setActiveTab('contactos')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'contactos'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Contactos ({contactos.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">
                Cargando {activeTab === 'solicitudes' ? 'solicitudes' : 'contactos'}...
              </p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={activeTab === 'solicitudes' ? fetchSolicitudes : fetchContactos}
                  className="mt-4 btn-primary"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : activeTab === 'solicitudes' ? (
            <>
              {solicitudes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No hay solicitudes registradas aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {solicitudes.map((solicitud) => {
                        const fotos = parseFotos(solicitud.fotos_paths)
                        return (
                          <tr key={solicitud.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{solicitud.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {solicitud.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {solicitud.ciudad}, {solicitud.pais}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                solicitud.accion === 'quiero vender un producto'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {solicitud.accion === 'quiero vender un producto' ? 'Vender' : 'Comprar'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{solicitud.modelo_marca}</div>
                                <div className="text-xs text-gray-500">{solicitud.tipo_producto}</div>
                                {fotos.length > 0 && (
                                  <div className="mt-1 text-xs text-primary-600">
                                    {fotos.length} foto(s)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {solicitud.estado}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {solicitud.urgencia || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(solicitud.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {contactos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No hay contactos registrados aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comentario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactos.map((contacto) => (
                        <tr key={contacto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{contacto.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contacto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contacto.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contacto.telefono}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                            <div className="truncate" title={contacto.comentario}>
                              {contacto.comentario}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contacto.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={activeTab === 'solicitudes' ? fetchSolicitudes : fetchContactos}
              className="btn-primary"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Vista detallada expandible (opcional) - Solo para solicitudes */}
        {activeTab === 'solicitudes' && solicitudes.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista Detallada</h2>
            <div className="space-y-4">
              {solicitudes.map((solicitud) => {
                const fotos = parseFotos(solicitud.fotos_paths)
                return (
                  <div key={solicitud.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Email:</p>
                        <p className="text-sm text-gray-900">{solicitud.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Ubicación:</p>
                        <p className="text-sm text-gray-900">{solicitud.ciudad}, {solicitud.pais}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Acción:</p>
                        <p className="text-sm text-gray-900">{solicitud.accion}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Producto:</p>
                        <p className="text-sm text-gray-900">{solicitud.modelo_marca}</p>
                        <p className="text-xs text-gray-500">{solicitud.tipo_producto}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Estado del producto:</p>
                        <p className="text-sm text-gray-900">{solicitud.estado}</p>
                      </div>
                      {solicitud.urgencia && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Urgencia:</p>
                          <p className="text-sm text-gray-900">{solicitud.urgencia}</p>
                        </div>
                      )}
                      {solicitud.accesorios && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700">Accesorios:</p>
                          <p className="text-sm text-gray-900">{solicitud.accesorios}</p>
                        </div>
                      )}
                      {fotos.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-semibold text-gray-700">Fotos ({fotos.length}):</p>
                          <div className="flex gap-2 mt-2">
                            {fotos.map((foto, index) => (
                              <a
                                key={index}
                                href={foto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-800 text-sm underline"
                              >
                                Foto {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-700">Fecha de registro:</p>
                        <p className="text-sm text-gray-900">{formatDate(solicitud.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
