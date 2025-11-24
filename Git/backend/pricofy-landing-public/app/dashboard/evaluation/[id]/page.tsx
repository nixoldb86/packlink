'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import LanguageSelector from '@/components/LanguageSelector'
import { useForm } from '@/contexts/FormContext'
import { calculateDistance, type Coordinates } from '@/lib/geocoding'

interface Comprador {
  titulo: string
  plataforma: string
  precio_eur: number
  estado_declarado: string
  ciudad_o_zona: string
  url_anuncio: string
  product_image?: string | null
  descripcion?: string | null
  is_shippable?: boolean | null
  is_top_profile?: boolean | null
  fecha_publicacion?: string | null
}

interface EvaluacionDetalle {
  id: number
  solicitudId?: number // ID de la solicitud (necesario para favoritos)
  producto: string
  categoria: string
  condicion: string
  accion?: string
  ubicacion: string
  ciudad: string
  pais: string
  fecha: string
  scraping: {
    id: number
    totalEncontrados: number
    totalAnalizados: number
    totalDescartados: number
    totalOutliers: number
    totalFiltrados: number
    jsonCompradores: {
      compradores: Comprador[]
    }
    jsonVendedores?: {
      vendedores?: Array<{
        tipo_precio: 'minimo' | 'ideal' | 'rapido'
        precio_eur: number
        plataforma: string
        urls: string[]
        plataforma_sugerida: string[]
      }>
      descripcion_anuncio?: string
    } | null
    plataformasConsultadas: string[]
    fecha: string
    tipoBusqueda?: 'directa' | 'completa' // Tipo de búsqueda realizada
    productosNuevos?: Array<{
      id: number
      nombre_del_producto: string
      datos_producto_nuevo: {
        title: string
        description: string
        price: number
        currency: string
        offerUrl: string | { landingUrl?: string; url?: string }
        images: Array<{ url: string; zoomUrl: string }>
      }
      datos_producto_nuevo_filtrado?: Array<{
        title: string
        description: string
        price: number
        currency: string
        offerUrl: string | { landingUrl?: string; url?: string }
        images: Array<{ url: string; zoomUrl: string }>
      }>
      created_at: string
    }>
  }
}

export default function EvaluationDetailPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { openForm } = useForm()
  const t = (key: string) => getTranslation(language, key)
  
  const [filtroActivo, setFiltroActivo] = useState<'dashboard' | 'comprar' | 'vender' | 'favoritos' | 'perfil'>('dashboard')
  
  // Detectar el filtro desde la URL
  useEffect(() => {
    const filtro = searchParams.get('filtro')
    if (filtro && ['comprar', 'vender', 'favoritos', 'perfil'].includes(filtro)) {
      setFiltroActivo(filtro as 'comprar' | 'vender' | 'favoritos' | 'perfil')
    } else {
      setFiltroActivo('resumen')
    }
  }, [searchParams])
  
  // Estado para favoritos (almacenado en localStorage)
  const [favoritos, setFavoritos] = useState<Set<number>>(new Set())
  const [anunciosFavoritos, setAnunciosFavoritos] = useState<Set<string>>(new Set())
  
  // Estado para panel de información de búsqueda avanzada
  const [panelInfoAbierto, setPanelInfoAbierto] = useState(false)
  const [panelInfoCerrandose, setPanelInfoCerrandose] = useState(false)
  const [panelInfoAbriendose, setPanelInfoAbriendose] = useState(false)
  
  // Estados para gráficas colapsables en el panel de +info (por defecto abiertas)
  const [graficaPlataformasColapsada, setGraficaPlataformasColapsada] = useState(false)
  const [graficaPreciosColapsada, setGraficaPreciosColapsada] = useState(false)
  const [graficaPrecioAntiguedadColapsada, setGraficaPrecioAntiguedadColapsada] = useState(false)
  const [graficaPreciosNuevosColapsada, setGraficaPreciosNuevosColapsada] = useState(false)
  const [listaProductosNuevosColapsada, setListaProductosNuevosColapsada] = useState(false)
  const [graficaPaisesColapsada, setGraficaPaisesColapsada] = useState(false)
  
  // Función para abrir el panel de información con animación
  const abrirPanelInfo = () => {
    setPanelInfoAbierto(true)
    setPanelInfoAbriendose(true)
    // Forzar reflow para que la animación funcione
    requestAnimationFrame(() => {
      setTimeout(() => {
        setPanelInfoAbriendose(false)
      }, 10)
    })
  }
  
  // Función para cerrar el panel de información con animación
  const cerrarPanelInfo = () => {
    setPanelInfoCerrandose(true)
    setTimeout(() => {
      setPanelInfoAbierto(false)
      setPanelInfoCerrandose(false)
    }, 500)
  }
  
  // Función para alternar favorito
  const toggleFavorito = (evaluacionId: number) => {
    // Usar solicitudId si está disponible (para búsquedas avanzadas), sino usar el id directamente
    const idParaFavorito = evaluacion?.solicitudId || evaluacionId
    
    setFavoritos(prev => {
      const nuevosFavoritos = new Set(prev)
      const agregar = !nuevosFavoritos.has(idParaFavorito)
      
      if (agregar) {
        nuevosFavoritos.add(idParaFavorito)
      } else {
        nuevosFavoritos.delete(idParaFavorito)
      }
      
      // Guardar en localStorage inmediatamente (para respuesta rápida)
      try {
        localStorage.setItem('evaluaciones_favoritas', JSON.stringify(Array.from(nuevosFavoritos)))
      } catch (error) {
        console.error('Error al guardar favoritos:', error)
      }
      
      // Guardar en el backend (en segundo plano, sin bloquear la UI)
      if (user) {
        fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo: 'evaluacion',
            id: idParaFavorito,
            agregar: agregar
          })
        }).catch(error => {
          console.error('Error al guardar favorito en el backend:', error)
        })
      }
      
      return nuevosFavoritos
    })
  }
  
  const toggleAnuncioFavorito = useCallback((urlAnuncio: string) => {
    if (!urlAnuncio) {
      return
    }
    setAnunciosFavoritos((prev) => {
      const actualizado = new Set(prev)
      const agregar = !actualizado.has(urlAnuncio)
      
      if (agregar) {
        actualizado.add(urlAnuncio)
      } else {
        actualizado.delete(urlAnuncio)
      }
      
      // Guardar en localStorage inmediatamente (para respuesta rápida)
      try {
        localStorage.setItem('anuncios_favoritos', JSON.stringify(Array.from(actualizado)))
      } catch (error) {
        console.error('Error al guardar anuncios favoritos:', error)
      }
      
      // Guardar en el backend (en segundo plano, sin bloquear la UI)
      if (user) {
        fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo: 'anuncio',
            id: urlAnuncio,
            agregar: agregar
          })
        }).catch(error => {
          console.error('Error al guardar anuncio favorito en el backend:', error)
        })
      }
      
      return actualizado
    })
  }, [user])
  
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetalle | null>(null)
  
  // Cargar favoritos desde el backend y localStorage al montar el componente
  useEffect(() => {
    const cargarFavoritos = async () => {
      if (user) {
        try {
          // Primero intentar cargar desde el backend
          const response = await fetch('/api/favorites')
          if (response.ok) {
            const data = await response.json()
            if (data.evaluaciones && Array.isArray(data.evaluaciones)) {
              setFavoritos(new Set(data.evaluaciones))
              // Sincronizar con localStorage
              localStorage.setItem('evaluaciones_favoritas', JSON.stringify(data.evaluaciones))
            }
            if (data.anuncios && Array.isArray(data.anuncios)) {
              setAnunciosFavoritos(new Set(data.anuncios))
              // Sincronizar con localStorage
              localStorage.setItem('anuncios_favoritos', JSON.stringify(data.anuncios))
            }
          } else {
            // Si falla el backend, cargar desde localStorage como fallback
            try {
              const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
              if (favoritosGuardados) {
                const ids = JSON.parse(favoritosGuardados) as number[]
                setFavoritos(new Set(ids))
              }
              const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
              if (anunciosFavoritosGuardados) {
                const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
                setAnunciosFavoritos(new Set(urls))
              }
            } catch (error) {
              console.error('Error al cargar favoritos desde localStorage:', error)
            }
          }
        } catch (error) {
          console.error('Error al cargar favoritos desde el backend:', error)
          // Fallback a localStorage
          try {
            const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
            if (favoritosGuardados) {
              const ids = JSON.parse(favoritosGuardados) as number[]
              setFavoritos(new Set(ids))
            }
            const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
            if (anunciosFavoritosGuardados) {
              const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
              setAnunciosFavoritos(new Set(urls))
            }
          } catch (parseError) {
            console.error('Error al parsear favoritos:', parseError)
          }
        }
      } else {
        // Si no hay usuario, cargar solo desde localStorage
        try {
          const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
          if (favoritosGuardados) {
            const ids = JSON.parse(favoritosGuardados) as number[]
            setFavoritos(new Set(ids))
          }
          const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
          if (anunciosFavoritosGuardados) {
            const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
            setAnunciosFavoritos(new Set(urls))
          }
        } catch (error) {
          console.error('Error al cargar favoritos:', error)
        }
      }
    }
    
    cargarFavoritos()
  }, [user])
  
  // Recargar favoritos cuando cambie la evaluación (sincronizar con localStorage)
  useEffect(() => {
    if (evaluacion?.id) {
      const cargarFavoritos = async () => {
        if (user) {
          try {
            // Primero intentar cargar desde el backend
            const response = await fetch('/api/favorites')
            if (response.ok) {
              const data = await response.json()
              if (data.evaluaciones && Array.isArray(data.evaluaciones)) {
                setFavoritos(new Set(data.evaluaciones))
                // Sincronizar con localStorage
                localStorage.setItem('evaluaciones_favoritas', JSON.stringify(data.evaluaciones))
              }
              if (data.anuncios && Array.isArray(data.anuncios)) {
                setAnunciosFavoritos(new Set(data.anuncios))
                // Sincronizar con localStorage
                localStorage.setItem('anuncios_favoritos', JSON.stringify(data.anuncios))
              }
            } else {
              // Si falla el backend, cargar desde localStorage como fallback
              try {
                const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
                if (favoritosGuardados) {
                  const ids = JSON.parse(favoritosGuardados) as number[]
                  setFavoritos(new Set(ids))
                }
                const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
                if (anunciosFavoritosGuardados) {
                  const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
                  setAnunciosFavoritos(new Set(urls))
                }
              } catch (error) {
                console.error('Error al cargar favoritos desde localStorage:', error)
              }
            }
          } catch (error) {
            console.error('Error al cargar favoritos:', error)
          }
        } else {
          // Si no hay usuario, cargar desde localStorage
          try {
            const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
            if (favoritosGuardados) {
              const ids = JSON.parse(favoritosGuardados) as number[]
              setFavoritos(new Set(ids))
            }
            const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
            if (anunciosFavoritosGuardados) {
              const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
              setAnunciosFavoritos(new Set(urls))
            }
          } catch (error) {
            console.error('Error al cargar favoritos desde localStorage:', error)
          }
        }
      }
      
      cargarFavoritos()
    }
  }, [evaluacion?.id, evaluacion?.solicitudId, user])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para búsqueda y filtros
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [mostrarFiltrosModal, setMostrarFiltrosModal] = useState(false)
  const [vistaAnuncios, setVistaAnuncios] = useState<'lista' | 'fichas'>('lista')
  // Estado para colapsar/expandir "Resultados encontrados" - Por defecto desplegado para búsquedas directas
  const [mostrarTodosAnuncios, setMostrarTodosAnuncios] = useState(false)
  // Estado para ordenamiento por precio
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | null>(null)
  const sliderContainerRef = useRef<HTMLDivElement>(null)
  const [arrastrando, setArrastrando] = useState<'min' | 'max' | null>(null)
  
  // Estado para el modal de anuncio
  const [anuncioModal, setAnuncioModal] = useState<Comprador | null>(null)
  
  // Debug: verificar cuando cambia el estado del modal
  useEffect(() => {
    if (anuncioModal) {
      console.log('Modal abierto con anuncio:', anuncioModal)
    } else {
      console.log('Modal cerrado')
    }
  }, [anuncioModal])
  // Calcular precio mínimo y máximo de los anuncios (inicial)
  const preciosIniciales = evaluacion?.scraping.jsonCompradores?.compradores?.map(c => c.precio_eur || 0).filter(p => p > 0) || []
  const precioMinimoInicial = preciosIniciales.length > 0 ? Math.min(...preciosIniciales) : 0
  const precioMaximoInicial = preciosIniciales.length > 0 ? Math.max(...preciosIniciales) : 1000
  
  const [filtros, setFiltros] = useState({
    precioMinimo: 0, // Precio mínimo del rango (0 = sin filtro mínimo)
    precioMaximo: 0, // Precio máximo del rango (0 = sin filtro máximo)
    tipoEnvio: 'envio' as 'envio' | 'mano', // Con envío o Trato en mano
    estadoMinimo: 0, // Estado mínimo (0 = sin filtro, 1-5 = estrellas)
    soloTopProfile: false, // Solo mostrar perfiles top (is_top_profile: true)
    pais: '' // País (código de país, vacío = sin filtro)
  })
  
  // Actualizar filtros cuando cambie la evaluación (inicializar sin filtro)
  useEffect(() => {
    if (evaluacion) {
      setFiltros(prev => ({ ...prev, precioMinimo: 0, precioMaximo: 0, estadoMinimo: 0, soloTopProfile: false }))
    }
  }, [evaluacion])
  
  // Mapeo de estrellas a estados
  // 1 estrella: Necesita reparación (aceptable)
  // 2 estrellas: Usado
  // 3 estrellas: Buen estado
  // 4 estrellas: Como nuevo
  // 5 estrellas: Nuevo
  const mapeoEstrellasAEstados: Record<number, string[]> = {
    1: ['aceptable', 'necesita reparacion', 'necesita_reparacion'],
    2: ['usado'],
    3: ['buen_estado', 'buen estado', 'buenestado'],
    4: ['como_nuevo', 'como nuevo', 'comonuevo'],
    5: ['nuevo']
  }
  
  // Función para obtener el valor numérico del estado
  const obtenerValorEstado = (estado: string | null | undefined): number => {
    if (!estado) return 0
    const estadoLower = estado.toLowerCase().trim().replace(/\s+/g, '_')
    
    // Buscar en el mapeo inverso
    for (const [estrellas, estados] of Object.entries(mapeoEstrellasAEstados)) {
      if (estados.some(e => {
        const estadoNormalizado = e.toLowerCase().replace(/\s+/g, '_')
        return estadoLower === estadoNormalizado || estadoLower.includes(estadoNormalizado) || estadoNormalizado.includes(estadoLower)
      })) {
        return parseInt(estrellas)
      }
    }
    return 0
  }
  
  // Función para determinar qué control activar basándose en la posición del clic
  const determinarControlActivo = (clientX: number, precioMin: number, precioMax: number): 'min' | 'max' => {
    if (!sliderContainerRef.current) return 'max'
    
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const clickX = clientX - rect.left
    const width = rect.width
    
    // Calcular posiciones de las bolitas
    const minPos = filtros.precioMinimo === 0 
      ? 0 
      : ((filtros.precioMinimo - precioMin) / (precioMax - precioMin)) * width
    const maxPos = filtros.precioMaximo === 0 
      ? width 
      : ((filtros.precioMaximo - precioMin) / (precioMax - precioMin)) * width
    
    // Determinar cuál está más cerca
    const distanciaMin = Math.abs(clickX - minPos)
    const distanciaMax = Math.abs(clickX - maxPos)
    
    return distanciaMin < distanciaMax ? 'min' : 'max'
  }
  
  // Cache de coordenadas de ciudades de anuncios
  const [ciudadesCoords, setCiudadesCoords] = useState<Map<string, Coordinates | null>>(new Map())
  const [geocodingCiudadesInProgress, setGeocodingCiudadesInProgress] = useState(false)
  // Ref para rastrear qué evaluaciones ya se han procesado
  const evaluacionesProcesadas = useRef<Set<number>>(new Set())
  // Ref para rastrear si ya se está procesando una evaluación
  const procesandoRef = useRef<boolean>(false)

  const fetchEvaluationDetails = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/evaluation/${id}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener detalles de evaluación')
      }
      
      const data = await response.json()
      setEvaluacion(data.evaluacion)
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/')
        return
      }
      if (params.id) {
        fetchEvaluationDetails(params.id as string)
      }
    }
  }, [user, authLoading, router, params.id, fetchEvaluationDetails])

  // Cuando se carga una evaluación, si es búsqueda directa, desplegar la sección por defecto
  useEffect(() => {
    if (evaluacion?.scraping?.tipoBusqueda === 'directa') {
      setMostrarTodosAnuncios(true)
    } else {
      setMostrarTodosAnuncios(false)
    }
  }, [evaluacion?.scraping?.tipoBusqueda])


  // Limpiar el Set de evaluaciones procesadas cuando cambia el ID de la evaluación
  useEffect(() => {
    evaluacionesProcesadas.current.clear()
    procesandoRef.current = false
  }, [evaluacion?.id])

  // Geocodificar ciudades de anuncios cuando se carga la evaluación
  useEffect(() => {
    if (!evaluacion || geocodingCiudadesInProgress || procesandoRef.current) {
      return
    }

    const evaluacionId = evaluacion.id

    // Verificar si esta evaluación ya fue procesada
    if (evaluacionesProcesadas.current.has(evaluacionId)) {
      return
    }

    // Marcar como procesada y en proceso inmediatamente para evitar ejecuciones múltiples
    evaluacionesProcesadas.current.add(evaluacionId)
    procesandoRef.current = true

    const compradores = evaluacion.scraping.jsonCompradores?.compradores || []
    const ciudadesUnicas = new Set<string>()
    
    compradores.forEach(comprador => {
      if (comprador.ciudad_o_zona) {
        ciudadesUnicas.add(comprador.ciudad_o_zona)
      }
    })

    const ciudadesArray = Array.from(ciudadesUnicas)
    
    // Obtener el estado actual de ciudadesCoords de forma síncrona
    let ciudadesPorGeocodificar: string[] = []
    
    setCiudadesCoords(prevCoords => {
      ciudadesPorGeocodificar = ciudadesArray.filter(ciudad => !prevCoords.has(ciudad))
      
      if (ciudadesPorGeocodificar.length === 0) {
        // Todas las ciudades ya están geocodificadas
        return prevCoords
      }
      
      return prevCoords
    })
    
    // Si no hay ciudades por geocodificar, salir
    if (ciudadesPorGeocodificar.length === 0) {
      return
    }

    // Iniciar geocodificación en background
    const geocodeCiudades = async () => {
      setGeocodingCiudadesInProgress(true)
      
      console.log(`🔍 Geocodificando ${ciudadesPorGeocodificar.length} ciudades únicas de anuncios...`)
      console.log(`   ⚠️ Nota: Nominatim tiene rate limiting (1 petición/segundo), esto puede tardar ${ciudadesPorGeocodificar.length} segundos...`)
      
      const nuevasCoords = new Map<string, Coordinates | null>()
      
      for (const ciudad of ciudadesPorGeocodificar) {
        console.log(`   Geocodificando: "${ciudad}"`)
        try {
          const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location: ciudad }),
          })

          if (response.ok) {
            const data = await response.json()
            const coords = data.success && data.coordinates ? data.coordinates : null
            nuevasCoords.set(ciudad, coords)
            if (coords) {
              console.log(`   ✅ "${ciudad}" -> (${coords.lat}, ${coords.lon})`)
            } else {
              console.log(`   ⚠️ No se pudo geocodificar: "${ciudad}"`)
            }
          } else {
            console.log(`   ⚠️ Error geocodificando: "${ciudad}" (${response.status})`)
            nuevasCoords.set(ciudad, null)
          }
        } catch (error) {
          console.error(`   ❌ Error geocodificando "${ciudad}":`, error)
          nuevasCoords.set(ciudad, null)
        }
        
        // El rate limiter ya está en el servidor, pero agregamos un pequeño delay adicional
        // para evitar saturar si hay muchas ciudades
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Actualizar el estado con todas las nuevas coordenadas
      setCiudadesCoords(prev => {
        const updated = new Map(prev)
        nuevasCoords.forEach((coords, ciudad) => {
          updated.set(ciudad, coords)
        })
        return updated
      })
      
      setGeocodingCiudadesInProgress(false)
      procesandoRef.current = false
      console.log(`✅ Geocodificación completada. Total ciudades: ${nuevasCoords.size}`)
    }

    geocodeCiudades()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluacion?.id]) // Solo ejecutar cuando cambia el ID de la evaluación

  // Filtrar compradores según búsqueda y filtros
  const compradoresOriginales = evaluacion?.scraping.jsonCompradores?.compradores || []
  
  // Calcular precio mínimo y máximo de los anuncios
  const precios = compradoresOriginales.map(c => c.precio_eur || 0).filter(p => p > 0)
  const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0
  const precioMaximo = precios.length > 0 ? Math.max(...precios) : 1000
  
  // Manejar el arrastre de las bolitas
  useEffect(() => {
    if (!arrastrando || !sliderContainerRef.current) return

    const handlePointerMove = (e: PointerEvent) => {
      const rect = sliderContainerRef.current!.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const porcentaje = Math.max(0, Math.min(100, (clickX / width) * 100))
      const valor = precioMinimo + ((porcentaje / 100) * (precioMaximo - precioMinimo))

      if (arrastrando === 'min') {
        const valorLimitado = Math.max(precioMinimo, Math.min(filtros.precioMaximo > 0 ? filtros.precioMaximo : precioMaximo, valor))
        if (valorLimitado <= precioMinimo) {
          setFiltros(prev => ({ ...prev, precioMinimo: 0 }))
        } else {
          setFiltros(prev => ({ ...prev, precioMinimo: valorLimitado }))
        }
      } else {
        const valorLimitado = Math.max(filtros.precioMinimo > 0 ? filtros.precioMinimo : precioMinimo, Math.min(precioMaximo, valor))
        if (valorLimitado >= precioMaximo) {
          setFiltros(prev => ({ ...prev, precioMaximo: 0 }))
        } else {
          setFiltros(prev => ({ ...prev, precioMaximo: valorLimitado }))
        }
      }
    }

    const handlePointerUp = () => {
      setArrastrando(null)
      const minInput = sliderContainerRef.current?.querySelector('input[data-range="min"]') as HTMLInputElement
      const maxInput = sliderContainerRef.current?.querySelector('input[data-range="max"]') as HTMLInputElement
      if (minInput) minInput.style.zIndex = '15'
      if (maxInput) maxInput.style.zIndex = '15'
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [arrastrando, precioMinimo, precioMaximo, filtros.precioMinimo, filtros.precioMaximo])
  
  const compradoresFiltrados = useMemo(() => {
    if (!evaluacion) return []
    
    // Para búsquedas directas, mantener el orden original (sin ordenar)
    // Para búsquedas completas, mantener cualquier ordenamiento que venga de la API
    const esBusquedaDirecta = evaluacion?.scraping?.tipoBusqueda === 'directa'
    
    const filtrados = compradoresOriginales.filter((comprador) => {
      // Filtro por búsqueda de texto (búsqueda parcial en título)
      if (busquedaTexto.trim()) {
        const textoBusqueda = busquedaTexto.toLowerCase().trim()
        const titulo = comprador.titulo?.toLowerCase() || ''
        if (!titulo.includes(textoBusqueda)) {
          return false
        }
      }

      // Filtro por precio (rango)
      const precio = comprador.precio_eur || 0
      if (filtros.precioMinimo > 0 && precio < filtros.precioMinimo) return false
      if (filtros.precioMaximo > 0 && precio > filtros.precioMaximo) return false

      // Filtro por tipo de envío
      const isShippable = comprador.is_shippable ?? false
      if (filtros.tipoEnvio === 'mano' && isShippable) return false // Solo mostrar is_shippable: false
      // Si es 'envio', mostrar todos (true o false)

      // Filtro por estado (estrellas)
      if (filtros.estadoMinimo > 0) {
        const valorEstadoComprador = obtenerValorEstado(comprador.estado_declarado)
        if (valorEstadoComprador < filtros.estadoMinimo) {
          return false
        }
      }

      // Filtro por top profile
      if (filtros.soloTopProfile && !comprador.is_top_profile) {
        return false
      }

      // Filtro por país
      if (filtros.pais) {
        const countryCode = (comprador as any).country_code || 'N/A'
        if (countryCode !== filtros.pais) {
          return false
        }
      }

      return true
    })
    
    // Intercalar aleatoriamente los anuncios de diferentes plataformas
    // Agrupar por plataforma
    const porPlataforma: Record<string, Comprador[]> = {}
    filtrados.forEach(comprador => {
      const plataforma = comprador.plataforma || 'otra'
      if (!porPlataforma[plataforma]) {
        porPlataforma[plataforma] = []
      }
      porPlataforma[plataforma].push(comprador)
    })
    
    // Mezclar aleatoriamente cada grupo de plataforma
    Object.keys(porPlataforma).forEach(plataforma => {
      porPlataforma[plataforma] = porPlataforma[plataforma].sort(() => Math.random() - 0.5)
    })
    
    // Intercalar los anuncios de diferentes plataformas
    const intercalados: Comprador[] = []
    const plataformas = Object.keys(porPlataforma)
    let indice = 0
    let hayMasElementos = true
    
    while (hayMasElementos) {
      hayMasElementos = false
      // Mezclar el orden de las plataformas en cada iteración para mayor aleatoriedad
      const plataformasMezcladas = [...plataformas].sort(() => Math.random() - 0.5)
      
      plataformasMezcladas.forEach(plataforma => {
        if (indice < porPlataforma[plataforma].length) {
          intercalados.push(porPlataforma[plataforma][indice])
          hayMasElementos = true
        }
      })
      indice++
    }
    
    return intercalados
  }, [compradoresOriginales, busquedaTexto, filtros, precioMinimo, precioMaximo, evaluacion?.scraping?.tipoBusqueda])

  // Aplicar ordenamiento por precio si está activo
  const compradores = useMemo(() => {
    if (ordenPrecio === null) {
      return compradoresFiltrados
    }
    const ordenados = [...compradoresFiltrados].sort((a, b) => {
      const precioA = a.precio_eur || 0
      const precioB = b.precio_eur || 0
      return ordenPrecio === 'desc' ? precioB - precioA : precioA - precioB
    })
    return ordenados
  }, [compradoresFiltrados, ordenPrecio])

  // Obtener los 4 anuncios más baratos con is_top_profile: true para "Nuestros preferidos"
  const anunciosPreferidos = useMemo(() => {
    const anunciosOrdenados = [...compradoresOriginales]
      .filter(c => c.precio_eur && c.precio_eur > 0 && c.is_top_profile === true)
      .sort((a, b) => (a.precio_eur || 0) - (b.precio_eur || 0))
      .slice(0, 4)
    return anunciosOrdenados
  }, [compradoresOriginales])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    const meses = language === 'es' 
      ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dia = date.getDate()
    const mes = meses[date.getMonth()]
    const año = date.getFullYear()
    return `${dia} de ${mes} de ${año}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  // Helper para determinar si una acción es "vender"
  const esAccionVender = (accion: string | undefined): boolean => {
    if (!accion) return false
    return accion === 'quiero vender un producto' || 
           accion === 'I want to sell a product'
  }

  // Helper para determinar si una acción es "comprar"
  const esAccionComprar = (accion: string | undefined): boolean => {
    if (!accion) return false
    return accion === 'quiero comprar al mejor precio' || 
           accion === 'I want to buy at the best price'
  }

  // Análisis de mercado para vendedores
  const esVender = esAccionVender(evaluacion?.accion)
  
  // Estado para filtros de gráficas
  const [filtrosGraficas, setFiltrosGraficas] = useState<{
    rangoPrecio?: { min: number; max: number }
    ubicacion?: string
    antiguedad?: 'menosDe1Semana' | 'entre1Y4Semanas' | 'entre1Y3Meses' | 'masDe3Meses' | 'sinFecha'
    precioAntiguedad?: 'menosDe1Semana' | 'entre1Y4Semanas' | 'entre1Y3Meses' | 'masDe3Meses' | 'sinFecha'
    plataforma?: string
    envio?: 'conEnvio' | 'sinEnvio' | 'sinDatos'
    pais?: string
  }>({})
  
  // Estado para mostrar panel de filtros activos
  const [mostrarFiltrosActivos, setMostrarFiltrosActivos] = useState(false)
  const filtrosActivosRef = useRef<HTMLDivElement>(null)
  
  // Cerrar el panel de filtros activos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtrosActivosRef.current && !filtrosActivosRef.current.contains(event.target as Node)) {
        setMostrarFiltrosActivos(false)
      }
    }
    
    if (mostrarFiltrosActivos) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mostrarFiltrosActivos])
  
  // Función para calcular la antigüedad de un anuncio
  const calcularAntiguedad = (fechaPub: string | null | undefined): 'menosDe1Semana' | 'entre1Y4Semanas' | 'entre1Y3Meses' | 'masDe3Meses' | 'sinFecha' => {
    if (!fechaPub || fechaPub === 'ND' || fechaPub === '') {
      return 'sinFecha'
    }
    
    try {
      const fecha = new Date(fechaPub)
      if (isNaN(fecha.getTime())) {
        return 'sinFecha'
      }
      
      const ahora = new Date()
      const diffMs = ahora.getTime() - fecha.getTime()
      const diffDias = diffMs / (1000 * 60 * 60 * 24)
      
      if (diffDias < 7) {
        return 'menosDe1Semana'
      } else if (diffDias < 30) {
        return 'entre1Y4Semanas'
      } else if (diffDias < 90) {
        return 'entre1Y3Meses'
      } else {
        return 'masDe3Meses'
      }
    } catch {
      return 'sinFecha'
    }
  }
  
  // Filtrar compradores según los filtros activos
  const compradoresParaAnalisis = useMemo(() => {
    let filtrados = [...compradoresOriginales]
    
    // Filtrar por rango de precio
    if (filtrosGraficas.rangoPrecio) {
      filtrados = filtrados.filter(c => {
        const precio = c.precio_eur || 0
        return precio >= filtrosGraficas.rangoPrecio!.min && precio <= filtrosGraficas.rangoPrecio!.max
      })
    }
    
    // Filtrar por ubicación
    if (filtrosGraficas.ubicacion) {
      filtrados = filtrados.filter(c => (c.ciudad_o_zona || 'Sin ubicación') === filtrosGraficas.ubicacion)
    }
    
    // Filtrar por antigüedad
    if (filtrosGraficas.antiguedad) {
      filtrados = filtrados.filter(c => calcularAntiguedad(c.fecha_publicacion) === filtrosGraficas.antiguedad)
    }
    
    // Filtrar por precio vs antigüedad (mismo cálculo que antigüedad pero para la gráfica específica)
    if (filtrosGraficas.precioAntiguedad) {
      filtrados = filtrados.filter(c => {
        const antiguedad = calcularAntiguedad(c.fecha_publicacion)
        return antiguedad === filtrosGraficas.precioAntiguedad && (c.precio_eur || 0) > 0
      })
    }
    
    // Filtrar por plataforma
    if (filtrosGraficas.plataforma) {
      filtrados = filtrados.filter(c => (c.plataforma || 'unknown') === filtrosGraficas.plataforma)
    }
    
    // Filtrar por envío
    if (filtrosGraficas.envio) {
      if (filtrosGraficas.envio === 'conEnvio') {
        filtrados = filtrados.filter(c => c.is_shippable === true)
      } else if (filtrosGraficas.envio === 'sinEnvio') {
        filtrados = filtrados.filter(c => c.is_shippable === false)
      } else if (filtrosGraficas.envio === 'sinDatos') {
        filtrados = filtrados.filter(c => c.is_shippable === null || c.is_shippable === undefined)
      }
    }
    
    // Filtrar por país
    if (filtrosGraficas.pais) {
      filtrados = filtrados.filter(c => {
        const countryCode = (c as any).country_code || 'N/A'
        return countryCode === filtrosGraficas.pais
      })
    }
    
    return filtrados
  }, [compradoresOriginales, filtrosGraficas])
  
  // Función para manejar clic en una barra de gráfica
  const handleClickBarra = (tipo: 'rangoPrecio' | 'ubicacion' | 'antiguedad' | 'precioAntiguedad' | 'plataforma' | 'envio' | 'pais', valor: any) => {
    setFiltrosGraficas(prev => {
      // Si el filtro ya está activo, desactivarlo (toggle)
      if (tipo === 'rangoPrecio' && prev.rangoPrecio?.min === valor.min && prev.rangoPrecio?.max === valor.max) {
        const { rangoPrecio, ...rest } = prev
        return rest
      }
      if (tipo === 'ubicacion' && prev.ubicacion === valor) {
        const { ubicacion, ...rest } = prev
        return rest
      }
      if (tipo === 'antiguedad' && prev.antiguedad === valor) {
        const { antiguedad, ...rest } = prev
        return rest
      }
      if (tipo === 'precioAntiguedad' && prev.precioAntiguedad === valor) {
        const { precioAntiguedad, ...rest } = prev
        return rest
      }
      if (tipo === 'plataforma' && prev.plataforma === valor) {
        const { plataforma, ...rest } = prev
        return rest
      }
      if (tipo === 'envio' && prev.envio === valor) {
        const { envio, ...rest } = prev
        return rest
      }
      if (tipo === 'pais' && prev.pais === valor) {
        const { pais, ...rest } = prev
        return rest
      }
      
      // Si no está activo, activarlo
      return { ...prev, [tipo]: valor }
    })
  }
  
  // Función para limpiar todos los filtros
  const limpiarFiltrosGraficas = () => {
    setFiltrosGraficas({})
  }
  
  // Función para obtener la descripción legible de un filtro
  const obtenerDescripcionFiltro = (tipo: string, valor: any): string => {
    switch (tipo) {
      case 'rangoPrecio':
        return `${language === 'es' ? 'Precio' : 'Price'}: ${formatPrice(valor.min)} - ${formatPrice(valor.max)}`
      case 'ubicacion':
        return `${language === 'es' ? 'Ubicación' : 'Location'}: ${valor}`
      case 'antiguedad':
        const labelsAntiguedad: Record<string, string> = {
          menosDe1Semana: language === 'es' ? '< 1 semana' : '< 1 week',
          entre1Y4Semanas: language === 'es' ? '1-4 semanas' : '1-4 weeks',
          entre1Y3Meses: language === 'es' ? '1-3 meses' : '1-3 months',
          masDe3Meses: language === 'es' ? '> 3 meses' : '> 3 months',
          sinFecha: language === 'es' ? 'Sin fecha' : 'No date'
        }
        return `${language === 'es' ? 'Antigüedad' : 'Age'}: ${labelsAntiguedad[valor] || valor}`
      case 'precioAntiguedad':
        const labelsPrecioAntiguedad: Record<string, string> = {
          menosDe1Semana: language === 'es' ? '< 1 semana' : '< 1 week',
          entre1Y4Semanas: language === 'es' ? '1-4 semanas' : '1-4 weeks',
          entre1Y3Meses: language === 'es' ? '1-3 meses' : '1-3 months',
          masDe3Meses: language === 'es' ? '> 3 meses' : '> 3 months',
          sinFecha: language === 'es' ? 'Sin fecha' : 'No date'
        }
        return `${language === 'es' ? 'Precio vs Antigüedad' : 'Price vs Age'}: ${labelsPrecioAntiguedad[valor] || valor}`
      case 'plataforma':
        return `${language === 'es' ? 'Plataforma' : 'Platform'}: ${valor}`
      case 'envio':
        const labelsEnvio: Record<string, string> = {
          conEnvio: language === 'es' ? 'Con envío' : 'With shipping',
          sinEnvio: language === 'es' ? 'Solo recogida' : 'Pickup only',
          sinDatos: language === 'es' ? 'Sin datos' : 'No data'
        }
        return `${language === 'es' ? 'Envío' : 'Shipping'}: ${labelsEnvio[valor] || valor}`
      case 'pais':
        const countryNames: Record<string, string> = {
          'ES': 'España',
          'IT': 'Italia',
          'FR': 'Francia',
          'PT': 'Portugal',
          'DE': 'Alemania',
          'GB': 'Reino Unido',
          'US': 'Estados Unidos',
          'MX': 'México',
          'AR': 'Argentina',
          'CO': 'Colombia',
          'CL': 'Chile',
          'PE': 'Perú',
        }
        return `${language === 'es' ? 'País' : 'Country'}: ${countryNames[valor] || valor}`
      default:
        return `${tipo}: ${valor}`
    }
  }
  
  // Función para obtener lista de filtros activos formateados
  const obtenerFiltrosActivos = () => {
    const filtros: Array<{ tipo: string; descripcion: string; valor: any }> = []
    
    if (filtrosGraficas.rangoPrecio) {
      filtros.push({
        tipo: 'rangoPrecio',
        descripcion: obtenerDescripcionFiltro('rangoPrecio', filtrosGraficas.rangoPrecio),
        valor: filtrosGraficas.rangoPrecio
      })
    }
    if (filtrosGraficas.ubicacion) {
      filtros.push({
        tipo: 'ubicacion',
        descripcion: obtenerDescripcionFiltro('ubicacion', filtrosGraficas.ubicacion),
        valor: filtrosGraficas.ubicacion
      })
    }
    if (filtrosGraficas.antiguedad) {
      filtros.push({
        tipo: 'antiguedad',
        descripcion: obtenerDescripcionFiltro('antiguedad', filtrosGraficas.antiguedad),
        valor: filtrosGraficas.antiguedad
      })
    }
    if (filtrosGraficas.precioAntiguedad) {
      filtros.push({
        tipo: 'precioAntiguedad',
        descripcion: obtenerDescripcionFiltro('precioAntiguedad', filtrosGraficas.precioAntiguedad),
        valor: filtrosGraficas.precioAntiguedad
      })
    }
    if (filtrosGraficas.plataforma) {
      filtros.push({
        tipo: 'plataforma',
        descripcion: obtenerDescripcionFiltro('plataforma', filtrosGraficas.plataforma),
        valor: filtrosGraficas.plataforma
      })
    }
    if (filtrosGraficas.envio) {
      filtros.push({
        tipo: 'envio',
        descripcion: obtenerDescripcionFiltro('envio', filtrosGraficas.envio),
        valor: filtrosGraficas.envio
      })
    }
    if (filtrosGraficas.pais) {
      filtros.push({
        tipo: 'pais',
        descripcion: obtenerDescripcionFiltro('pais', filtrosGraficas.pais),
        valor: filtrosGraficas.pais
      })
    }
    
    return filtros
  }
  
  // Calcular distribución por plataforma (dinámico)
  const distribucionPlataformas = useMemo(() => {
    const plataformasMap = new Map<string, number>()
    compradoresParaAnalisis.forEach(comprador => {
      const plataforma = comprador.plataforma || 'unknown'
      plataformasMap.set(plataforma, (plataformasMap.get(plataforma) || 0) + 1)
    })
    const total = compradoresParaAnalisis.length
    return Array.from(plataformasMap.entries())
      .map(([plataforma, count]) => ({
        plataforma,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }, [compradoresParaAnalisis])

  // Calcular distribución de envío
  const distribucionEnvio = useMemo(() => {
    const conEnvio = compradoresParaAnalisis.filter(c => c.is_shippable === true).length
    const sinEnvio = compradoresParaAnalisis.filter(c => c.is_shippable === false).length
    const sinDatos = compradoresParaAnalisis.filter(c => c.is_shippable === null || c.is_shippable === undefined).length
    const total = compradoresParaAnalisis.length
    
    return {
      conEnvio: { count: conEnvio, percentage: total > 0 ? (conEnvio / total) * 100 : 0 },
      sinEnvio: { count: sinEnvio, percentage: total > 0 ? (sinEnvio / total) * 100 : 0 },
      sinDatos: { count: sinDatos, percentage: total > 0 ? (sinDatos / total) * 100 : 0 }
    }
  }, [compradoresParaAnalisis])

  // Calcular distribución de precios
  const distribucionPrecios = useMemo(() => {
    const precios = compradoresParaAnalisis
      .map(c => c.precio_eur || 0)
      .filter(p => p > 0)
    
    if (precios.length === 0) {
      return []
    }
    
    const precioMin = Math.min(...precios)
    const precioMax = Math.max(...precios)
    const rango = precioMax - precioMin
    
    // Crear 5 rangos de precios
    const numRangos = 5
    const tamañoRango = rango / numRangos
    
    const rangos = Array.from({ length: numRangos }, (_, i) => {
      const min = precioMin + (i * tamañoRango)
      const max = i === numRangos - 1 ? precioMax : precioMin + ((i + 1) * tamañoRango)
      return {
        min: Math.floor(min),
        max: Math.ceil(max),
        count: 0
      }
    })
    
    // Contar anuncios en cada rango
    precios.forEach(precio => {
      for (let i = 0; i < rangos.length; i++) {
        if (i === rangos.length - 1) {
          // Último rango incluye el máximo
          if (precio >= rangos[i].min && precio <= rangos[i].max) {
            rangos[i].count++
            break
          }
        } else {
          if (precio >= rangos[i].min && precio < rangos[i].max) {
            rangos[i].count++
            break
          }
        }
      }
    })
    
    const total = precios.length
    return rangos.map(rango => ({
      ...rango,
      percentage: total > 0 ? (rango.count / total) * 100 : 0,
      label: `${formatPrice(rango.min)} - ${formatPrice(rango.max)}`
    }))
  }, [compradoresParaAnalisis])

  // Calcular distribución por ubicación
  const distribucionUbicacion = useMemo(() => {
    const ubicacionesMap = new Map<string, number>()
    compradoresParaAnalisis.forEach(comprador => {
      const ubicacion = comprador.ciudad_o_zona || 'Sin ubicación'
      ubicacionesMap.set(ubicacion, (ubicacionesMap.get(ubicacion) || 0) + 1)
    })
    const total = compradoresParaAnalisis.length
    return Array.from(ubicacionesMap.entries())
      .map(([ubicacion, count]) => ({
        ubicacion,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Mostrar solo las 10 ubicaciones más frecuentes
  }, [compradoresParaAnalisis])

  // Calcular distribución por país
  const distribucionPaises = useMemo(() => {
    const countryNames: Record<string, string> = {
      'ES': 'España',
      'IT': 'Italia',
      'FR': 'Francia',
      'PT': 'Portugal',
      'DE': 'Alemania',
      'GB': 'Reino Unido',
      'US': 'Estados Unidos',
      'MX': 'México',
      'AR': 'Argentina',
      'CO': 'Colombia',
      'CL': 'Chile',
      'PE': 'Perú',
    }
    
    const paisesMap = new Map<string, number>()
    compradoresParaAnalisis.forEach(comprador => {
      const countryCode = (comprador as any).country_code || 'N/A'
      if (countryCode !== 'N/A') {
        paisesMap.set(countryCode, (paisesMap.get(countryCode) || 0) + 1)
      }
    })
    
    const total = compradoresParaAnalisis.length
    return Array.from(paisesMap.entries())
      .map(([countryCode, count]) => ({
        countryCode,
        countryName: countryNames[countryCode] || countryCode,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }, [compradoresParaAnalisis])

  // Calcular relación precio vs antigüedad
  const relacionPrecioAntiguedad = useMemo(() => {
    const ahora = new Date()
    const categorias = {
      menosDe1Semana: { precios: [] as number[], label: language === 'es' ? '< 1 semana' : '< 1 week' },
      entre1Y4Semanas: { precios: [] as number[], label: language === 'es' ? '1-4 semanas' : '1-4 weeks' },
      entre1Y3Meses: { precios: [] as number[], label: language === 'es' ? '1-3 meses' : '1-3 months' },
      masDe3Meses: { precios: [] as number[], label: language === 'es' ? '> 3 meses' : '> 3 months' },
      sinFecha: { precios: [] as number[], label: language === 'es' ? 'Sin fecha' : 'No date' }
    }

    compradoresParaAnalisis.forEach(comprador => {
      const precio = comprador.precio_eur || 0
      if (precio <= 0) return

      const fechaPub = comprador.fecha_publicacion
      if (!fechaPub || fechaPub === 'ND' || fechaPub === '') {
        categorias.sinFecha.precios.push(precio)
        return
      }

      try {
        const fecha = new Date(fechaPub)
        if (isNaN(fecha.getTime())) {
          categorias.sinFecha.precios.push(precio)
          return
        }

        const diffMs = ahora.getTime() - fecha.getTime()
        const diffDias = diffMs / (1000 * 60 * 60 * 24)

        if (diffDias < 7) {
          categorias.menosDe1Semana.precios.push(precio)
        } else if (diffDias < 28) {
          categorias.entre1Y4Semanas.precios.push(precio)
        } else if (diffDias < 90) {
          categorias.entre1Y3Meses.precios.push(precio)
        } else {
          categorias.masDe3Meses.precios.push(precio)
        }
      } catch {
        categorias.sinFecha.precios.push(precio)
      }
    })

    return Object.entries(categorias).map(([key, data]) => {
      const precios = data.precios
      const promedio = precios.length > 0 
        ? precios.reduce((sum, p) => sum + p, 0) / precios.length 
        : 0
      const mediana = precios.length > 0
        ? (() => {
            const sorted = [...precios].sort((a, b) => a - b)
            const mid = Math.floor(sorted.length / 2)
            return sorted.length % 2 === 0
              ? (sorted[mid - 1] + sorted[mid]) / 2
              : sorted[mid]
          })()
        : 0

      return {
        categoria: key,
        label: data.label,
        count: precios.length,
        promedio: Math.round(promedio),
        mediana: Math.round(mediana),
        min: precios.length > 0 ? Math.min(...precios) : 0,
        max: precios.length > 0 ? Math.max(...precios) : 0
      }
    }).filter(item => item.count > 0)
  }, [compradoresParaAnalisis, language])

  // Calcular distribución de antigüedad
  const distribucionAntiguedad = useMemo(() => {
    const ahora = new Date()
    const categorias = {
      menosDe1Semana: 0,
      entre1Y4Semanas: 0,
      entre1Y3Meses: 0,
      masDe3Meses: 0,
      sinFecha: 0
    }

    compradoresParaAnalisis.forEach(comprador => {
      const fechaPub = comprador.fecha_publicacion
      if (!fechaPub || fechaPub === 'ND' || fechaPub === '') {
        categorias.sinFecha++
        return
      }

      try {
        const fecha = new Date(fechaPub)
        if (isNaN(fecha.getTime())) {
          categorias.sinFecha++
          return
        }

        const diffMs = ahora.getTime() - fecha.getTime()
        const diffDias = diffMs / (1000 * 60 * 60 * 24)

        if (diffDias < 7) {
          categorias.menosDe1Semana++
        } else if (diffDias < 30) {
          categorias.entre1Y4Semanas++
        } else if (diffDias < 90) {
          categorias.entre1Y3Meses++
        } else {
          categorias.masDe3Meses++
        }
      } catch {
        categorias.sinFecha++
      }
    })

    const total = compradoresParaAnalisis.length
    return {
      menosDe1Semana: { count: categorias.menosDe1Semana, percentage: total > 0 ? (categorias.menosDe1Semana / total) * 100 : 0 },
      entre1Y4Semanas: { count: categorias.entre1Y4Semanas, percentage: total > 0 ? (categorias.entre1Y4Semanas / total) * 100 : 0 },
      entre1Y3Meses: { count: categorias.entre1Y3Meses, percentage: total > 0 ? (categorias.entre1Y3Meses / total) * 100 : 0 },
      masDe3Meses: { count: categorias.masDe3Meses, percentage: total > 0 ? (categorias.masDe3Meses / total) * 100 : 0 },
      sinFecha: { count: categorias.sinFecha, percentage: total > 0 ? (categorias.sinFecha / total) * 100 : 0 }
    }
  }, [compradoresParaAnalisis])

  // Función para obtener el icono de plataforma
  const getPlatformIcon = (plataforma: string) => {
    const plataformaLower = plataforma.toLowerCase()
    if (plataformaLower.includes('wallapop')) {
      return '/images/wallapop.png'
    } else if (plataformaLower.includes('milanuncios')) {
      return '/images/milanuncios.png'
    }
    return null
  }

  // Función auxiliar para renderizar una fila de anuncio
  const renderFilaAnuncio = (comprador: Comprador, index: number) => {
    // Mapear estado a clase CSS
    const estadoClass = comprador.estado_declarado?.toLowerCase().replace(/\s+/g, '_') || 'usado'
    const estadoBadgeClasses: Record<string, string> = {
      nuevo: 'bg-green-100 text-green-800 border border-green-200',
      como_nuevo: 'bg-blue-100 text-blue-800 border border-blue-200',
      muy_buen_estado: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      buen_estado: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      usado: 'bg-orange-100 text-orange-800 border border-orange-200',
      aceptable: 'bg-gray-100 text-gray-800 border border-gray-200',
    }
    const badgeClass = estadoBadgeClasses[estadoClass] || 'bg-gray-100 text-gray-800 border border-gray-200'
    
    return (
      <tr 
        key={index} 
        className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all duration-200 cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('Click en fila, abriendo modal:', comprador)
          setAnuncioModal(comprador)
        }}
      >
        <td className="px-2 md:px-6 py-2 md:py-4">
          <div className="text-xs md:text-sm font-semibold text-gray-900">
            {comprador.titulo || 'N/A'}
          </div>
        </td>
        <td className="px-2 md:px-6 py-2 md:py-4">
          <div className="text-sm md:text-lg font-bold text-primary-600">
            {formatPrice(comprador.precio_eur)}
          </div>
        </td>
        <td className="px-2 md:px-6 py-2 md:py-4">
          <div className="flex items-center justify-center">
            {comprador.plataforma === 'milanuncios' ? (
              <Image
                src="/images/milanuncios.png"
                alt="Milanuncios"
                width={28}
                height={28}
                className="md:w-8 md:h-8 object-contain"
              />
            ) : comprador.plataforma === 'wallapop' ? (
              <Image
                src="/images/wallapop.png"
                alt="Wallapop"
                width={28}
                height={28}
                className="md:w-8 md:h-8 object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-xs text-gray-500">{comprador.plataforma || 'N/A'}</span>
            )}
          </div>
        </td>
        <td className="hidden md:table-cell px-6 py-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
            {comprador.estado_declarado || 'N/A'}
          </span>
        </td>
        <td className="hidden md:table-cell px-6 py-4">
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {comprador.ciudad_o_zona || 'N/A'}
          </div>
        </td>
        <td className="hidden md:table-cell px-6 py-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setAnuncioModal(comprador)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <span>{language === 'es' ? 'Ver' : 'View'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </td>
      </tr>
    )
  }

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error || !evaluacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'es' ? 'Error' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Evaluación no encontrada'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            {language === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${mostrarFiltrosModal ? 'overflow-hidden' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - A la izquierda del todo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
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
            
            {/* Right side: Language selector - A la derecha del todo */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col bg-gray-50 border-r border-gray-200 z-40">
          <div className="p-6 flex-1 overflow-y-auto">
            <nav className="space-y-1">
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  filtroActivo === 'dashboard'
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">{language === 'es' ? 'Dashboard' : 'Dashboard'}</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard?filtro=comprar')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  filtroActivo === 'comprar'
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium">{language === 'es' ? 'Compras' : 'Buy'}</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard?filtro=vender')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  filtroActivo === 'vender'
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{language === 'es' ? 'Ventas' : 'Sell'}</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard?filtro=favoritos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  filtroActivo === 'favoritos'
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{language === 'es' ? 'Favoritos' : 'Favorites'}</span>
              </button>
              
              <button
                onClick={() => setFiltroActivo('perfil')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  filtroActivo === 'perfil'
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{language === 'es' ? 'Perfil' : 'Profile'}</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 md:ml-64 min-w-0">
          <div className="p-2 md:p-6 lg:p-8 pb-24 md:pb-8">
            {/* Vista de Perfil */}
            {filtroActivo === 'perfil' ? (
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {language === 'es' ? 'Perfil' : 'Profile'}
                  </h2>
                  
                  {/* Botón Cerrar Sesión */}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                  </button>
                  
                  {/* Botón Soporte */}
                  <a
                    href="/contacto"
                    className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {language === 'es' ? 'Soporte' : 'Support'}
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {/* Botón volver a Compras/Ventas */}
                <div className="mb-3 md:mb-6">
                  <button
                    onClick={() => router.push(esVender ? '/dashboard?filtro=vender' : '/dashboard?filtro=comprar')}
                    className={`flex items-center gap-2 transition-colors group text-sm md:text-base ${
                      esVender 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">
                      {esVender 
                        ? (language === 'es' ? 'Volver a Ventas' : 'Back to Sales')
                        : (language === 'es' ? 'Volver a Compras' : 'Back to Buy')
                      }
                    </span>
                  </button>
                </div>

                <div className="bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-2xl p-3 md:p-6 lg:p-8">
                  {/* Header con diseño mejorado */}
                  <div className="mb-4 md:mb-8">
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 md:gap-4 mb-2 md:mb-3">
                            <h1 className="text-xl md:text-2xl font-bold flex-1">
                              {evaluacion.producto}
                            </h1>
                            {evaluacion.accion && (
                              <span className={`px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap shadow-lg ${
                                evaluacion.accion === 'quiero vender un producto'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                  : 'bg-white text-primary-600'
                              }`}>
                                {evaluacion.accion === 'quiero vender un producto'
                                  ? (language === 'es' ? 'Venta' : 'Sell')
                                  : (language === 'es' ? 'Compra' : 'Buy')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 md:gap-4 text-primary-100 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="text-xs font-medium">{evaluacion.categoria || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs">{formatDateShort(evaluacion.fecha)}</span>
                              {/* Botón de favorito a la derecha de la fecha */}
                              <button
                                onClick={() => toggleFavorito(evaluacion.id)}
                                className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                              >
                                <svg
                                  className={`w-5 h-5 ${favoritos.has(evaluacion?.solicitudId || evaluacion.id) ? 'fill-white text-white' : 'text-primary-100'}`}
                                  fill={favoritos.has(evaluacion?.solicitudId || evaluacion.id) ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Análisis de Mercado - Solo para Vender */}
                  {esVender && compradoresParaAnalisis.length > 0 && (
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {language === 'es' ? 'Análisis de Mercado' : 'Market Analysis'}
                      </h2>
                        {Object.keys(filtrosGraficas).length > 0 && (
                          <div className="flex items-center gap-2 relative" ref={filtrosActivosRef}>
                            <button
                              onClick={() => setMostrarFiltrosActivos(!mostrarFiltrosActivos)}
                              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer underline decoration-dotted underline-offset-2 transition-colors"
                            >
                              {language === 'es' ? `${Object.keys(filtrosGraficas).length} filtro${Object.keys(filtrosGraficas).length > 1 ? 's' : ''} activo${Object.keys(filtrosGraficas).length > 1 ? 's' : ''}` : `${Object.keys(filtrosGraficas).length} filter${Object.keys(filtrosGraficas).length > 1 ? 's' : ''} active`}
                            </button>
                            {mostrarFiltrosActivos && (
                              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px] max-w-md">
                                <div className="p-3 border-b border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {language === 'es' ? 'Filtros activos' : 'Active filters'}
                                    </h4>
                                    <button
                                      onClick={() => setMostrarFiltrosActivos(false)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="p-3 max-h-64 overflow-y-auto">
                                  <div className="space-y-2">
                                    {obtenerFiltrosActivos().map((filtro, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-700 flex-1">{filtro.descripcion}</span>
                                        <button
                                          onClick={() => {
                                            setFiltrosGraficas(prev => {
                                              const { [filtro.tipo as keyof typeof prev]: _, ...rest } = prev
                                              return rest
                                            })
                                          }}
                                          className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                          title={language === 'es' ? 'Eliminar filtro' : 'Remove filter'}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-3 border-t border-gray-200">
                                  <button
                                    onClick={() => {
                                      limpiarFiltrosGraficas()
                                      setMostrarFiltrosActivos(false)
                                    }}
                                    className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {language === 'es' ? 'Limpiar todos' : 'Clear all'}
                                  </button>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={limpiarFiltrosGraficas}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Gráfico 1: Distribución por Plataforma */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Distribución por Plataforma' : 'Platform Distribution'}
                          </h3>
                          <div className="space-y-3">
                            {distribucionPlataformas.map((item) => {
                              const iconPath = getPlatformIcon(item.plataforma)
                              const estaFiltrado = filtrosGraficas.plataforma === item.plataforma
                              return (
                                <div key={item.plataforma} className="flex items-center gap-3">
                                  {iconPath ? (
                                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10">
                                      <Image
                                        src={iconPath}
                                        alt={item.plataforma}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-semibold text-gray-600">
                                        {item.plataforma.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs md:text-sm font-medium text-gray-700 truncate capitalize">
                                        {item.plataforma}
                                      </span>
                                      <span className="text-xs md:text-sm font-semibold text-gray-900 ml-2">
                                        {item.count} ({item.percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div 
                                      className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                      onClick={() => handleClickBarra('plataforma', item.plataforma)}
                                    >
                                      <div
                                        className={`bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500 ${estaFiltrado ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Gráfico 2: Distribución de Precios */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Distribución de Precios' : 'Price Distribution'}
                          </h3>
                          <div className="space-y-3">
                            {distribucionPrecios.length > 0 ? (
                              distribucionPrecios.map((rango, index) => {
                                const maxCount = Math.max(...distribucionPrecios.map(r => r.count))
                                const altura = maxCount > 0 ? (rango.count / maxCount) * 100 : 0
                                const estaFiltrado = filtrosGraficas.rangoPrecio?.min === rango.min && filtrosGraficas.rangoPrecio?.max === rango.max
                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="mb-1">
                                        <span className="text-xs font-medium text-gray-700">
                                          {rango.label}
                                        </span>
                                      </div>
                                      <div 
                                        className="w-full bg-gray-200 rounded-full h-5 relative overflow-visible flex items-center cursor-pointer hover:bg-gray-300 transition-colors"
                                        onClick={() => handleClickBarra('rangoPrecio', { min: rango.min, max: rango.max })}
                                      >
                                        <div
                                          className={`bg-gradient-to-r from-blue-500 to-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2 relative flex-shrink-0 ${estaFiltrado ? 'ring-2 ring-blue-700 ring-offset-2' : ''}`}
                                          style={{ width: `${altura}%` }}
                                        >
                                          {rango.count > 0 && altura > 30 && (
                                            <span className="text-xs font-semibold text-white">
                                              {rango.percentage.toFixed(1)}%
                                            </span>
                                          )}
                                    </div>
                                    {rango.count > 0 && altura <= 30 && (
                                          <span className="text-xs font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                        {rango.percentage.toFixed(1)}%
                                      </span>
                                    )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                {language === 'es' ? 'No hay datos de precios disponibles' : 'No price data available'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Gráfico 3: Distribución por Ubicación */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Distribución por Ubicación' : 'Location Distribution'}
                          </h3>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {distribucionUbicacion.length > 0 ? (
                              distribucionUbicacion.map((item, index) => {
                                const estaFiltrado = filtrosGraficas.ubicacion === item.ubicacion
                                return (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs md:text-sm font-medium text-gray-700 truncate">
                                        {item.ubicacion}
                                      </span>
                                      <span className="text-xs md:text-sm font-semibold text-gray-900 ml-2">
                                        {item.percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                      <div 
                                        className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                        onClick={() => handleClickBarra('ubicacion', item.ubicacion)}
                                      >
                                      <div
                                          className={`bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ${estaFiltrado ? 'ring-2 ring-green-700 ring-offset-1' : ''}`}
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                )
                              })
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                {language === 'es' ? 'No hay datos de ubicación disponibles' : 'No location data available'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Gráfico 4: Disponibilidad de Envío */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Disponibilidad de Envío' : 'Shipping Availability'}
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span className="text-xs md:text-sm font-medium text-gray-700">
                                    {language === 'es' ? 'Con envío' : 'With shipping'}
                                  </span>
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionEnvio.conEnvio.count} ({distribucionEnvio.conEnvio.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('envio', 'conEnvio')}
                              >
                                <div
                                  className={`bg-green-500 h-3 rounded-full transition-all duration-500 ${filtrosGraficas.envio === 'conEnvio' ? 'ring-2 ring-green-700 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionEnvio.conEnvio.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                  <span className="text-xs md:text-sm font-medium text-gray-700">
                                    {language === 'es' ? 'Solo recogida' : 'Pickup only'}
                                  </span>
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionEnvio.sinEnvio.count} ({distribucionEnvio.sinEnvio.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('envio', 'sinEnvio')}
                              >
                                <div
                                  className={`bg-orange-500 h-3 rounded-full transition-all duration-500 ${filtrosGraficas.envio === 'sinEnvio' ? 'ring-2 ring-orange-700 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionEnvio.sinEnvio.percentage}%` }}
                                />
                              </div>
                            </div>
                            {distribucionEnvio.sinDatos.count > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700">
                                      {language === 'es' ? 'Sin datos' : 'No data'}
                                    </span>
                                  </div>
                                  <span className="text-xs md:text-sm font-semibold text-gray-900">
                                    {distribucionEnvio.sinDatos.count} ({distribucionEnvio.sinDatos.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div 
                                  className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                  onClick={() => handleClickBarra('envio', 'sinDatos')}
                                >
                                  <div
                                    className={`bg-gray-400 h-3 rounded-full transition-all duration-500 ${filtrosGraficas.envio === 'sinDatos' ? 'ring-2 ring-gray-600 ring-offset-1' : ''}`}
                                    style={{ width: `${distribucionEnvio.sinDatos.percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gráfico 5: Distribución por País */}
                        {distribucionPaises.length > 0 && (
                          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                              {language === 'es' ? 'Distribución por País' : 'Distribution by Country'}
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                              {distribucionPaises.map((item) => {
                                const estaFiltrado = filtrosGraficas.pais === item.countryCode
                                const getCountryFlag = (countryCode: string) => {
                                  const flagEmojis: Record<string, string> = {
                                    'ES': '🇪🇸',
                                    'IT': '🇮🇹',
                                    'FR': '🇫🇷',
                                    'PT': '🇵🇹',
                                    'DE': '🇩🇪',
                                    'GB': '🇬🇧',
                                    'US': '🇺🇸',
                                    'MX': '🇲🇽',
                                    'AR': '🇦🇷',
                                    'CO': '🇨🇴',
                                    'CL': '🇨🇱',
                                    'PE': '🇵🇪',
                                  }
                                  return flagEmojis[countryCode] || '🌍'
                                }
                                return (
                                  <div key={item.countryCode} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                                      <span className="text-lg md:text-xl">
                                        {getCountryFlag(item.countryCode)}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs md:text-sm font-medium text-gray-700 truncate">
                                          {item.countryName}
                                        </span>
                                        <span className="text-xs md:text-sm font-semibold text-gray-900 ml-2">
                                          {item.count} ({item.percentage.toFixed(1)}%)
                                        </span>
                                      </div>
                                      <div 
                                        className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                        onClick={() => handleClickBarra('pais', item.countryCode)}
                                      >
                                        <div
                                          className={`bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ${estaFiltrado ? 'ring-2 ring-blue-700 ring-offset-1' : ''}`}
                                          style={{ width: `${item.percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Gráfico 6: Precio vs Antigüedad */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Precio vs Antigüedad' : 'Price vs Age'}
                          </h3>
                          <div className="space-y-3">
                            {relacionPrecioAntiguedad.length > 0 ? (() => {
                              const totalAnuncios = relacionPrecioAntiguedad.reduce((sum, item) => sum + item.count, 0)
                              return relacionPrecioAntiguedad.map((item, index) => {
                                const maxPrecio = Math.max(...relacionPrecioAntiguedad.map(i => i.promedio))
                                const alturaPromedio = maxPrecio > 0 ? (item.promedio / maxPrecio) * 100 : 0
                                const porcentaje = totalAnuncios > 0 ? (item.count / totalAnuncios) * 100 : 0
                                const rangoPrecios = item.min > 0 && item.max > 0 
                                  ? `${formatPrice(item.min)} - ${formatPrice(item.max)}`
                                  : formatPrice(item.promedio)
                                const estaFiltrado = filtrosGraficas.precioAntiguedad === item.categoria
                                return (
                                  <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-700">
                                        {item.label}
                                      </span>
                                      <span className="text-xs font-semibold text-gray-900">
                                        {rangoPrecios}
                                      </span>
                                    </div>
                                    <div 
                                      className="w-full bg-gray-200 rounded-full h-4 relative overflow-visible flex items-center cursor-pointer hover:bg-gray-300 transition-colors"
                                      onClick={() => handleClickBarra('precioAntiguedad', item.categoria)}
                                    >
                                      <div
                                        className={`bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 flex-shrink-0 ${estaFiltrado ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                        style={{ width: `${alturaPromedio}%` }}
                                      >
                                        {item.count > 0 && alturaPromedio > 20 && (
                                          <span className="text-[10px] font-semibold text-white">
                                            {porcentaje.toFixed(1)}%
                                          </span>
                                        )}
                                      </div>
                                      {item.count > 0 && alturaPromedio <= 20 && (
                                        <span className="text-[10px] font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                          {porcentaje.toFixed(1)}%
                                        </span>
                                    )}
                                    </div>
                                  </div>
                                )
                              })
                            })() : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                {language === 'es' ? 'No hay datos disponibles' : 'No data available'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Gráfico 6: Antigüedad de Anuncios */}
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                            {language === 'es' ? 'Antigüedad de Anuncios' : 'Listing Age'}
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs md:text-sm font-medium text-gray-700">
                                  {language === 'es' ? '< 1 semana' : '< 1 week'}
                                </span>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionAntiguedad.menosDe1Semana.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('antiguedad', 'menosDe1Semana')}
                              >
                                <div
                                  className={`bg-blue-500 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.antiguedad === 'menosDe1Semana' ? 'ring-2 ring-blue-700 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionAntiguedad.menosDe1Semana.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs md:text-sm font-medium text-gray-700">
                                  {language === 'es' ? '1-4 semanas' : '1-4 weeks'}
                                </span>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionAntiguedad.entre1Y4Semanas.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('antiguedad', 'entre1Y4Semanas')}
                              >
                                <div
                                  className={`bg-indigo-500 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.antiguedad === 'entre1Y4Semanas' ? 'ring-2 ring-indigo-700 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionAntiguedad.entre1Y4Semanas.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs md:text-sm font-medium text-gray-700">
                                  {language === 'es' ? '1-3 meses' : '1-3 months'}
                                </span>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionAntiguedad.entre1Y3Meses.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('antiguedad', 'entre1Y3Meses')}
                              >
                                <div
                                  className={`bg-purple-500 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.antiguedad === 'entre1Y3Meses' ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionAntiguedad.entre1Y3Meses.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs md:text-sm font-medium text-gray-700">
                                  {language === 'es' ? '> 3 meses' : '> 3 months'}
                                </span>
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {distribucionAntiguedad.masDe3Meses.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                onClick={() => handleClickBarra('antiguedad', 'masDe3Meses')}
                              >
                                <div
                                  className={`bg-gray-600 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.antiguedad === 'masDe3Meses' ? 'ring-2 ring-gray-800 ring-offset-1' : ''}`}
                                  style={{ width: `${distribucionAntiguedad.masDe3Meses.percentage}%` }}
                                />
                              </div>
                            </div>
                            {distribucionAntiguedad.sinFecha.count > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs md:text-sm font-medium text-gray-700">
                                    {language === 'es' ? 'Sin fecha' : 'No date'}
                                  </span>
                                  <span className="text-xs md:text-sm font-semibold text-gray-900">
                                    {distribucionAntiguedad.sinFecha.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div 
                                  className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                  onClick={() => handleClickBarra('antiguedad', 'sinFecha')}
                                >
                                  <div
                                    className={`bg-gray-400 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.antiguedad === 'sinFecha' ? 'ring-2 ring-gray-600 ring-offset-1' : ''}`}
                                    style={{ width: `${distribucionAntiguedad.sinFecha.percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sección de Precios Recomendados - Solo para Vender */}
                  {esVender && evaluacion.scraping.jsonVendedores?.vendedores && (
                    <div className="mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Precios Recomendados' : 'Recommended Prices'}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {evaluacion.scraping.jsonVendedores.vendedores.map((vendedor) => {
                          const getPrecioInfo = () => {
                            switch (vendedor.tipo_precio) {
                              case 'minimo':
                                return {
                                  icon: '/images/precio_minimo.png',
                                  title: language === 'es' ? 'Precio Mínimo' : 'Minimum Price',
                                  description: language === 'es' 
                                    ? 'Estrategia agresiva, precio por debajo del más barato del mercado'
                                    : 'Aggressive strategy, price below the cheapest in the market',
                                  color: 'from-red-500 to-orange-500'
                                }
                              case 'ideal':
                                return {
                                  icon: '/images/precio_ideal.png',
                                  title: language === 'es' ? 'Precio Ideal' : 'Ideal Price',
                                  description: language === 'es'
                                    ? 'Precio de venta alineado al precio de mercado actual'
                                    : 'Sale price aligned with current market price',
                                  color: 'from-green-500 to-emerald-600'
                                }
                              case 'rapido':
                                return {
                                  icon: '/images/precio_rapido.png',
                                  title: language === 'es' ? 'Precio Rápido' : 'Quick Price',
                                  description: language === 'es'
                                    ? 'Precio orientado a venta ágil sin asumir riesgos'
                                    : 'Price oriented to quick sale without taking risks',
                                  color: 'from-blue-500 to-indigo-600'
                                }
                              default:
                                return null
                            }
                          }

                          const precioInfo = getPrecioInfo()
                          if (!precioInfo) return null

                          return (
                            <div key={vendedor.tipo_precio} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                                  <Image
                                    src={precioInfo.icon}
                                    alt={precioInfo.title}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                                    {precioInfo.title}
                                  </h3>
                                  <p className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${precioInfo.color} bg-clip-text text-transparent`}>
                                    {formatPrice(vendedor.precio_eur)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center cursor-help flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-great-vibes text-gray-600">i</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {precioInfo.description}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Barra de búsqueda y filtros - Solo para Comprar */}
                  {!esVender && (
                  <div className="mb-6 flex flex-row gap-2 sm:gap-3 items-center">
                    {/* Barra de búsqueda con diseño de "comprar" (justificada a la izquierda) */}
                    <div className="flex-1 relative flex items-stretch border-2 border-primary-500 rounded-full overflow-hidden shadow-md min-w-0">
                      <div className="relative flex-1 flex items-center min-w-0">
                        <svg className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={busquedaTexto}
                          onChange={(e) => setBusquedaTexto(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              // La búsqueda se aplica automáticamente al cambiar el estado
                            }
                          }}
                          placeholder={language === 'es' ? 'Filtra tus anuncios seleccionados...' : 'Search in listings...'}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 focus:outline-none bg-transparent placeholder:text-xs"
                          style={{ 
                            fontSize: '16px',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                    </div>

                    {/* Botón Filtros (icono circular) */}
                    <button
                      onClick={() => setMostrarFiltrosModal(true)}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg flex-shrink-0"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    
                    {/* Selector de vista para anuncios */}
                    <div className="flex items-center border border-primary-500 rounded-full overflow-hidden flex-shrink-0">
                      {/* Botón Vista Lista (3 rayas) */}
                      <button
                        onClick={() => setVistaAnuncios('lista')}
                        className={`px-2 py-1.5 md:px-1.5 md:py-1 flex items-center justify-center transition-colors min-w-[44px] min-h-[36px] md:min-w-0 md:min-h-0 ${
                          vistaAnuncios === 'lista'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      {/* Botón Vista Fichas (4 cuadraditos) */}
                      <button
                        onClick={() => setVistaAnuncios('fichas')}
                        className={`px-2 py-1.5 md:px-1.5 md:py-1 flex items-center justify-center border-l border-primary-500 transition-colors min-w-[44px] min-h-[36px] md:min-w-0 md:min-h-0 ${
                          vistaAnuncios === 'fichas'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  )}

                  {/* Modal de Filtros - Solo para Comprar */}
                  {!esVender && mostrarFiltrosModal && (
                    <>
                      {/* Overlay */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={() => setMostrarFiltrosModal(false)}
                        onTouchMove={(e) => e.preventDefault()}
                        style={{ touchAction: 'none' }}
                      />
                      {/* Modal */}
                      <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setMostrarFiltrosModal(false)
                          }
                        }}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => {
                          if (e.target === e.currentTarget) {
                            e.preventDefault()
                          }
                        }}
                        style={{ touchAction: 'none', overflow: 'hidden' }}
                      >
                        <div 
                          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-6 relative max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {/* Botón cerrar */}
                          <button
                            onClick={() => setMostrarFiltrosModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">
                            {language === 'es' ? 'Filtros' : 'Filters'}
                          </h3>
                          
                          {/* Slider de Rango de Precio */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'es' ? 'Rango de precios' : 'Price range'}
                            </label>
                            <div className="relative">
                              {/* Línea del slider */}
                              <div 
                                ref={sliderContainerRef}
                                className="relative h-2 bg-gray-200 rounded-full"
                              >
                                {/* Barra de progreso entre mínimo y máximo */}
                                <div 
                                  className="absolute h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full top-0"
                                  style={{ 
                                    left: filtros.precioMinimo === 0 
                                      ? '0%' 
                                      : `${((filtros.precioMinimo - precioMinimo) / (precioMaximo - precioMinimo)) * 100}%`,
                                    width: (() => {
                                      const minPos = filtros.precioMinimo === 0 
                                        ? 0 
                                        : ((filtros.precioMinimo - precioMinimo) / (precioMaximo - precioMinimo)) * 100
                                      const maxPos = filtros.precioMaximo === 0 
                                        ? 100 
                                        : ((filtros.precioMaximo - precioMinimo) / (precioMaximo - precioMinimo)) * 100
                                      return `${maxPos - minPos}%`
                                    })()
                                  }}
                                />
                                
                                {/* Input para precio mínimo */}
                                <input
                                  data-range="min"
                                  type="range"
                                  min={precioMinimo}
                                  max={filtros.precioMaximo > 0 ? filtros.precioMaximo : precioMaximo}
                                  step={Math.max(1, Math.floor((precioMaximo - precioMinimo) / 100))}
                                  value={filtros.precioMinimo === 0 ? precioMinimo : filtros.precioMinimo}
                                  onMouseDown={(e) => {
                                    const input = e.currentTarget as HTMLInputElement
                                    input.style.zIndex = '30'
                                    const maxInput = sliderContainerRef.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                    if (maxInput) maxInput.style.zIndex = '10'
                                  }}
                                  onTouchStart={(e) => {
                                    const input = e.currentTarget as HTMLInputElement
                                    input.style.zIndex = '30'
                                    const maxInput = sliderContainerRef.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                    if (maxInput) maxInput.style.zIndex = '10'
                                  }}
                                  onChange={(e) => {
                                    const valor = parseFloat(e.target.value)
                                    // Asegurar que el mínimo no sea mayor que el máximo
                                    if (filtros.precioMaximo > 0 && valor > filtros.precioMaximo) {
                                      setFiltros({ ...filtros, precioMinimo: filtros.precioMaximo })
                                    } else if (valor <= precioMinimo) {
                                      setFiltros({ ...filtros, precioMinimo: 0 })
                                    } else {
                                      setFiltros({ ...filtros, precioMinimo: valor })
                                    }
                                  }}
                                  className="absolute w-full h-8 opacity-0 cursor-pointer"
                                  style={{ 
                                    background: 'transparent',
                                    WebkitAppearance: 'none',
                                    appearance: 'none',
                                    top: '-12px',
                                    margin: 0,
                                    padding: 0,
                                    zIndex: 15,
                                    touchAction: 'none'
                                  }}
                                />
                                
                                {/* Input para precio máximo */}
                                <input
                                  data-range="max"
                                  type="range"
                                  min={filtros.precioMinimo > 0 ? filtros.precioMinimo : precioMinimo}
                                  max={precioMaximo}
                                  step={Math.max(1, Math.floor((precioMaximo - precioMinimo) / 100))}
                                  value={filtros.precioMaximo === 0 ? precioMaximo : filtros.precioMaximo}
                                  onMouseDown={(e) => {
                                    const input = e.currentTarget as HTMLInputElement
                                    input.style.zIndex = '30'
                                    const minInput = sliderContainerRef.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                    if (minInput) minInput.style.zIndex = '10'
                                  }}
                                  onTouchStart={(e) => {
                                    const input = e.currentTarget as HTMLInputElement
                                    input.style.zIndex = '30'
                                    const minInput = sliderContainerRef.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                    if (minInput) minInput.style.zIndex = '10'
                                  }}
                                  onChange={(e) => {
                                    const valor = parseFloat(e.target.value)
                                    // Asegurar que el máximo no sea menor que el mínimo
                                    if (filtros.precioMinimo > 0 && valor < filtros.precioMinimo) {
                                      setFiltros({ ...filtros, precioMaximo: filtros.precioMinimo })
                                    } else if (valor >= precioMaximo) {
                                      setFiltros({ ...filtros, precioMaximo: 0 })
                                    } else {
                                      setFiltros({ ...filtros, precioMaximo: valor })
                                    }
                                  }}
                                  className="absolute w-full h-8 opacity-0 cursor-pointer"
                                  style={{ 
                                    background: 'transparent',
                                    WebkitAppearance: 'none',
                                    appearance: 'none',
                                    top: '-12px',
                                    margin: 0,
                                    padding: 0,
                                    zIndex: 15,
                                    touchAction: 'none'
                                  }}
                                />
                                
                                {/* Bolita para precio mínimo - Ahora arrastrable */}
                                <div
                                  className="absolute w-6 h-6 bg-primary-600 rounded-full shadow-lg border-2 border-white cursor-pointer z-30"
                                  style={{ 
                                    left: filtros.precioMinimo === 0
                                      ? '0px'
                                      : `calc(${((filtros.precioMinimo - precioMinimo) / (precioMaximo - precioMinimo)) * 100}% - 12px)`,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    touchAction: 'none'
                                  }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation()
                                    setArrastrando('min')
                                    const input = sliderContainerRef.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                    if (input) {
                                      input.style.zIndex = '30'
                                      const maxInput = sliderContainerRef.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                      if (maxInput) maxInput.style.zIndex = '10'
                                    }
                                  }}
                                />
                                
                                {/* Bolita para precio máximo - Ahora arrastrable */}
                                <div
                                  className="absolute w-6 h-6 bg-primary-600 rounded-full shadow-lg border-2 border-white cursor-pointer z-30"
                                  style={{ 
                                    left: filtros.precioMaximo === 0
                                      ? `calc(100% - 12px)`
                                      : `calc(${((filtros.precioMaximo - precioMinimo) / (precioMaximo - precioMinimo)) * 100}% - 12px)`,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    touchAction: 'none'
                                  }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation()
                                    setArrastrando('max')
                                    const input = sliderContainerRef.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                    if (input) {
                                      input.style.zIndex = '30'
                                      const minInput = sliderContainerRef.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                      if (minInput) minInput.style.zIndex = '10'
                                    }
                                  }}
                                />
                              </div>
                              
                              {/* Valores mostrados debajo del slider */}
                              <div className="mt-2 flex justify-center gap-3">
                                <div className="inline-block px-2 py-0.5 bg-primary-100 rounded-full">
                                  <span className="text-xs font-semibold text-primary-700">
                                    {filtros.precioMinimo === 0 
                                      ? (language === 'es' ? 'Mín: Sin límite' : 'Min: No limit')
                                      : `${language === 'es' ? 'Mín: ' : 'Min: '}${formatPrice(filtros.precioMinimo)}`
                                    }
                                  </span>
                                </div>
                                <div className="inline-block px-2 py-0.5 bg-primary-100 rounded-full">
                                  <span className="text-xs font-semibold text-primary-700">
                                    {filtros.precioMaximo === 0 
                                      ? (language === 'es' ? 'Máx: Sin límite' : 'Max: No limit')
                                      : `${language === 'es' ? 'Máx: ' : 'Max: '}${formatPrice(filtros.precioMaximo)}`
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Filtro por estado (estrellas) */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'es' ? 'Estado mínimo' : 'Minimum condition'}
                            </label>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((estrella) => (
                                <button
                                  key={estrella}
                                  type="button"
                                  onClick={() => {
                                    // Si se hace click en la estrella seleccionada, deseleccionar (0 = sin filtro)
                                    if (filtros.estadoMinimo === estrella) {
                                      setFiltros({ ...filtros, estadoMinimo: 0 })
                                    } else {
                                      setFiltros({ ...filtros, estadoMinimo: estrella })
                                    }
                                  }}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                  aria-label={`${estrella} ${estrella === 1 ? 'estrella' : 'estrellas'}`}
                                >
                                  <svg
                                    className={`w-8 h-8 ${
                                      filtros.estadoMinimo >= estrella
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 fill-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                            {filtros.estadoMinimo > 0 && (
                              <p className="mt-1 text-xs text-gray-600">
                                {language === 'es' 
                                  ? `Mostrando: ${filtros.estadoMinimo === 1 ? 'Necesita reparación' : filtros.estadoMinimo === 2 ? 'Usado' : filtros.estadoMinimo === 3 ? 'Buen estado' : filtros.estadoMinimo === 4 ? 'Como nuevo' : 'Nuevo'} o mejor`
                                  : `Showing: ${filtros.estadoMinimo === 1 ? 'Needs repair' : filtros.estadoMinimo === 2 ? 'Used' : filtros.estadoMinimo === 3 ? 'Good condition' : filtros.estadoMinimo === 4 ? 'Like new' : 'New'} or better`}
                              </p>
                            )}
                          </div>

                          {/* Selector de tipo de envío (píldora) - Solo 2 opciones */}
                          <div className="mb-3">
                            <div className="relative bg-gray-100 rounded-full p-0.5 flex">
                              <button
                                onClick={() => setFiltros({ ...filtros, tipoEnvio: 'envio' })}
                                className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
                                  filtros.tipoEnvio === 'envio'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {language === 'es' ? 'Con envío' : 'With shipping'}
                              </button>
                              <button
                                onClick={() => setFiltros({ ...filtros, tipoEnvio: 'mano' })}
                                className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
                                  filtros.tipoEnvio === 'mano'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {language === 'es' ? 'Trato en mano' : 'Hand delivery'}
                              </button>
                            </div>
                          </div>

                          {/* Filtro por Top Profile */}
                          <div className="mb-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filtros.soloTopProfile}
                                onChange={(e) => setFiltros({ ...filtros, soloTopProfile: e.target.checked })}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {language === 'es' ? 'Solo perfiles top' : 'Top profiles only'}
                              </span>
                            </label>
                            <p className="mt-0.5 text-xs text-gray-500 ml-8">
                              {language === 'es' 
                                ? 'Mostrar solo anuncios de vendedores con perfil verificado' 
                                : 'Show only listings from verified seller profiles'}
                            </p>
                          </div>

                          {/* Filtro por País */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'es' ? 'País' : 'Country'}
                            </label>
                            <select
                              value={filtros.pais}
                              onChange={(e) => setFiltros({ ...filtros, pais: e.target.value })}
                              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">{language === 'es' ? 'Todos los países' : 'All countries'}</option>
                              {(() => {
                                const countryNames: Record<string, string> = {
                                  'ES': 'España',
                                  'IT': 'Italia',
                                  'FR': 'Francia',
                                  'PT': 'Portugal',
                                  'DE': 'Alemania',
                                  'GB': 'Reino Unido',
                                  'US': 'Estados Unidos',
                                  'MX': 'México',
                                  'AR': 'Argentina',
                                  'CO': 'Colombia',
                                  'CL': 'Chile',
                                  'PE': 'Perú',
                                }
                                
                                // Obtener países únicos de los compradores
                                const paisesUnicos = new Set<string>()
                                compradoresOriginales.forEach(comprador => {
                                  const countryCode = (comprador as any).country_code
                                  if (countryCode && countryCode !== 'N/A') {
                                    paisesUnicos.add(countryCode)
                                  }
                                })
                                
                                return Array.from(paisesUnicos).sort().map(countryCode => (
                                  <option key={countryCode} value={countryCode}>
                                    {countryNames[countryCode] || countryCode}
                                  </option>
                                ))
                              })()}
                            </select>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-3 items-center">
                            {/* Botón eliminar filtros */}
                            <button
                              onClick={() => {
                                setFiltros({
                                  precioMinimo: 0,
                                  precioMaximo: 0,
                                  tipoEnvio: 'envio',
                                  estadoMinimo: 0,
                                  soloTopProfile: false,
                                  pais: ''
                                })
                              }}
                              className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
                              aria-label={language === 'es' ? 'Eliminar filtros' : 'Clear filters'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            {/* Botón aplicar */}
                            <button
                              onClick={() => setMostrarFiltrosModal(false)}
                              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                            >
                              {language === 'es' ? 'Aplicar filtros' : 'Apply filters'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Sección "Nuestros preferidos" - Los 4 más baratos (solo para búsquedas completas y Comprar) */}
                  {!esVender && anunciosPreferidos.length > 0 && evaluacion.scraping.tipoBusqueda !== 'directa' && (
                    <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden mb-6">
                      <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-3 md:p-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg md:text-2xl font-bold text-white">
                          {language === 'es' ? 'Nuestros preferidos' : 'Our favorites'}
                        </h2>
                          {evaluacion.scraping?.tipoBusqueda === 'completa' && (
                            <button
                              onClick={abrirPanelInfo}
                              className="px-3 py-1.5 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium flex items-center gap-1 flex-shrink-0 shadow-lg"
                            >
                              <span>+ info</span>
                            </button>
                          )}
                        </div>
                      </div>
                      {vistaAnuncios === 'lista' ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                              <tr>
                                <th className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Título' : 'Title'}</th>
                                <th className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Precio' : 'Price'}</th>
                                <th className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Plataforma' : 'Platform'}</th>
                                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Estado' : 'Condition'}</th>
                                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Ciudad' : 'City'}</th>
                                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Acción' : 'Action'}</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {anunciosPreferidos.map((comprador, index) => renderFilaAnuncio(comprador, index))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Vista Fichas */
                        <div className="grid grid-cols-2 gap-4 p-4">
                          {anunciosPreferidos.map((comprador, index) => (
                            <div
                              key={index}
                              onClick={() => setAnuncioModal(comprador)}
                              className="bg-white rounded-xl shadow-lg p-2 md:p-3 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                            >
                              {/* Foto */}
                              {comprador.product_image ? (
                                <div className="mb-1.5 rounded-lg overflow-hidden aspect-square">
                                  <img
                                    src={comprador.product_image}
                                    alt={comprador.titulo || 'Producto'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="mb-1.5 rounded-lg bg-gray-200 aspect-square flex items-center justify-center">
                                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              
                              {/* Título e icono de plataforma */}
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 flex-1">
                                  {comprador.titulo}
                                </h4>
                                {comprador.plataforma && (
                                  <a
                                    href={comprador.url_anuncio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-shrink-0"
                                  >
                                    <img
                                      src={comprador.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                      alt={comprador.plataforma}
                                      className="h-5 w-auto"
                                    />
                                  </a>
                                )}
                              </div>
                              
                              {/* Precio */}
                              <div className="flex items-center justify-start">
                                <p className="text-sm md:text-base font-bold text-primary-600">
                                  {comprador.precio_eur ? `${comprador.precio_eur.toFixed(2)}€` : 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tabla de compradores con diseño mejorado - Colapsable - Solo para Comprar */}
                  {!esVender && (
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
                    <button
                      onClick={() => setMostrarTodosAnuncios(!mostrarTodosAnuncios)}
                      className="w-full bg-gradient-to-r from-primary-600 to-purple-600 p-3 md:p-6 hover:from-primary-700 hover:to-purple-700 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
                            {language === 'es' ? 'Todos los anuncios disponibles' : 'All available listings'}
                          </h2>
                        </div>
                        <svg 
                          className={`w-6 h-6 text-white transition-transform duration-200 ${mostrarTodosAnuncios ? 'transform rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {mostrarTodosAnuncios && (
                      <>
                        {compradores.length === 0 ? (
                          <div className="p-8 md:p-12 text-center text-gray-500">
                            <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-base md:text-lg font-medium">
                              {language === 'es' ? 'No se encontraron anuncios disponibles para este producto.' : 'No listings found for this product.'}
                            </p>
                          </div>
                        ) : vistaAnuncios === 'lista' ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Título' : 'Title'}</th>
                                  <th 
                                  className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none"
                                  onClick={() => setOrdenPrecio(ordenPrecio === 'desc' ? 'asc' : 'desc')}
                                >
                                  <div className="flex items-center gap-1">
                                    {language === 'es' ? 'Precio' : 'Price'}
                                    {ordenPrecio === 'desc' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                    {ordenPrecio === 'asc' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    )}
                                  </div>
                                </th>
                                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Plataforma' : 'Platform'}</th>
                                  <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Estado' : 'Condition'}</th>
                                  <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Ciudad' : 'City'}</th>
                                  <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Acción' : 'Action'}</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {compradores.map((comprador, index) => renderFilaAnuncio(comprador, index))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* Vista Fichas */
                          <div className="grid grid-cols-2 gap-4 p-4">
                            {compradores.map((comprador, index) => (
                              <div
                                key={index}
                                onClick={() => setAnuncioModal(comprador)}
                                className="bg-white rounded-xl shadow-lg p-2 md:p-3 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                              >
                                {/* Foto */}
                                {comprador.product_image ? (
                                  <div className="mb-1.5 rounded-lg overflow-hidden aspect-square">
                                    <img
                                      src={comprador.product_image}
                                      alt={comprador.titulo || 'Producto'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="mb-1.5 rounded-lg bg-gray-200 aspect-square flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                
                                {/* Título e icono de plataforma */}
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 flex-1">
                                    {comprador.titulo}
                                  </h4>
                                  {comprador.plataforma && (
                                    <a
                                      href={comprador.url_anuncio}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-shrink-0"
                                    >
                                      <img
                                        src={comprador.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                        alt={comprador.plataforma}
                                        className="h-5 w-auto"
                                      />
                                    </a>
                                  )}
                                </div>
                                
                                {/* Precio */}
                                <div className="flex items-center justify-start">
                                  <p className="text-sm md:text-base font-bold text-primary-600">
                                    {comprador.precio_eur ? `${comprador.precio_eur.toFixed(2)}€` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior - Solo visible en móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16">
          {/* Resumen */}
          <button
            onClick={() => router.push('/dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'dashboard' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'dashboard' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Dashboard' : 'Dashboard'}
            </span>
          </button>

          {/* Comprar */}
          <button
            onClick={() => router.push('/dashboard?filtro=comprar')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'comprar' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'comprar' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Compras' : 'Buy'}
            </span>
          </button>

          {/* Vender */}
          <button
            onClick={() => router.push('/dashboard?filtro=vender')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'vender' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'vender' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Ventas' : 'Sell'}
            </span>
          </button>

          {/* Favoritos */}
          <button
            onClick={() => router.push('/dashboard?filtro=favoritos')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'favoritos' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'favoritos' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Favoritos' : 'Favorites'}
            </span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => setFiltroActivo('perfil')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              filtroActivo === 'perfil' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`text-xs font-medium ${filtroActivo === 'perfil' ? 'text-green-600' : 'text-gray-500'}`}>
              {language === 'es' ? 'Perfil' : 'Profile'}
            </span>
          </button>
        </div>
      </nav>

      {/* Modal de anuncio */}
      {anuncioModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', zIndex: 9999 }}
          onClick={() => {
            console.log('Click en overlay, cerrando modal')
            setAnuncioModal(null)
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ position: 'relative', zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {language === 'es' ? 'Detalles del anuncio' : 'Listing details'}
              </h3>
              <button
                onClick={() => setAnuncioModal(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {/* Imagen del producto */}
              {anuncioModal.product_image ? (
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 max-h-[300px] flex items-center justify-center">
                  <Image
                    src={anuncioModal.product_image}
                    alt={anuncioModal.titulo}
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain max-h-[300px]"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="mb-4 rounded-lg bg-gray-100 aspect-video flex items-center justify-center max-h-[300px]">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Título con icono de plataforma */}
              <div className="mb-3 flex items-start gap-3">
                <h4 className="text-xl font-bold text-gray-900 flex-1">
                  {anuncioModal.titulo}
                </h4>
                <a
                  href={anuncioModal.url_anuncio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {anuncioModal.plataforma === 'milanuncios' ? (
                    <Image
                      src="/images/milanuncios.png"
                      alt="Milanuncios"
                      width={40}
                      height={40}
                      className="object-contain cursor-pointer"
                    />
                  ) : anuncioModal.plataforma === 'wallapop' ? (
                    <Image
                      src="/images/wallapop.png"
                      alt="Wallapop"
                      width={40}
                      height={40}
                      className="object-contain cursor-pointer"
                    />
                  ) : (
                    <div className="px-3 py-1 bg-gray-200 rounded-lg text-gray-700 text-xs font-semibold">
                      {anuncioModal.plataforma}
                    </div>
                  )}
                </a>
              </div>

              {/* Descripción */}
              {anuncioModal.descripcion && (
                <p className="text-sm text-gray-600 mb-4">
                  {anuncioModal.descripcion}
                </p>
              )}

              {/* Precio y favorito */}
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'es' ? 'Precio' : 'Price'}
                  </p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatPrice(anuncioModal.precio_eur)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (anuncioModal.url_anuncio) {
                      toggleAnuncioFavorito(anuncioModal.url_anuncio)
                    }
                  }}
                  className={`p-3 rounded-full transition-colors ${
                    anuncioModal.url_anuncio
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-50 cursor-not-allowed'
                  }`}
                  aria-label={anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio)
                    ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                    : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                  title={anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio)
                    ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                    : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                  disabled={!anuncioModal.url_anuncio}
                >
                  <svg
                    className={`w-8 h-8 ${
                      anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio)
                        ? 'fill-red-500 text-red-500'
                        : 'fill-none text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={
                      anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio) ? 0 : 2
                    }
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Información adicional */}
              <div className="space-y-2 text-sm mb-4">
                {anuncioModal.estado_declarado && (
                  <p className="text-gray-600">
                    <span className="font-semibold">{language === 'es' ? 'Estado: ' : 'Condition: '}</span>
                    {anuncioModal.estado_declarado}
                  </p>
                )}
                {anuncioModal.ciudad_o_zona && (
                  <p className="text-gray-600">
                    <span className="font-semibold">{language === 'es' ? 'Ubicación: ' : 'Location: '}</span>
                    {anuncioModal.ciudad_o_zona}
                  </p>
                )}
              </div>

              {/* Botón Ver anuncio completo */}
              {anuncioModal.url_anuncio && (
                <a
                  href={anuncioModal.url_anuncio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {language === 'es' ? 'Ver anuncio completo' : 'View full listing'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel de información de búsqueda avanzada */}
      {panelInfoAbierto && evaluacion && evaluacion.scraping?.tipoBusqueda === 'completa' && (
        <>
          {/* Overlay oscuro */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-500 ${
              panelInfoCerrandose ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={cerrarPanelInfo}
          />
          
          {/* Panel que se desliza desde la izquierda */}
          <div 
            className={`fixed inset-y-0 left-0 right-0 bg-white z-[9999] transform transition-transform duration-500 ease-out ${
              panelInfoCerrandose ? '-translate-x-full' : panelInfoAbriendose ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="h-full flex flex-col overflow-y-auto">
              {/* Header del panel */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
                <h2 className="text-xl font-bold text-white">
                  {language === 'es' ? 'Información de búsqueda' : 'Search information'}
                </h2>
                <button
                  onClick={cerrarPanelInfo}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del panel */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Estadísticas - Diseño circular */}
                <div className="space-y-3">
                  {/* Primera fila: 3 círculos */}
                  <div className="flex justify-between gap-2">
                    {/* Total anuncios analizados */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex flex-col items-center justify-center shadow-md border border-purple-300">
                        <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-base font-bold text-white">
                          {evaluacion.scraping?.totalAnalizados || 0}
                        </p>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                        {language === 'es' ? 'Total analizados' : 'Total analyzed'}
                      </h3>
                    </div>

                    {/* Anuncios no válidos */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center shadow-md border border-red-300">
                        <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-base font-bold text-white">
                          {evaluacion.scraping?.totalDescartados || 0}
                        </p>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                        {language === 'es' ? 'No válidos' : 'Invalid'}
                      </h3>
                    </div>

                    {/* Anuncios descartados por "anuncio gancho" */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col items-center justify-center shadow-md border border-orange-300">
                        <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-base font-bold text-white">
                          {evaluacion.scraping?.totalOutliers || 0}
                        </p>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                        {language === 'es' ? 'Anuncios gancho' : 'Hook listings'}
                      </h3>
                    </div>
                  </div>

                  {/* Segunda fila: 3 círculos */}
                  <div className="flex justify-between gap-2">
                    {/* Anuncios en tu zona */}
                    {(() => {
                      const anunciosEnZona = evaluacion.scraping?.jsonCompradores?.compradores?.filter((a: Comprador) => 
                        a.ciudad_o_zona && evaluacion.ubicacion && 
                        a.ciudad_o_zona.toLowerCase().includes(evaluacion.ubicacion.toLowerCase())
                      ).length || 0
                      return (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center shadow-md border border-green-300">
                            <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-base font-bold text-white">
                              {anunciosEnZona}
                            </p>
                          </div>
                          <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                            {language === 'es' ? 'En tu zona' : 'In your area'}
                          </h3>
    </div>
  )
                    })()}

                    {/* Anuncios perfiles top */}
                    {(() => {
                      const perfilesTop = evaluacion.scraping?.jsonCompradores?.compradores?.filter((a: Comprador) => 
                        a.is_top_profile === true
                      ).length || 0
                      return (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center shadow-md border border-blue-300">
                            <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <p className="text-base font-bold text-white">
                              {perfilesTop}
                            </p>
                          </div>
                          <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                            {language === 'es' ? 'Perfiles top' : 'Top profiles'}
                          </h3>
                        </div>
                      )
                    })()}

                    {/* Total anuncios filtrados */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex flex-col items-center justify-center shadow-md border border-indigo-300">
                        <svg className="w-3 h-3 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-base font-bold text-white">
                          {evaluacion.scraping?.totalFiltrados || 0}
                        </p>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-700 mt-1 text-center">
                        {language === 'es' ? 'Total filtrados' : 'Total filtered'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Filtros activos */}
                {Object.keys(filtrosGraficas).length > 0 && (
                  <div className="mt-4 flex items-center gap-2 relative" ref={filtrosActivosRef}>
                    <button
                      onClick={() => setMostrarFiltrosActivos(!mostrarFiltrosActivos)}
                      className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer underline decoration-dotted underline-offset-2 transition-colors"
                    >
                      {language === 'es' ? `${Object.keys(filtrosGraficas).length} filtro${Object.keys(filtrosGraficas).length > 1 ? 's' : ''} activo${Object.keys(filtrosGraficas).length > 1 ? 's' : ''}` : `${Object.keys(filtrosGraficas).length} filter${Object.keys(filtrosGraficas).length > 1 ? 's' : ''} active`}
                    </button>
                    {mostrarFiltrosActivos && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px] max-w-md">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {language === 'es' ? 'Filtros activos' : 'Active filters'}
                            </h4>
                            <button
                              onClick={() => setMostrarFiltrosActivos(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-3 max-h-64 overflow-y-auto">
                          <div className="space-y-2">
                            {obtenerFiltrosActivos().map((filtro, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-700 flex-1">{filtro.descripcion}</span>
                                <button
                                  onClick={() => {
                                    setFiltrosGraficas(prev => {
                                      const { [filtro.tipo as keyof typeof prev]: _, ...rest } = prev
                                      return rest
                                    })
                                  }}
                                  className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                  title={language === 'es' ? 'Eliminar filtro' : 'Remove filter'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              limpiarFiltrosGraficas()
                              setMostrarFiltrosActivos(false)
                            }}
                            className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {language === 'es' ? 'Limpiar todos' : 'Clear all'}
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={limpiarFiltrosGraficas}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                    </button>
                  </div>
                )}

                {/* Gráfica de plataformas */}
                {(() => {
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (evaluacion.scraping?.jsonCompradores?.compradores || [])
                  const plataformasMap = new Map<string, number>()
                  anuncios.forEach((comprador: Comprador) => {
                    const plataforma = comprador.plataforma || 'unknown'
                    plataformasMap.set(plataforma, (plataformasMap.get(plataforma) || 0) + 1)
                  })
                  const total = anuncios.length
                  const distribucionPlataformas = Array.from(plataformasMap.entries())
                    .map(([plataforma, count]) => ({
                      plataforma,
                      count,
                      percentage: total > 0 ? (count / total) * 100 : 0
                    }))
                    .sort((a, b) => b.count - a.count)

                  if (distribucionPlataformas.length === 0) return null

                  const getPlatformIcon = (plataforma: string) => {
                    const plataformaLower = plataforma.toLowerCase()
                    if (plataformaLower.includes('wallapop')) {
                      return '/images/wallapop.png'
                    } else if (plataformaLower.includes('milanuncios')) {
                      return '/images/milanuncios.png'
                    }
                    return null
                  }

                  return (
                    <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
                      <button
                        onClick={() => setGraficaPlataformasColapsada(!graficaPlataformasColapsada)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                          {language === 'es' ? 'Distribución por Plataforma' : 'Platform Distribution'}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            graficaPlataformasColapsada ? '' : 'rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!graficaPlataformasColapsada && (
                      <div className="space-y-3">
                        {distribucionPlataformas.map((item) => {
                          const iconPath = getPlatformIcon(item.plataforma)
                          const estaFiltrado = filtrosGraficas.plataforma === item.plataforma
                          return (
                            <div key={item.plataforma} className="flex items-center gap-3">
                              {iconPath ? (
                                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10">
                                  <Image
                                    src={iconPath}
                                    alt={item.plataforma}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-gray-600">
                                    {item.plataforma.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs md:text-sm font-medium text-gray-700 truncate capitalize">
                                    {item.plataforma}
                                  </span>
                                  <span className="text-xs md:text-sm font-semibold text-gray-900 ml-2">
                                    {item.count} ({item.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div 
                                  className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                  onClick={() => handleClickBarra('plataforma', item.plataforma)}
                                >
                                  <div
                                    className={`bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500 ${estaFiltrado ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                    style={{ width: `${item.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      )}
                    </div>
                  )
                })()}

                {/* Gráfica de distribución de precios */}
                {(() => {
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (evaluacion.scraping?.jsonCompradores?.compradores || [])
                  const precios = anuncios
                    .map((c: Comprador) => c.precio_eur || 0)
                    .filter(p => p > 0)
                  
                  if (precios.length === 0) return null
                  
                  const precioMin = Math.min(...precios)
                  const precioMax = Math.max(...precios)
                  const rango = precioMax - precioMin
                  
                  // Crear 5 rangos de precios
                  const numRangos = 5
                  const tamañoRango = rango / numRangos
                  
                  const rangos = Array.from({ length: numRangos }, (_, i) => {
                    const min = precioMin + (i * tamañoRango)
                    const max = i === numRangos - 1 ? precioMax : precioMin + ((i + 1) * tamañoRango)
                    return {
                      min: Math.floor(min),
                      max: Math.ceil(max),
                      count: 0
                    }
                  })
                  
                  // Contar anuncios en cada rango
                  precios.forEach(precio => {
                    for (let i = 0; i < rangos.length; i++) {
                      if (i === rangos.length - 1) {
                        // Último rango incluye el máximo
                        if (precio >= rangos[i].min && precio <= rangos[i].max) {
                          rangos[i].count++
                          break
                        }
                      } else {
                        if (precio >= rangos[i].min && precio < rangos[i].max) {
                          rangos[i].count++
                          break
                        }
                      }
                    }
                  })
                  
                  const formatPrice = (price: number) => {
                    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(price)
                  }
                  
                  const total = precios.length
                  const distribucionPrecios = rangos.map(rango => ({
                    ...rango,
                    percentage: total > 0 ? (rango.count / total) * 100 : 0,
                    label: `${formatPrice(rango.min)} - ${formatPrice(rango.max)}`
                  }))

                  if (distribucionPrecios.length === 0) return null

                  return (
                    <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
                      <button
                        onClick={() => setGraficaPreciosColapsada(!graficaPreciosColapsada)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                          {language === 'es' ? 'Distribución de Precios' : 'Price Distribution'}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            graficaPreciosColapsada ? '' : 'rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!graficaPreciosColapsada && (
                      <div className="space-y-3">
                        {distribucionPrecios.map((rango, index) => {
                          const maxCount = Math.max(...distribucionPrecios.map(r => r.count))
                          const altura = maxCount > 0 ? (rango.count / maxCount) * 100 : 0
                          const estaFiltrado = filtrosGraficas.rangoPrecio?.min === rango.min && filtrosGraficas.rangoPrecio?.max === rango.max
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="mb-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    {rango.label}
                                  </span>
                                </div>
                                <div 
                                  className="w-full bg-gray-200 rounded-full h-5 relative overflow-visible flex items-center cursor-pointer hover:bg-gray-300 transition-colors"
                                  onClick={() => handleClickBarra('rangoPrecio', { min: rango.min, max: rango.max })}
                                >
                                  <div
                                    className={`bg-gradient-to-r from-blue-500 to-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2 relative flex-shrink-0 ${estaFiltrado ? 'ring-2 ring-blue-700 ring-offset-2' : ''}`}
                                    style={{ width: `${altura}%` }}
                                  >
                                    {rango.count > 0 && altura > 30 && (
                                      <span className="text-xs font-semibold text-white">
                                        {rango.percentage.toFixed(1)}%
                                      </span>
                                    )}
                                  </div>
                                  {rango.count > 0 && altura <= 30 && (
                                    <span className="text-xs font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                      {rango.percentage.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      )}
                    </div>
                  )
                })()}

                {/* Gráfica precio vs antigüedad */}
                {(() => {
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (evaluacion.scraping?.jsonCompradores?.compradores || [])
                  const ahora = new Date()
                  const categorias = {
                    menosDe1Semana: { precios: [] as number[], label: language === 'es' ? '< 1 semana' : '< 1 week' },
                    entre1Y4Semanas: { precios: [] as number[], label: language === 'es' ? '1-4 semanas' : '1-4 weeks' },
                    entre1Y3Meses: { precios: [] as number[], label: language === 'es' ? '1-3 meses' : '1-3 months' },
                    masDe3Meses: { precios: [] as number[], label: language === 'es' ? '> 3 meses' : '> 3 months' },
                    sinFecha: { precios: [] as number[], label: language === 'es' ? 'Sin fecha' : 'No date' }
                  }

                  anuncios.forEach((comprador: Comprador) => {
                    const precio = comprador.precio_eur || 0
                    if (precio <= 0) return

                    const fechaPub = (comprador as any).fecha_publicacion
                    if (!fechaPub || fechaPub === 'ND' || fechaPub === '') {
                      categorias.sinFecha.precios.push(precio)
                      return
                    }

                    try {
                      const fecha = new Date(fechaPub)
                      if (isNaN(fecha.getTime())) {
                        categorias.sinFecha.precios.push(precio)
                        return
                      }

                      const diffMs = ahora.getTime() - fecha.getTime()
                      const diffDias = diffMs / (1000 * 60 * 60 * 24)

                      if (diffDias < 7) {
                        categorias.menosDe1Semana.precios.push(precio)
                      } else if (diffDias < 28) {
                        categorias.entre1Y4Semanas.precios.push(precio)
                      } else if (diffDias < 90) {
                        categorias.entre1Y3Meses.precios.push(precio)
                      } else {
                        categorias.masDe3Meses.precios.push(precio)
                      }
                    } catch {
                      categorias.sinFecha.precios.push(precio)
                    }
                  })

                  const relacionPrecioAntiguedad = Object.entries(categorias).map(([key, data]) => {
                    const precios = data.precios
                    const promedio = precios.length > 0 
                      ? precios.reduce((sum, p) => sum + p, 0) / precios.length 
                      : 0

                    return {
                      categoria: key,
                      label: data.label,
                      count: precios.length,
                      promedio: Math.round(promedio)
                    }
                  }).filter(item => item.count > 0)

                  if (relacionPrecioAntiguedad.length === 0) return null

                  const formatPrice = (price: number) => {
                    return new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(price)
                  }

                  return (
                    <div className="mt-6 bg-white rounded-xl shadow-lg p-4 md:p-6">
                      <button
                        onClick={() => setGraficaPrecioAntiguedadColapsada(!graficaPrecioAntiguedadColapsada)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                          {language === 'es' ? 'Precio Promedio por Antigüedad' : 'Average Price by Age'}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            graficaPrecioAntiguedadColapsada ? '' : 'rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!graficaPrecioAntiguedadColapsada && (
                      <div className="space-y-3">
                        {relacionPrecioAntiguedad.map((item, index) => {
                          const maxPrecio = Math.max(...relacionPrecioAntiguedad.map(i => i.promedio))
                          const alturaPromedio = maxPrecio > 0 ? (item.promedio / maxPrecio) * 100 : 0
                          const estaFiltrado = filtrosGraficas.precioAntiguedad === item.categoria
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {item.label}
                                </span>
                                <span className="text-xs font-semibold text-gray-900">
                                  {formatPrice(item.promedio)} ({item.count})
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-4 relative overflow-visible flex items-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => handleClickBarra('precioAntiguedad', item.categoria)}
                              >
                                <div
                                  className={`bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 flex-shrink-0 ${estaFiltrado ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                  style={{ width: `${alturaPromedio}%` }}
                                >
                                  {item.count > 0 && alturaPromedio > 25 && (
                                    <span className="text-[10px] font-semibold text-white">
                                      {formatPrice(item.promedio)}
                                    </span>
                                  )}
                                </div>
                                {item.count > 0 && alturaPromedio <= 25 && (
                                  <span className="text-[10px] font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                    {formatPrice(item.promedio)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      )}
                    </div>
                  )
                })()}

                {/* Gráfica de distribución de precios de productos nuevos - SIEMPRE VISIBLE */}
                <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6 border-4 border-yellow-500">
                  {(() => {
                    // Debug: Log para verificar datos
                    console.log('[Panel Info] Productos nuevos:', evaluacion.scraping?.productosNuevos)
                    
                    // Verificar si hay productos nuevos
                    const hayProductosNuevos = evaluacion.scraping?.productosNuevos && evaluacion.scraping.productosNuevos.length > 0
                    console.log('[Panel Info] Hay productos nuevos:', hayProductosNuevos)
                    
                    // Usar datos_producto_nuevo_filtrado del primer elemento si existe
                    const primerProducto = hayProductosNuevos ? evaluacion.scraping.productosNuevos[0] : null
                    const productosFiltrados = primerProducto?.datos_producto_nuevo_filtrado || []
                    console.log('[Panel Info] Productos filtrados:', productosFiltrados.length)
                    
                    const precios = productosFiltrados
                      .map(p => p.price || 0)
                      .filter(p => p > 0)
                  
                    // Si no hay precios, mostrar mensaje
                    if (precios.length === 0) {
                      return (
                        <>
                          <button
                            onClick={() => setGraficaPreciosNuevosColapsada(!graficaPreciosNuevosColapsada)}
                            className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                          >
                            <h3 className="text-sm md:text-base font-semibold text-gray-900">
                              {language === 'es' ? 'Distribución de Precios (Productos Nuevos)' : 'Price Distribution (New Products)'}
                            </h3>
                            <svg
                              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                graficaPreciosNuevosColapsada ? '' : 'rotate-180'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {!graficaPreciosNuevosColapsada && (
                            <div>
                              <p className="text-sm text-gray-500 text-center py-4">
                                {language === 'es' ? 'No hay datos de precios disponibles para productos nuevos' : 'No price data available for new products'}
                              </p>
                              <p className="text-xs text-gray-400 text-center">
                                Debug: hayProductosNuevos={String(hayProductosNuevos)}, productosFiltrados={productosFiltrados.length}
                              </p>
                            </div>
                          )}
                        </>
                      )
                    }
                    
                    const precioMin = Math.min(...precios)
                    const precioMax = Math.max(...precios)
                    const rango = precioMax - precioMin
                    
                    // Crear 5 rangos de precios
                    const numRangos = 5
                    const tamañoRango = rango / numRangos
                    
                    const rangos = Array.from({ length: numRangos }, (_, i) => {
                      const min = precioMin + (i * tamañoRango)
                      const max = i === numRangos - 1 ? precioMax : precioMin + ((i + 1) * tamañoRango)
                      return {
                        min: Math.floor(min),
                        max: Math.ceil(max),
                        count: 0
                      }
                    })
                    
                    // Contar productos en cada rango
                    precios.forEach(precio => {
                      for (let i = 0; i < rangos.length; i++) {
                        if (i === rangos.length - 1) {
                          if (precio >= rangos[i].min && precio <= rangos[i].max) {
                            rangos[i].count++
                            break
                          }
                        } else {
                          if (precio >= rangos[i].min && precio < rangos[i].max) {
                            rangos[i].count++
                            break
                          }
                        }
                      }
                    })
                    
                    const formatPrice = (price: number) => {
                      const currency = productosFiltrados[0]?.currency || 'EUR'
                      return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
                        style: 'currency',
                        currency: currency,
                      }).format(price)
                    }
                    
                    const total = precios.length
                    const distribucionPrecios = rangos.map(rango => ({
                      ...rango,
                      percentage: total > 0 ? (rango.count / total) * 100 : 0,
                      label: `${formatPrice(rango.min)} - ${formatPrice(rango.max)}`
                    })).filter(r => r.count > 0)

                    return (
                      <>
                        <button
                          onClick={() => setGraficaPreciosNuevosColapsada(!graficaPreciosNuevosColapsada)}
                          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                        >
                          <h3 className="text-sm md:text-base font-semibold text-gray-900">
                            {language === 'es' ? 'Distribución de Precios (Productos Nuevos)' : 'Price Distribution (New Products)'}
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                              graficaPreciosNuevosColapsada ? '' : 'rotate-180'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {!graficaPreciosNuevosColapsada && (
                        <div className="space-y-3">
                          {distribucionPrecios.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {language === 'es' ? 'No hay datos de precios disponibles' : 'No price data available'}
                            </p>
                          ) : (
                            distribucionPrecios.map((rango, index) => {
                            const maxCount = Math.max(...distribucionPrecios.map(r => r.count))
                            const altura = maxCount > 0 ? (rango.count / maxCount) * 100 : 0
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="mb-1">
                                    <span className="text-xs font-medium text-gray-700">
                                      {rango.label}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-5 relative overflow-visible flex items-center">
                                    <div
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2 relative flex-shrink-0"
                                      style={{ width: `${altura}%` }}
                                    >
                                      {rango.count > 0 && altura > 30 && (
                                        <span className="text-xs font-semibold text-white">
                                          {rango.percentage.toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                    {rango.count > 0 && altura <= 30 && (
                                      <span className="text-xs font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                        {rango.percentage.toFixed(1)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                            })
                          )}
                        </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Lista de productos nuevos - Top 10 - SIEMPRE VISIBLE */}
                <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6 border-4 border-yellow-500">
                  {(() => {
                    // Verificar si hay productos nuevos
                    const hayProductosNuevos = evaluacion.scraping?.productosNuevos && evaluacion.scraping.productosNuevos.length > 0
                    
                    // Obtener los productos filtrados del primer elemento (donde está almacenado) si existe
                    const primerProducto = hayProductosNuevos ? evaluacion.scraping.productosNuevos[0] : null
                    const productosFiltrados = primerProducto?.datos_producto_nuevo_filtrado || []
                    
                    // Debug: Log para verificar
                    console.log('[Panel Info] Top 10 - Hay productos:', hayProductosNuevos, 'Filtrados:', productosFiltrados.length)
                    
                    // Si hay productos filtrados, mostrar Top 10 ordenados por precio ascendente
                    const top10Productos = productosFiltrados
                      .sort((a, b) => a.price - b.price)
                      .slice(0, 10)
                    
                    // SIEMPRE mostrar la sección
                    return (
                      <>
                        <button
                          onClick={() => setListaProductosNuevosColapsada(!listaProductosNuevosColapsada)}
                          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                        >
                          <h3 className="text-sm md:text-base font-semibold text-gray-900">
                            {language === 'es' ? 'Top 10 Productos Nuevos' : 'Top 10 New Products'}
                          </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            listaProductosNuevosColapsada ? '' : 'rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        </button>
                        {!listaProductosNuevosColapsada && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {top10Productos.length === 0 ? (
                            <div>
                              <p className="text-sm text-gray-500 text-center py-4">
                                {language === 'es' ? 'No hay productos nuevos disponibles' : 'No new products available'}
                              </p>
                              <p className="text-xs text-gray-400 text-center">
                                Debug: hayProductosNuevos={String(hayProductosNuevos)}, productosFiltrados={productosFiltrados.length}
                              </p>
                            </div>
                          ) : (
                            top10Productos.map((producto, index) => {
                          const primeraImagen = producto.images && producto.images.length > 0 ? producto.images[0].url : null
                          const formatPrice = (price: number) => {
                            return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
                              style: 'currency',
                              currency: producto.currency || 'EUR',
                            }).format(price)
                          }
                          
                          // Obtener la URL correcta (puede ser offerUrl.landingUrl o offerUrl directamente)
                          const getOfferUrl = () => {
                            if (typeof producto.offerUrl === 'string') {
                              return producto.offerUrl
                            }
                            if (typeof producto.offerUrl === 'object' && producto.offerUrl !== null) {
                              return (producto.offerUrl as any).landingUrl || (producto.offerUrl as any).url || ''
                            }
                            return ''
                          }
                          
                          const offerUrl = getOfferUrl()
                          
                          return (
                            <a
                              key={`top10-${index}`}
                              href={offerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                            >
                              <div className="flex gap-3">
                                {primeraImagen && (
                                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={primeraImagen}
                                      alt={producto.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {producto.title}
                                  </h4>
                                  {producto.description && (
                                    <p className="text-[10px] text-gray-600 mb-2 line-clamp-2">
                                      {producto.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-green-600">
                                      {formatPrice(producto.price)}
                                    </span>
                                    <span className="text-[10px] text-blue-600 hover:text-blue-800">
                                      {language === 'es' ? 'Ver oferta →' : 'View offer →'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </a>
                          )
                          })
                          )}
                        </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Gráfica de distribución por país */}
                {(() => {
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (evaluacion.scraping?.jsonCompradores?.compradores || [])
                  
                  // Mapeo de códigos de país a nombres
                  const countryNames: Record<string, string> = {
                    'ES': 'España',
                    'IT': 'Italia',
                    'FR': 'Francia',
                    'PT': 'Portugal',
                    'DE': 'Alemania',
                    'GB': 'Reino Unido',
                    'US': 'Estados Unidos',
                    'MX': 'México',
                    'AR': 'Argentina',
                    'CO': 'Colombia',
                    'CL': 'Chile',
                    'PE': 'Perú',
                  }
                  
                  const paisesMap = new Map<string, number>()
                  anuncios.forEach((comprador: Comprador) => {
                    const countryCode = (comprador as any).country_code || 'N/A'
                    paisesMap.set(countryCode, (paisesMap.get(countryCode) || 0) + 1)
                  })
                  
                  const total = anuncios.length
                  const distribucionPaises = Array.from(paisesMap.entries())
                    .map(([countryCode, count]) => ({
                      countryCode,
                      countryName: countryNames[countryCode] || countryCode,
                      count,
                      percentage: total > 0 ? (count / total) * 100 : 0
                    }))
                    .sort((a, b) => b.count - a.count)

                  if (distribucionPaises.length === 0 || (distribucionPaises.length === 1 && distribucionPaises[0].countryCode === 'N/A')) {
                    return null
                  }

                  // Función para obtener el emoji de la bandera (opcional)
                  const getCountryFlag = (countryCode: string) => {
                    const flagEmojis: Record<string, string> = {
                      'ES': '🇪🇸',
                      'IT': '🇮🇹',
                      'FR': '🇫🇷',
                      'PT': '🇵🇹',
                      'DE': '🇩🇪',
                      'GB': '🇬🇧',
                      'US': '🇺🇸',
                      'MX': '🇲🇽',
                      'AR': '🇦🇷',
                      'CO': '🇨🇴',
                      'CL': '🇨🇱',
                      'PE': '🇵🇪',
                    }
                    return flagEmojis[countryCode] || '🌍'
                  }

                  return (
                    <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
                      <button
                        onClick={() => setGraficaPaisesColapsada(!graficaPaisesColapsada)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                          {language === 'es' ? 'Distribución por País' : 'Distribution by Country'}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            graficaPaisesColapsada ? '' : 'rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!graficaPaisesColapsada && (
                        <div className="space-y-3">
                          {distribucionPaises.map((item) => {
                            const estaFiltrado = filtrosGraficas.pais === item.countryCode
                            return (
                              <div key={item.countryCode} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                                  <span className="text-lg md:text-xl">
                                    {getCountryFlag(item.countryCode)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs md:text-sm font-medium text-gray-700 truncate">
                                      {item.countryName}
                                    </span>
                                    <span className="text-xs md:text-sm font-semibold text-gray-900 ml-2">
                                      {item.count} ({item.percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div 
                                    className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors relative"
                                    onClick={() => handleClickBarra('pais', item.countryCode)}
                                  >
                                    <div
                                      className={`bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ${estaFiltrado ? 'ring-2 ring-blue-700 ring-offset-1' : ''}`}
                                      style={{ width: `${item.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

