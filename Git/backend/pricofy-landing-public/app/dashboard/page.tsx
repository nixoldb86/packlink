'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation } from '@/lib/translations'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LanguageSelector from '@/components/LanguageSelector'
import { useForm } from '@/contexts/FormContext'
import './dashboard.css'

interface Evaluacion {
  id: number
  producto: string
  categoria: string
  condicion: string
  accion?: string
  ubicacion: string
  ciudad?: string
  pais?: string
  fecha: string
  scraping: {
    id: number
    totalAnalizados: number
    totalDescartados: number
    totalOutliers: number
    totalFiltrados: number
    plataformasConsultadas?: string[]
    fecha: string
    tipoBusqueda?: 'directa' | 'completa'
    totalResultadosScrapping?: any
    jsonCompradores?: {
      compradores?: Array<{
        precio_eur: number
        ciudad_o_zona: string | null
        [key: string]: any
      }>
    } | null
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
  } | null
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openForm } = useForm()
  const t = (key: string) => getTranslation(language, key)
  
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroActivo, setFiltroActivo] = useState<'dashboard' | 'comprar' | 'vender' | 'favoritos' | 'perfil'>('dashboard')
  
  // Detectar el filtro desde la URL y el texto de búsqueda
  useEffect(() => {
    const filtro = searchParams.get('filtro')
    if (filtro && ['comprar', 'vender', 'favoritos', 'perfil'].includes(filtro)) {
      setFiltroActivo(filtro as 'comprar' | 'vender' | 'favoritos' | 'perfil')
    } else {
      setFiltroActivo('dashboard')
    }
    
    // Si hay un texto de búsqueda en la URL, mostrarlo en la barra de búsqueda correspondiente
    const busquedaParam = searchParams.get('busqueda')
    if (busquedaParam) {
      if (filtro === 'comprar') {
        setBusquedaTexto(busquedaParam)
        // Limpiar resultados anteriores cuando hay un nuevo parámetro de búsqueda
        setAnunciosBusquedaDirecta([])
        setEvaluacionBusquedaDirecta(null)
      } else if (filtro === 'vender') {
        setBusquedaTextoVender(busquedaParam)
      }
    } else {
      if (filtro === 'comprar') {
        // Si estamos en Compras pero no hay parámetro de búsqueda, limpiar resultados
        setAnunciosBusquedaDirecta([])
        setEvaluacionBusquedaDirecta(null)
      }
    }
  }, [searchParams])
  
  // Estado para búsqueda (solo en Comprar, funciona como formulario)
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [buscandoDirecto, setBuscandoDirecto] = useState(false)
  const [buscandoCompleto, setBuscandoCompleto] = useState(false)
  const [mensajeBusqueda, setMensajeBusqueda] = useState<string | null>(null)
  
  // Estado para búsquedas inteligentes (colapsable)
  const [busquedasAvanzadasColapsadas, setBusquedasAvanzadasColapsadas] = useState(true)
  
  // Estado para panel de búsqueda inteligente
  const [panelBusquedaAvanzadaAbierto, setPanelBusquedaAvanzadaAbierto] = useState(false)
  const [panelCerrandose, setPanelCerrandose] = useState(false)
  const [busquedaTextoPanel, setBusquedaTextoPanel] = useState('')
  const [resultadoBusquedaAvanzada, setResultadoBusquedaAvanzada] = useState<Evaluacion | null>(null)
  const [historicoColapsado, setHistoricoColapsado] = useState(true) // Por defecto colapsado
  
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
  
  // Estados para filtros de gráficas en el panel de +info
  const [filtrosGraficas, setFiltrosGraficas] = useState<{
    rangoPrecio?: { min: number; max: number }
    ubicacion?: string
    antiguedad?: 'menosDe1Semana' | 'entre1Y4Semanas' | 'entre1Y3Meses' | 'masDe3Meses' | 'sinFecha'
    precioAntiguedad?: 'menosDe1Semana' | 'entre1Y4Semanas' | 'entre1Y3Meses' | 'masDe3Meses' | 'sinFecha'
    plataforma?: string
    envio?: 'conEnvio' | 'sinEnvio' | 'sinDatos'
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
  
  // Función para formatear precio (para el panel de +info)
  const formatPriceInfo = (price: number) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }
  
  // Filtrar compradores según los filtros activos (solo cuando hay resultadoBusquedaAvanzada)
  const compradoresParaAnalisis = useMemo(() => {
    if (!resultadoBusquedaAvanzada?.scraping?.jsonCompradores?.compradores) {
      return []
    }
    
    let filtrados = [...(resultadoBusquedaAvanzada.scraping.jsonCompradores.compradores as any[])]
    
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
    
    // Filtrar por precio vs antigüedad
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
    
    return filtrados
  }, [resultadoBusquedaAvanzada, filtrosGraficas])
  
  // Función para manejar clic en una barra de gráfica
  const handleClickBarra = (tipo: 'rangoPrecio' | 'ubicacion' | 'antiguedad' | 'precioAntiguedad' | 'plataforma' | 'envio', valor: any) => {
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
        return `${language === 'es' ? 'Precio' : 'Price'}: ${formatPriceInfo(valor.min)} - ${formatPriceInfo(valor.max)}`
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
    
    return filtros
  }
  
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
  
  // Autorellenar el panel cuando se abre desde Compras con texto
  useEffect(() => {
    if (panelBusquedaAvanzadaAbierto && filtroActivo === 'comprar' && busquedaTexto.trim()) {
      setBusquedaTextoPanel(busquedaTexto)
    }
  }, [panelBusquedaAvanzadaAbierto, filtroActivo, busquedaTexto])
  
  // Función para cerrar el panel con animación
  const cerrarPanel = () => {
    setPanelCerrandose(true)
    setTimeout(() => {
      setPanelBusquedaAvanzadaAbierto(false)
      setPanelCerrandose(false)
      setResultadoBusquedaAvanzada(null)
      setBusquedaTextoPanel('')
      setSugerenciasBusquedaPanel([])
      setMostrarSugerenciasBusquedaPanel(false)
      router.push('/dashboard?filtro=comprar')
    }, 500) // Esperar a que termine la animación (0.5s)
  }
  
  // Estados para swipe en búsquedas inteligentes
  const [swipeStartXAvanzadas, setSwipeStartXAvanzadas] = useState<number | null>(null)
  const [swipeStartOffsetAvanzadas, setSwipeStartOffsetAvanzadas] = useState(0)
  const [swipeOffsetAvanzadas, setSwipeOffsetAvanzadas] = useState(0)
  const [fichaDeslizadaAvanzadas, setFichaDeslizadaAvanzadas] = useState<number | null>(null)
  
  // Estados para menú de más opciones en búsquedas inteligentes
  const [menuAbiertoAvanzadas, setMenuAbiertoAvanzadas] = useState<number | null>(null)
  const [menuPosicionAvanzadas, setMenuPosicionAvanzadas] = useState<{ top: number; right: number } | null>(null)
  const botonMasRefsAvanzadas = useRef<Map<number, HTMLButtonElement>>(new Map())
  
  // Ref para cancelar polling en curso
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Estado para anuncios de búsqueda directa actual
  const [anunciosBusquedaDirecta, setAnunciosBusquedaDirecta] = useState<any[]>([])
  const [evaluacionBusquedaDirecta, setEvaluacionBusquedaDirecta] = useState<Evaluacion | null>(null)
  const [busquedaTextoAnuncios, setBusquedaTextoAnuncios] = useState('')
  const [mostrarFiltrosAnuncios, setMostrarFiltrosAnuncios] = useState(false)
  const [anuncioModal, setAnuncioModal] = useState<any | null>(null)
  const [vistaAnuncios, setVistaAnuncios] = useState<'lista' | 'fichas'>('fichas')
  // Estado para ordenamiento por precio en búsquedas normales
  const [ordenPrecioAnuncios, setOrdenPrecioAnuncios] = useState<'asc' | 'desc' | null>(null)
  // Estado para el modal de contratar plan
  const [modalContratarPlanAbierto, setModalContratarPlanAbierto] = useState(false)
  // Estados para sugerencias de búsqueda
  const [sugerenciasBusqueda, setSugerenciasBusqueda] = useState<string[]>([])
  const [mostrarSugerenciasBusqueda, setMostrarSugerenciasBusqueda] = useState(false)
  const [sugerenciasBusquedaPanel, setSugerenciasBusquedaPanel] = useState<string[]>([])
  const [mostrarSugerenciasBusquedaPanel, setMostrarSugerenciasBusquedaPanel] = useState(false)
  const [sugerenciasBusquedaVender, setSugerenciasBusquedaVender] = useState<string[]>([])
  const [mostrarSugerenciasBusquedaVender, setMostrarSugerenciasBusquedaVender] = useState(false)
  
  const obtenerSugerencias = useCallback(async (query: string): Promise<string[]> => {
    // Solo obtener sugerencias cuando el idioma sea inglés
    if (language !== 'en') {
      return []
    }

    const termino = query.trim()
    if (termino.length < 4) {
      return []
    }

    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(termino)}`, {
        method: 'GET',
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error('Error en respuesta de sugerencias:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log('Datos recibidos de sugerencias:', data)
      
      if (Array.isArray(data?.suggestions)) {
        const sugerencias = data.suggestions.slice(0, 4)
        console.log('Sugerencias extraídas:', sugerencias)
        return sugerencias
      }

      console.warn('Formato de respuesta inesperado:', data)
      return []
    } catch (suggestError) {
      console.error('Error al obtener sugerencias:', suggestError)
      return []
    }
  }, [language])

  // Estados para filtros de anuncios
  const [filtrosAnuncios, setFiltrosAnuncios] = useState({
    precioMinimo: 0, // 0 = sin filtro mínimo
    precioMaximo: 0, // 0 = sin filtro máximo
    tipoEnvio: 'envio' as 'envio' | 'mano', // Con envío o Trato en mano
    estadoMinimo: 0, // Estado mínimo (0 = sin filtro, 1-5 = estrellas)
    soloTopProfile: false, // Solo mostrar perfiles top (is_top_profile: true)
    pais: '' // País (código de país, vacío = sin filtro)
  })
  
  // Ref para el slider de precios
  const sliderContainerRefAnuncios = useRef<HTMLDivElement>(null)
  const [arrastrandoAnuncios, setArrastrandoAnuncios] = useState<'min' | 'max' | null>(null)
  
  // Función para formatear precios
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }
  
  // Función para obtener el valor numérico del estado
  const obtenerValorEstado = (estado: string | undefined): number => {
    if (!estado) return 0
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes('necesita reparación') || estadoLower.includes('aceptable') || estadoLower.includes('needs repair')) return 1
    if (estadoLower.includes('usado') || estadoLower.includes('used')) return 2
    if (estadoLower.includes('buen estado') || estadoLower.includes('good condition')) return 3
    if (estadoLower.includes('como nuevo') || estadoLower.includes('like new')) return 4
    if (estadoLower.includes('nuevo') || estadoLower.includes('new')) return 5
    return 0
  }
  
  // Manejar el arrastre de las bolitas del slider
  useEffect(() => {
    if (!arrastrandoAnuncios || !sliderContainerRefAnuncios.current) return

    const precios = anunciosBusquedaDirecta
      .map(a => a.precio_eur)
      .filter((p): p is number => typeof p === 'number' && p > 0)
    const precioMin = precios.length > 0 ? Math.min(...precios) : 0
    const precioMax = precios.length > 0 ? Math.max(...precios) : 1000

    const handlePointerMove = (e: PointerEvent) => {
      const rect = sliderContainerRefAnuncios.current!.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const porcentaje = Math.max(0, Math.min(100, (clickX / width) * 100))
      const valor = precioMin + ((porcentaje / 100) * (precioMax - precioMin))

      if (arrastrandoAnuncios === 'min') {
        const valorLimitado = Math.max(precioMin, Math.min(filtrosAnuncios.precioMaximo > 0 ? filtrosAnuncios.precioMaximo : precioMax, valor))
        if (valorLimitado <= precioMin) {
          setFiltrosAnuncios(prev => ({ ...prev, precioMinimo: 0 }))
        } else {
          setFiltrosAnuncios(prev => ({ ...prev, precioMinimo: valorLimitado }))
        }
      } else {
        const valorLimitado = Math.max(filtrosAnuncios.precioMinimo > 0 ? filtrosAnuncios.precioMinimo : precioMin, Math.min(precioMax, valor))
        if (valorLimitado >= precioMax) {
          setFiltrosAnuncios(prev => ({ ...prev, precioMaximo: 0 }))
        } else {
          setFiltrosAnuncios(prev => ({ ...prev, precioMaximo: valorLimitado }))
        }
      }
    }

    const handlePointerUp = () => {
      setArrastrandoAnuncios(null)
      const minInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="min"]') as HTMLInputElement
      const maxInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="max"]') as HTMLInputElement
      if (minInput) minInput.style.zIndex = '15'
      if (maxInput) maxInput.style.zIndex = '15'
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [arrastrandoAnuncios, anunciosBusquedaDirecta, filtrosAnuncios.precioMinimo, filtrosAnuncios.precioMaximo])
  
  // Estado para búsqueda de ventas
  const [busquedaTextoVender, setBusquedaTextoVender] = useState('')
  const [buscandoVender, setBuscandoVender] = useState(false)
  const [mensajeBusquedaVender, setMensajeBusquedaVender] = useState<string | null>(null)
  
  // Estado para el tipo de vista (lista o fichas)
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'fichas'>('lista')
  const [vistaActivaVender, setVistaActivaVender] = useState<'lista' | 'fichas'>('lista')
  
  // Sugerencias para búsqueda normal (Compras) - Solo en inglés
  useEffect(() => {
    // Si el idioma no es inglés, limpiar sugerencias
    if (language !== 'en') {
      setSugerenciasBusqueda([])
      setMostrarSugerenciasBusqueda(false)
      return
    }

    if (busquedaTexto.trim().length < 4) {
      setSugerenciasBusqueda([])
      setMostrarSugerenciasBusqueda(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      console.log('[Frontend] Obteniendo sugerencias para:', busquedaTexto)
      const sugerencias = await obtenerSugerencias(busquedaTexto)
      console.log('[Frontend] Sugerencias recibidas:', sugerencias)
      console.log('[Frontend] Cantidad de sugerencias:', sugerencias.length)
      setSugerenciasBusqueda(sugerencias)
      const mostrar = sugerencias.length > 0
      console.log('[Frontend] Mostrar sugerencias:', mostrar)
      setMostrarSugerenciasBusqueda(mostrar)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busquedaTexto, obtenerSugerencias, language])

  // Sugerencias para búsqueda avanzada (panel) - Solo en inglés
  useEffect(() => {
    // Si el idioma no es inglés, limpiar sugerencias
    if (language !== 'en') {
      setSugerenciasBusquedaPanel([])
      setMostrarSugerenciasBusquedaPanel(false)
      return
    }

    if (busquedaTextoPanel.trim().length < 4) {
      setSugerenciasBusquedaPanel([])
      setMostrarSugerenciasBusquedaPanel(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      const sugerencias = await obtenerSugerencias(busquedaTextoPanel)
      setSugerenciasBusquedaPanel(sugerencias)
      setMostrarSugerenciasBusquedaPanel(sugerencias.length > 0)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busquedaTextoPanel, obtenerSugerencias, language])

  // Sugerencias para búsqueda en Ventas - Solo en inglés
  useEffect(() => {
    // Si el idioma no es inglés, limpiar sugerencias
    if (language !== 'en') {
      setSugerenciasBusquedaVender([])
      setMostrarSugerenciasBusquedaVender(false)
      return
    }

    if (busquedaTextoVender.trim().length < 4) {
      setSugerenciasBusquedaVender([])
      setMostrarSugerenciasBusquedaVender(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      const sugerencias = await obtenerSugerencias(busquedaTextoVender)
      setSugerenciasBusquedaVender(sugerencias)
      setMostrarSugerenciasBusquedaVender(sugerencias.length > 0)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busquedaTextoVender, obtenerSugerencias, language])

  // Estado para controlar qué ficha está expandida en móvil
  const [fichaExpandida, setFichaExpandida] = useState<number | null>(null)
  
  // Estado para controlar qué tooltip está visible (para precio mínimo/rapido en móvil)
  const [tooltipVisible, setTooltipVisible] = useState<'minimo' | 'rapido' | null>(null)
  
  // Cerrar tooltip cuando cambia la ficha expandida
  useEffect(() => {
    setTooltipVisible(null)
  }, [fichaExpandida])
  
  // Estado para favoritos (almacenado en localStorage)
  const [favoritos, setFavoritos] = useState<Set<number>>(new Set())
  
  // Estado para anuncios favoritos (almacenado en localStorage)
  const [anunciosFavoritos, setAnunciosFavoritos] = useState<Set<string>>(new Set())
  
  // Estado para el switch de Favoritos (Búsquedas, Anuncios o Ventas)
  const [tipoFavoritos, setTipoFavoritos] = useState<'busquedas' | 'anuncios' | 'ventas'>('busquedas')
  
  // Estado para evaluaciones archivadas (almacenado en localStorage)
  const [archivadas, setArchivadas] = useState<Set<number>>(new Set())
  
  // Estado para el límite diario de evaluaciones
  const [limiteDiario, setLimiteDiario] = useState<number>(1) // Valor por defecto
  
  // Estado para controlar qué ficha está siendo deslizada (swipe)
  const [fichaDeslizada, setFichaDeslizada] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const [swipeStartOffset, setSwipeStartOffset] = useState<number>(0)
  
  // Estado para controlar qué menú de "más opciones" está abierto
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null)
  const [menuPosicion, setMenuPosicion] = useState<{ top: number; right: number } | null>(null)
  const botonMasRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Cargar favoritos desde el backend y localStorage al montar el componente
  useEffect(() => {
    const cargarFavoritos = async () => {
      if (typeof window !== 'undefined' && user) {
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
            const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
            if (favoritosGuardados) {
              try {
                const ids = JSON.parse(favoritosGuardados) as number[]
                setFavoritos(new Set(ids))
              } catch (error) {
                console.error('Error al cargar favoritos desde localStorage:', error)
              }
            }
            
            const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
            if (anunciosFavoritosGuardados) {
              try {
                const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
                setAnunciosFavoritos(new Set(urls))
              } catch (error) {
                console.error('Error al cargar anuncios favoritos desde localStorage:', error)
              }
            }
          }
        } catch (error) {
          console.error('Error al cargar favoritos desde el backend:', error)
          // Fallback a localStorage
          const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
          if (favoritosGuardados) {
            try {
              const ids = JSON.parse(favoritosGuardados) as number[]
              setFavoritos(new Set(ids))
            } catch (parseError) {
              console.error('Error al parsear favoritos:', parseError)
            }
          }
          
          const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
          if (anunciosFavoritosGuardados) {
            try {
              const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
              setAnunciosFavoritos(new Set(urls))
            } catch (parseError) {
              console.error('Error al parsear anuncios favoritos:', parseError)
            }
          }
        }
      } else if (typeof window !== 'undefined') {
        // Si no hay usuario, cargar solo desde localStorage
      const favoritosGuardados = localStorage.getItem('evaluaciones_favoritas')
      if (favoritosGuardados) {
        try {
          const ids = JSON.parse(favoritosGuardados) as number[]
          setFavoritos(new Set(ids))
        } catch (error) {
          console.error('Error al cargar favoritos:', error)
        }
      }
      
        const anunciosFavoritosGuardados = localStorage.getItem('anuncios_favoritos')
        if (anunciosFavoritosGuardados) {
          try {
            const urls = JSON.parse(anunciosFavoritosGuardados) as string[]
            setAnunciosFavoritos(new Set(urls))
          } catch (error) {
            console.error('Error al cargar anuncios favoritos:', error)
          }
        }
      }
      
      // Cargar archivadas desde localStorage (solo localStorage por ahora)
      if (typeof window !== 'undefined') {
      const archivadasGuardadas = localStorage.getItem('evaluaciones_archivadas')
      if (archivadasGuardadas) {
        try {
          const ids = JSON.parse(archivadasGuardadas) as number[]
          setArchivadas(new Set(ids))
        } catch (error) {
          console.error('Error al cargar archivadas:', error)
        }
      }
    }
    }
    
    cargarFavoritos()
  }, [user])

  // Obtener el límite diario desde la API
  useEffect(() => {
    const fetchLimiteDiario = async () => {
      try {
        const response = await fetch('/api/limite-diario')
        if (response.ok) {
          const data = await response.json()
          setLimiteDiario(data.limiteDiario || 1)
        }
      } catch (error) {
        console.error('Error al obtener límite diario:', error)
        // Mantener el valor por defecto (1) en caso de error
      }
    }
    
    fetchLimiteDiario()
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/')
        return
      }
      fetchEvaluations()
    }
  }, [user, authLoading, router])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/my-evaluations')
      
      if (!response.ok) {
        throw new Error('Error al obtener evaluaciones')
      }
      
      const data = await response.json()
      setEvaluaciones(data.evaluaciones || [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar evaluaciones')
    } finally {
      setLoading(false)
    }
  }

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

  // Calcular precio mínimo recomendado desde jsonCompradores
  const calcularPrecioMinimo = (evaluacion: Evaluacion): number | null => {
    if (!evaluacion.scraping?.jsonCompradores?.compradores) {
      return null
    }
    
    const compradores = evaluacion.scraping.jsonCompradores.compradores
    if (compradores.length === 0) {
      return null
    }
    
    const precios = compradores
      .map(c => c.precio_eur)
      .filter((p): p is number => typeof p === 'number' && p > 0)
    
    if (precios.length === 0) {
      return null
    }
    
    return Math.min(...precios)
  }

  // Obtener precios de vendedores desde jsonVendedores
  const obtenerPreciosVendedores = (evaluacion: Evaluacion): {
    minimo: number | null
    ideal: number | null
    rapido: number | null
  } => {
    if (!evaluacion.scraping?.jsonVendedores?.vendedores) {
      return { minimo: null, ideal: null, rapido: null }
    }
    
    const vendedores = evaluacion.scraping.jsonVendedores.vendedores
    if (vendedores.length === 0) {
      return { minimo: null, ideal: null, rapido: null }
    }
    
    const minimo = vendedores.find(v => v.tipo_precio === 'minimo')?.precio_eur ?? null
    const ideal = vendedores.find(v => v.tipo_precio === 'ideal')?.precio_eur ?? null
    const rapido = vendedores.find(v => v.tipo_precio === 'rapido')?.precio_eur ?? null
    
    return { minimo, ideal, rapido }
  }

  // Función para alternar favorito
  const toggleFavorito = async (evaluacionId: number) => {
    setFavoritos(prev => {
      const nuevosFavoritos = new Set(prev)
      const agregar = !nuevosFavoritos.has(evaluacionId)
      
      if (agregar) {
        nuevosFavoritos.add(evaluacionId)
      } else {
        nuevosFavoritos.delete(evaluacionId)
      }
      
      // Guardar en localStorage inmediatamente (para respuesta rápida)
      if (typeof window !== 'undefined') {
        localStorage.setItem('evaluaciones_favoritas', JSON.stringify(Array.from(nuevosFavoritos)))
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
            id: evaluacionId,
            agregar: agregar
          })
        }).catch(error => {
          console.error('Error al guardar favorito en el backend:', error)
          // Si falla, mantener en localStorage como respaldo
        })
      }
      
      return nuevosFavoritos
    })
  }
  
  // Función para alternar favorito de un anuncio
  const toggleAnuncioFavorito = (urlAnuncio: string) => {
    if (!urlAnuncio) return
    
    setAnunciosFavoritos(prev => {
      const nuevosFavoritos = new Set(prev)
      const agregar = !nuevosFavoritos.has(urlAnuncio)
      
      if (agregar) {
        nuevosFavoritos.add(urlAnuncio)
      } else {
        nuevosFavoritos.delete(urlAnuncio)
      }
      
      // Guardar en localStorage inmediatamente (para respuesta rápida)
      if (typeof window !== 'undefined') {
        localStorage.setItem('anuncios_favoritos', JSON.stringify(Array.from(nuevosFavoritos)))
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
          // Si falla, mantener en localStorage como respaldo
        })
      }
      
      return nuevosFavoritos
    })
  }
  
  // Función para archivar evaluación
  const archivarEvaluacion = (evaluacionId: number) => {
    setArchivadas(prev => {
      const nuevasArchivadas = new Set(prev)
      nuevasArchivadas.add(evaluacionId)
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('evaluaciones_archivadas', JSON.stringify(Array.from(nuevasArchivadas)))
      }
      
      return nuevasArchivadas
    })
    // Cerrar menú y resetear swipe
    setMenuAbierto(null)
    setFichaDeslizada(null)
    setSwipeOffset(0)
  }
  
  // Función para desarchivar evaluación
  const desarchivarEvaluacion = (evaluacionId: number) => {
    setArchivadas(prev => {
      const nuevasArchivadas = new Set(prev)
      nuevasArchivadas.delete(evaluacionId)
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('evaluaciones_archivadas', JSON.stringify(Array.from(nuevasArchivadas)))
      }
      
      return nuevasArchivadas
    })
  }
  
  // Función para eliminar evaluación
  const eliminarEvaluacion = async (evaluacionId: number) => {
    if (!confirm(language === 'es' ? '¿Estás seguro de que quieres eliminar esta evaluación?' : 'Are you sure you want to delete this evaluation?')) {
      return
    }
    
    try {
      // Aquí harías la llamada al API para eliminar
      // Por ahora solo la eliminamos del estado local
      setEvaluaciones(prev => prev.filter(e => e.id !== evaluacionId))
      
      // También eliminarla de favoritos y archivadas si está ahí
      setFavoritos(prev => {
        const nuevos = new Set(prev)
        nuevos.delete(evaluacionId)
        if (typeof window !== 'undefined') {
          localStorage.setItem('evaluaciones_favoritas', JSON.stringify(Array.from(nuevos)))
        }
        return nuevos
      })
      
      setArchivadas(prev => {
        const nuevas = new Set(prev)
        nuevas.delete(evaluacionId)
        if (typeof window !== 'undefined') {
          localStorage.setItem('evaluaciones_archivadas', JSON.stringify(Array.from(nuevas)))
        }
        return nuevas
      })
      
      // Resetear swipe
      setFichaDeslizada(null)
      setSwipeOffset(0)
    } catch (error) {
      console.error('Error al eliminar evaluación:', error)
      alert(language === 'es' ? 'Error al eliminar la evaluación' : 'Error deleting evaluation')
    }
  }
  
  // Handlers para swipe
  const handleTouchStart = (e: React.TouchEvent, evaluacionId: number) => {
    if (window.innerWidth >= 768) return // Solo en móvil
    setSwipeStartX(e.touches[0].clientX)
    setSwipeStartOffset(swipeOffset) // Guardar el offset inicial
    setFichaDeslizada(evaluacionId)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || swipeStartX === null) return
    
    const currentX = e.touches[0].clientX
    const diff = swipeStartX - currentX // Positivo = izquierda (abrir), Negativo = derecha (cerrar)
    
    // Calcular el nuevo offset basándome en el offset inicial y el movimiento
    // Si diff es positivo (deslizar izquierda), aumenta el offset
    // Si diff es negativo (deslizar derecha), disminuye el offset
    const newOffset = Math.max(0, Math.min(160, swipeStartOffset + diff))
    setSwipeOffset(newOffset)
  }
  
  const handleTouchEnd = (e?: React.TouchEvent) => {
    if (window.innerWidth >= 768) return
    
    // Si hubo un swipe significativo (más de 10px), no permitir el click
    const huboSwipe = swipeStartX !== null && Math.abs(swipeStartOffset - swipeOffset) > 10
    
    // Si el swipe es mayor a 80px, mantenerlo abierto, sino cerrarlo
    if (swipeOffset < 80) {
      setSwipeOffset(0)
      setFichaDeslizada(null)
    } else {
      // Mantener abierto pero asegurar que esté en 160px
      setSwipeOffset(160)
    }
    
    // Si hubo un swipe significativo, prevenir el click
    if (huboSwipe && e) {
      e.preventDefault()
    }
    
    setSwipeStartX(null)
    setSwipeStartOffset(0)
  }
  
  // Handlers para swipe en búsquedas inteligentes
  const handleTouchStartAvanzadas = (e: React.TouchEvent, evaluacionId: number) => {
    if (window.innerWidth >= 768) return // Solo en móvil
    setSwipeStartXAvanzadas(e.touches[0].clientX)
    setSwipeStartOffsetAvanzadas(swipeOffsetAvanzadas) // Guardar el offset inicial
    setFichaDeslizadaAvanzadas(evaluacionId)
  }
  
  const handleTouchMoveAvanzadas = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || swipeStartXAvanzadas === null) return
    
    const currentX = e.touches[0].clientX
    const diff = swipeStartXAvanzadas - currentX // Positivo = izquierda (abrir), Negativo = derecha (cerrar)
    
    // Calcular el nuevo offset basándome en el offset inicial y el movimiento
    const newOffset = Math.max(0, Math.min(160, swipeStartOffsetAvanzadas + diff))
    setSwipeOffsetAvanzadas(newOffset)
  }
  
  const handleTouchEndAvanzadas = (e?: React.TouchEvent) => {
    if (window.innerWidth >= 768) return
    
    // Si hubo un swipe significativo (más de 10px), no permitir el click
    const huboSwipe = swipeStartXAvanzadas !== null && Math.abs(swipeStartOffsetAvanzadas - swipeOffsetAvanzadas) > 10
    
    // Si el swipe es mayor a 80px, mantenerlo abierto, sino cerrarlo
    if (swipeOffsetAvanzadas < 80) {
      setSwipeOffsetAvanzadas(0)
      setFichaDeslizadaAvanzadas(null)
    } else {
      // Mantener abierto pero asegurar que esté en 160px
      setSwipeOffsetAvanzadas(160)
    }
    
    // Si hubo un swipe significativo, prevenir el click
    if (huboSwipe && e) {
      e.preventDefault()
    }
    
    setSwipeStartXAvanzadas(null)
    setSwipeStartOffsetAvanzadas(0)
  }
  
  // Cerrar swipe cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // No cerrar si se hace click en el menú desplegable
      if (target.closest('.menu-desplegable')) {
        return
      }
      if (fichaDeslizada !== null) {
        setFichaDeslizada(null)
        setSwipeOffset(0)
        setMenuAbierto(null)
      }
      // Cerrar swipe y menú de búsquedas inteligentes
      if (fichaDeslizadaAvanzadas !== null) {
        setFichaDeslizadaAvanzadas(null)
        setSwipeOffsetAvanzadas(0)
        setMenuAbiertoAvanzadas(null)
        setMenuPosicionAvanzadas(null)
      }
    }
    
    if (fichaDeslizada !== null || fichaDeslizadaAvanzadas !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [fichaDeslizada, fichaDeslizadaAvanzadas])
  
  // Cerrar menú cuando se hace click fuera
  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // No cerrar si se hace click en el botón de más opciones o en el menú
      if (target.closest('.menu-desplegable') || target.closest('.boton-mas-opciones')) {
        return
      }
      if (menuAbierto !== null) {
        setMenuAbierto(null)
        setMenuPosicion(null)
      }
      // Cerrar menú de búsquedas inteligentes
      if (menuAbiertoAvanzadas !== null) {
        setMenuAbiertoAvanzadas(null)
        setMenuPosicionAvanzadas(null)
      }
    }
    
    if (menuAbierto !== null || menuAbiertoAvanzadas !== null) {
      // Usar setTimeout para que el click del botón no cierre inmediatamente el menú
      setTimeout(() => {
        document.addEventListener('click', handleClickOutsideMenu)
      }, 100)
      return () => document.removeEventListener('click', handleClickOutsideMenu)
    }
  }, [menuAbierto, menuAbiertoAvanzadas])
  
  // Actualizar posición del menú al hacer scroll o resize
  useEffect(() => {
    if (menuAbierto !== null && menuPosicion) {
      const handleScroll = () => {
        setMenuAbierto(null)
        setMenuPosicion(null)
      }
      
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleScroll)
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [menuAbierto, menuPosicion])

  // Filtrar evaluaciones según el filtro activo
  // NOTA: En "Dashboard" y "Comprar", solo se muestran las búsquedas inteligentes (tipo_busqueda === 'completa')
  const evaluacionesFiltradas = evaluaciones.filter((evaluacion) => {
    // Excluir archivadas de los listados normales (excepto en Perfil)
    if (filtroActivo !== 'perfil' && archivadas.has(evaluacion.id)) {
      return false
    }
    
    // Filtro por favoritos
    if (filtroActivo === 'favoritos') {
      return favoritos.has(evaluacion.id) && !archivadas.has(evaluacion.id)
    }
    
    // Filtro por tipo de acción
    if (filtroActivo === 'comprar') {
      // En Compras, solo mostrar evaluaciones de tipo "completa"
      if (!esAccionComprar(evaluacion.accion)) return false
      if (evaluacion.scraping?.tipoBusqueda !== 'completa') return false
    }
    if (filtroActivo === 'vender' && !esAccionVender(evaluacion.accion)) return false
    if (filtroActivo === 'perfil') return false // Perfil no filtra evaluaciones (se maneja en la vista de Perfil)
    if (filtroActivo === 'dashboard') {
      // En Dashboard, solo mostrar búsquedas inteligentes (barita mágica)
      if (evaluacion.scraping?.tipoBusqueda !== 'completa') return false
      return true
    }

    return true
  })
  
  // Separar búsquedas inteligentes (tipoBusqueda === 'completa') de las demás en Comprar
  const busquedasAvanzadas = filtroActivo === 'comprar' 
    ? evaluacionesFiltradas.filter(e => e.scraping?.tipoBusqueda === 'completa')
    : []
  
  // Las demás evaluaciones (para mostrar en la lista normal, excluyendo las avanzadas en Comprar)
  const evaluacionesParaLista = filtroActivo === 'comprar'
    ? evaluacionesFiltradas.filter(e => e.scraping?.tipoBusqueda !== 'completa')
    : evaluacionesFiltradas
  
  // Obtener evaluaciones archivadas clasificadas por tipo
  const evaluacionesArchivadas = evaluaciones.filter(evaluacion => archivadas.has(evaluacion.id))
  const archivadasComprar = evaluacionesArchivadas.filter(evaluacion => esAccionComprar(evaluacion.accion))
  const archivadasVender = evaluacionesArchivadas.filter(evaluacion => esAccionVender(evaluacion.accion))
  
  // Manejar búsqueda directa (sin alternativas de ChatGPT)
  const handleBuscarDirecto = async () => {
    setMostrarSugerenciasBusqueda(false)
    setSugerenciasBusqueda([])

    // Validar que hay texto en la búsqueda
    if (!busquedaTexto.trim()) {
      setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
      setTimeout(() => setMensajeBusqueda(null), 3000)
      return
    }

    // Permitir desde dashboard o comprar
    if (filtroActivo !== 'comprar' && filtroActivo !== 'dashboard') {
      return
    }

    // Verificar que el usuario esté autenticado
    if (!user || !user.email) {
      setMensajeBusqueda(language === 'es' ? 'Debes estar autenticado para buscar' : 'You must be authenticated to search')
      setTimeout(() => setMensajeBusqueda(null), 3000)
      return
    }

    // Cancelar cualquier polling en curso
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }

    setBuscandoDirecto(true)
    setMensajeBusqueda(null)
    // Limpiar anuncios de búsqueda directa anterior
    setAnunciosBusquedaDirecta([])
    setEvaluacionBusquedaDirecta(null)
    
    // Guardar el texto de búsqueda para la redirección
    const textoBusqueda = busquedaTexto.trim()

    try {
      // Crear FormData con los datos necesarios
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('accion', language === 'es' ? 'quiero comprar al mejor precio' : 'I want to buy at the best price')
      formData.append('modeloMarca', busquedaTexto.trim())
      formData.append('pais', 'España')
      formData.append('ciudad', '')
      formData.append('tipoProducto', 'general')
      formData.append('estado', 'buen_estado')
      formData.append('accesorios', '')
      formData.append('urgencia', '')

      // Enviar petición al API de búsqueda directa
      const response = await fetch('/api/submit-request-direct', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Manejar errores
        if (result.errorCode === 'ONE_PER_DAY') {
          setMensajeBusqueda(result.error || (language === 'es' ? 'Solo se puede hacer una evaluación al día' : 'Only one evaluation per day allowed'))
        } else {
          setMensajeBusqueda(result.error || (language === 'es' ? 'Error al crear la evaluación' : 'Error creating evaluation'))
        }
        setTimeout(() => setMensajeBusqueda(null), 5000)
        setBuscandoDirecto(false)
        return
      }

      // Guardar el ID de la evaluación creada y el texto de búsqueda para verificar que los resultados correspondan
      const evaluacionIdEsperada = result.evaluacionId || result.evaluacion?.id
      const textoBusquedaEsperado = textoBusqueda.toLowerCase().trim()

      // Éxito: buscar la evaluación y sus anuncios usando polling
      // El scraping se ejecuta en segundo plano, así que hacemos polling hasta que haya resultados
      const buscarAnuncios = async (intento: number = 0, maxIntentos: number = 20) => {
        // Verificar si se canceló el polling (nueva búsqueda iniciada)
        if (!pollingTimeoutRef.current && intento > 0) {
          console.log('🛑 [Búsqueda Directa] Polling cancelado por nueva búsqueda')
          return
        }

        if (intento >= maxIntentos) {
          console.log('⏱️ [Búsqueda Directa] Timeout esperando resultados del scraping')
          setBuscandoDirecto(false)
          return
        }

        try {
          // Obtener evaluaciones directamente de la API
          const evalListResponse = await fetch('/api/my-evaluations')
          if (evalListResponse.ok) {
            const evalListData = await evalListResponse.json()
            const todasEvaluaciones = evalListData.evaluaciones || []
            
            // Buscar la evaluación que corresponde a esta búsqueda
            let evaluacionCorrecta: Evaluacion | null = null
            
            // Primero intentar encontrar por ID si lo tenemos
            if (evaluacionIdEsperada) {
              evaluacionCorrecta = todasEvaluaciones.find(
                (e: Evaluacion) => e.id === evaluacionIdEsperada && e.scraping?.tipoBusqueda === 'directa' && esAccionComprar(e.accion)
              ) || null
            }
            
            // Si no la encontramos por ID, buscar la más reciente que coincida con el texto de búsqueda
            if (!evaluacionCorrecta) {
              const evaluacionesRecientes = todasEvaluaciones.filter(
                (e: Evaluacion) => {
                  const coincideTipo = e.scraping?.tipoBusqueda === 'directa' && esAccionComprar(e.accion)
                  const coincideProducto = e.producto?.toLowerCase().trim() === textoBusquedaEsperado
                  return coincideTipo && coincideProducto
                }
              )
              
              if (evaluacionesRecientes.length > 0) {
                // Ordenar por fecha descendente y tomar la más reciente
                evaluacionCorrecta = evaluacionesRecientes.sort(
                  (a: Evaluacion, b: Evaluacion) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )[0]
              }
            }
            
            if (evaluacionCorrecta) {
              
              // Verificar que tenga scraping y obtener el ID del scraping_result
              if (evaluacionCorrecta.scraping?.id) {
                const scrapingId = evaluacionCorrecta.scraping.id
                console.log(`🔍 [Búsqueda Directa] Buscando evaluación con scraping_id: ${scrapingId}`)
                
                // Obtener los detalles completos de la evaluación usando el ID del scraping
                const evalResponse = await fetch(`/api/evaluation/${scrapingId}`)
                if (evalResponse.ok) {
                  const evalData = await evalResponse.json()
                  const evaluacion = evalData.evaluacion
                  
                  console.log(`🔍 [Búsqueda Directa] Evaluación obtenida:`, {
                    id: evaluacion.id,
                    tieneScraping: !!evaluacion.scraping,
                    tipoBusqueda: evaluacion.scraping?.tipoBusqueda,
                    tieneJsonCompradores: !!evaluacion.scraping?.jsonCompradores,
                    estructuraJsonCompradores: evaluacion.scraping?.jsonCompradores ? Object.keys(evaluacion.scraping.jsonCompradores) : []
                  })
                  
                  // Obtener los anuncios de la evaluación
                  // Para búsqueda directa, usar totalResultadosScrapping que contiene TODOS los anuncios sin filtrar
                  let anuncios: any[] = []
                  
                  // PRIORIDAD 1: Para búsqueda directa, usar totalResultadosScrapping (todos los anuncios)
                  if (evaluacion.scraping?.totalResultadosScrapping) {
                    if (Array.isArray(evaluacion.scraping.totalResultadosScrapping)) {
                      anuncios = evaluacion.scraping.totalResultadosScrapping
                      console.log(`📊 [Búsqueda Directa] Usando totalResultadosScrapping (array): ${anuncios.length} anuncios`)
                    } else if (evaluacion.scraping.totalResultadosScrapping.compradores) {
                      anuncios = evaluacion.scraping.totalResultadosScrapping.compradores
                      console.log(`📊 [Búsqueda Directa] Usando totalResultadosScrapping.compradores: ${anuncios.length} anuncios`)
                    }
                  }
                  
                  // FALLBACK: Si no hay totalResultadosScrapping, usar jsonCompradores (anuncios filtrados)
                  if (anuncios.length === 0 && evaluacion.scraping?.jsonCompradores) {
                    if (Array.isArray(evaluacion.scraping.jsonCompradores)) {
                      anuncios = evaluacion.scraping.jsonCompradores
                      console.log(`📊 [Búsqueda Directa] Fallback: Usando jsonCompradores (array): ${anuncios.length} anuncios`)
                    } else if (evaluacion.scraping.jsonCompradores.compradores) {
                      anuncios = evaluacion.scraping.jsonCompradores.compradores
                      console.log(`📊 [Búsqueda Directa] Fallback: Usando jsonCompradores.compradores: ${anuncios.length} anuncios`)
                    }
                  }
                  
                  // Log de plataformas encontradas
                  const plataformasEncontradas = new Set<string>()
                  anuncios.forEach((anuncio: any) => {
                    if (anuncio.plataforma) {
                      plataformasEncontradas.add(anuncio.plataforma)
                    }
                  })
                  console.log(`📊 [Búsqueda Directa] Anuncios encontrados: ${anuncios.length}`)
                  console.log(`📊 [Búsqueda Directa] Plataformas encontradas:`, Array.from(plataformasEncontradas))
                  console.log(`📊 [Búsqueda Directa] Desglose por plataforma:`, 
                    Array.from(plataformasEncontradas).map(p => ({
                      plataforma: p,
                      cantidad: anuncios.filter((a: any) => a.plataforma === p).length
                    }))
                  )
                  
                  // Verificar que la evaluación corresponde a la búsqueda actual
                  const productoEvaluacion = evaluacion.producto?.toLowerCase().trim() || ''
                  if (productoEvaluacion !== textoBusquedaEsperado && evaluacionIdEsperada && evaluacion.id !== evaluacionIdEsperada) {
                    console.log(`⚠️ [Búsqueda Directa] La evaluación encontrada no corresponde a la búsqueda actual. Esperado: "${textoBusquedaEsperado}", Encontrado: "${productoEvaluacion}"`)
                    // Continuar el polling para buscar la evaluación correcta
                    pollingTimeoutRef.current = setTimeout(() => buscarAnuncios(intento + 1, maxIntentos), 3000)
                    return
                  }
                  
                  if (anuncios && anuncios.length > 0) {
                    console.log(`✅ [Búsqueda Directa] Encontrados ${anuncios.length} anuncios para "${textoBusquedaEsperado}"`)
                    setAnunciosBusquedaDirecta(anuncios)
                    setEvaluacionBusquedaDirecta({
                      id: evaluacion.id,
                      producto: evaluacion.producto,
                      categoria: evaluacion.categoria || '',
                      condicion: evaluacion.condicion || '',
                      accion: evaluacion.accion,
                      ubicacion: evaluacion.ubicacion || '',
                      ciudad: evaluacion.ciudad,
                      pais: evaluacion.pais,
                      fecha: evaluacion.fecha,
                      scraping: evaluacion.scraping
                    })
                    // Recargar evaluaciones para actualizar la lista
                    fetchEvaluations()
                    setBuscandoDirecto(false)
                    
                    return // Salir del polling cuando encontramos resultados
                  } else {
                    console.log(`⏳ [Búsqueda Directa] Intento ${intento + 1}/${maxIntentos}: Aún no hay anuncios disponibles (scraping en progreso), reintentando...`)
                  }
                } else {
                  console.log(`⚠️ [Búsqueda Directa] Error al obtener detalles de evaluación: ${evalResponse.status}`)
                }
              } else {
                console.log(`⚠️ [Búsqueda Directa] La evaluación no tiene scraping asociado aún`)
              }
            } else {
              console.log(`⚠️ [Búsqueda Directa] No se encontró ninguna evaluación que corresponda a la búsqueda "${textoBusquedaEsperado}"`)
            }
          }
          
          // Si no hay resultados aún, esperar y reintentar
          if (intento < maxIntentos - 1) {
            pollingTimeoutRef.current = setTimeout(() => buscarAnuncios(intento + 1, maxIntentos), 3000) // Reintentar cada 3 segundos
          } else {
            console.log('⏱️ [Búsqueda Directa] Timeout: No se encontraron anuncios después de múltiples intentos')
            // Recargar evaluaciones de todas formas
            fetchEvaluations()
            setBuscandoDirecto(false)
          }
        } catch (err) {
          console.error('Error al obtener anuncios:', err)
          // Reintentar en caso de error
          if (intento < maxIntentos - 1) {
            pollingTimeoutRef.current = setTimeout(() => buscarAnuncios(intento + 1, maxIntentos), 3000)
          } else {
            setBuscandoDirecto(false)
          }
        }
      }

      // Si estamos en dashboard, redirigir inmediatamente a Compras con el texto de búsqueda
      if (filtroActivo === 'dashboard') {
        router.push(`/dashboard?filtro=comprar&busqueda=${encodeURIComponent(textoBusqueda)}`)
      }
      
      // Iniciar el polling después de un breve delay inicial
      setTimeout(() => buscarAnuncios(0, 20), 2000) // Empezar después de 2 segundos
      
      // Limpiar búsqueda solo si no estamos redirigiendo
      if (filtroActivo !== 'dashboard') {
      setBusquedaTexto('')
      }
      // No mostrar mensaje de éxito para búsquedas normales
      setTimeout(() => {
        fetchEvaluations() // Recargar evaluaciones
      }, 2000)
    } catch (err: any) {
      console.error('Error al buscar:', err)
      setMensajeBusqueda(language === 'es' ? 'Error al crear la evaluación' : 'Error creating evaluation')
      setTimeout(() => setMensajeBusqueda(null), 5000)
    } finally {
      setBuscandoDirecto(false)
    }
  }

  // Manejar búsqueda desde el panel de búsqueda inteligente
  const handleBuscarDesdePanel = async () => {
    setMostrarSugerenciasBusquedaPanel(false)
    setSugerenciasBusquedaPanel([])

    if (!busquedaTextoPanel.trim()) {
      return
    }

    if (!user || !user.email) {
      return
    }

    setBuscandoCompleto(true)

    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('accion', language === 'es' ? 'quiero comprar al mejor precio' : 'I want to buy at the best price')
      formData.append('modeloMarca', busquedaTextoPanel.trim())
      formData.append('pais', 'España')
      formData.append('ciudad', '')
      formData.append('tipoProducto', 'general')
      formData.append('estado', 'buen_estado')
      formData.append('accesorios', '')
      formData.append('urgencia', '')

      const response = await fetch('/api/submit-request', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        setBuscandoCompleto(false)
        return
      }

      // Esperar a que la evaluación esté lista y obtenerla
      const buscarResultado = async (intento: number = 0, maxIntentos: number = 20) => {
        if (intento >= maxIntentos) {
          setBuscandoCompleto(false)
          return
        }

        try {
          const evalListResponse = await fetch('/api/my-evaluations')
          if (evalListResponse.ok) {
            const evalListData = await evalListResponse.json()
            const todasEvaluaciones = evalListData.evaluaciones || []
            
            const evaluacionesRecientes = todasEvaluaciones.filter(
              (e: Evaluacion) => e.scraping?.tipoBusqueda === 'completa' && esAccionComprar(e.accion)
            )
            
            if (evaluacionesRecientes.length > 0) {
              const evaluacionMasReciente = evaluacionesRecientes.sort(
                (a: Evaluacion, b: Evaluacion) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
              )[0]
              
              if (evaluacionMasReciente.scraping?.id) {
                const scrapingId = evaluacionMasReciente.scraping.id
                const evalResponse = await fetch(`/api/evaluation/${scrapingId}`)
                if (evalResponse.ok) {
                  const evalData = await evalResponse.json()
                  setResultadoBusquedaAvanzada(evalData.evaluacion)
                  setBuscandoCompleto(false)
                  fetchEvaluations()
                  return
                }
              }
            }
          }
          
          if (intento < maxIntentos - 1) {
            setTimeout(() => buscarResultado(intento + 1, maxIntentos), 3000)
          } else {
            setBuscandoCompleto(false)
          }
        } catch (err) {
          if (intento < maxIntentos - 1) {
            setTimeout(() => buscarResultado(intento + 1, maxIntentos), 3000)
          } else {
            setBuscandoCompleto(false)
          }
        }
      }

      buscarResultado()
    } catch (err: any) {
      console.error('Error al buscar:', err)
      setBuscandoCompleto(false)
    }
  }

  // Manejar búsqueda con varita mágica (flujo completo con alternativas de ChatGPT) - DEPRECADO, ahora se usa el panel
  const handleBuscar = async () => {
    // Validar que hay texto en la búsqueda
    if (!busquedaTexto.trim()) {
      setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
      setTimeout(() => setMensajeBusqueda(null), 3000)
      return
    }

    // Permitir desde dashboard o comprar
    if (filtroActivo !== 'comprar' && filtroActivo !== 'dashboard') {
      return
    }

    // Verificar que el usuario esté autenticado
    if (!user || !user.email) {
      setMensajeBusqueda(language === 'es' ? 'Debes estar autenticado para buscar' : 'You must be authenticated to search')
      setTimeout(() => setMensajeBusqueda(null), 3000)
      return
    }

    setBuscandoCompleto(true)
    setMensajeBusqueda(null)

    try {
      // Crear FormData con los datos necesarios
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('accion', language === 'es' ? 'quiero comprar al mejor precio' : 'I want to buy at the best price')
      formData.append('modeloMarca', busquedaTexto.trim())
      formData.append('pais', 'España')
      formData.append('ciudad', '')
      formData.append('tipoProducto', 'general')
      formData.append('estado', 'buen_estado')
      formData.append('accesorios', '')
      formData.append('urgencia', '')

      // Enviar petición al API (flujo completo con alternativas)
      const response = await fetch('/api/submit-request', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Manejar errores
        if (result.errorCode === 'ONE_PER_DAY') {
          setMensajeBusqueda(result.error || (language === 'es' ? 'Solo se puede hacer una evaluación al día' : 'Only one evaluation per day allowed'))
        } else {
          setMensajeBusqueda(result.error || (language === 'es' ? 'Error al crear la evaluación' : 'Error creating evaluation'))
        }
        setTimeout(() => setMensajeBusqueda(null), 5000)
        return
      }

      // Éxito: limpiar búsqueda y recargar evaluaciones
      setBusquedaTexto('')
      setMensajeBusqueda(language === 'es' ? 'Evaluación creada correctamente' : 'Evaluation created successfully')
      setTimeout(() => {
        setMensajeBusqueda(null)
        fetchEvaluations() // Recargar evaluaciones
      }, 2000)
    } catch (err: any) {
      console.error('Error al buscar:', err)
      setMensajeBusqueda(language === 'es' ? 'Error al crear la evaluación' : 'Error creating evaluation')
      setTimeout(() => setMensajeBusqueda(null), 5000)
    } finally {
      setBuscandoCompleto(false)
    }
  }
  
  // Manejar Enter en la búsqueda
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBuscar()
    }
  }

  // Manejar búsqueda de ventas
  const handleBuscarVender = () => {
    setMostrarSugerenciasBusquedaVender(false)
    setSugerenciasBusquedaVender([])

    // Validar que hay texto en la búsqueda
    if (!busquedaTextoVender.trim()) {
      setMensajeBusquedaVender(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
      setTimeout(() => setMensajeBusquedaVender(null), 3000)
      return
    }

    // Verificar que el usuario esté autenticado
    if (!user || !user.email) {
      setMensajeBusquedaVender(language === 'es' ? 'Debes estar autenticado para buscar' : 'You must be authenticated to search')
      setTimeout(() => setMensajeBusquedaVender(null), 3000)
      return
    }

    setBuscandoVender(true)
    setMensajeBusquedaVender(null)

    // Abrir el formulario de ventas con el texto de búsqueda
    openForm('vender', busquedaTextoVender.trim())
    
    // Limpiar el estado después de un breve delay
    setTimeout(() => {
      setBuscandoVender(false)
      setBusquedaTextoVender('')
    }, 500)
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

  // Estados para modal de soporte
  const [modalSoporteAbierto, setModalSoporteAbierto] = useState(false)
  const [formularioSoporte, setFormularioSoporte] = useState({
    nombre: '',
    email: '',
    telefono: '',
    descripcion: ''
  })
  const [erroresSoporte, setErroresSoporte] = useState<Record<string, string>>({})
  const [enviandoSoporte, setEnviandoSoporte] = useState(false)
  const [exitoSoporte, setExitoSoporte] = useState(false)

  const handleChangeSoporte = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormularioSoporte(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo cuando se modifica
    if (erroresSoporte[name]) {
      setErroresSoporte(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validarFormularioSoporte = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!formularioSoporte.nombre.trim()) {
      nuevosErrores.nombre = language === 'es' ? 'El nombre es obligatorio' : 'Name is required'
    }

    if (!formularioSoporte.email.trim()) {
      nuevosErrores.email = language === 'es' ? 'El email es obligatorio' : 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formularioSoporte.email)) {
      nuevosErrores.email = language === 'es' ? 'El email no es válido' : 'Invalid email format'
    }

    if (!formularioSoporte.telefono.trim()) {
      nuevosErrores.telefono = language === 'es' ? 'El teléfono es obligatorio' : 'Phone is required'
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formularioSoporte.telefono)) {
      nuevosErrores.telefono = language === 'es' ? 'El formato del teléfono no es válido' : 'Invalid phone format'
    }

    if (!formularioSoporte.descripcion.trim()) {
      nuevosErrores.descripcion = language === 'es' ? 'La descripción del asunto es obligatoria' : 'Description is required'
    } else if (formularioSoporte.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = language === 'es' ? 'La descripción debe tener al menos 10 caracteres' : 'Description must be at least 10 characters'
    }

    setErroresSoporte(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmitSoporte = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormularioSoporte()) {
      return
    }

    setEnviandoSoporte(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formularioSoporte.nombre.trim(),
          email: formularioSoporte.email.trim(),
          telefono: formularioSoporte.telefono.trim(),
          comentario: formularioSoporte.descripcion.trim(), // Se envía como "comentario" a la API
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (language === 'es' ? 'Error al enviar el mensaje' : 'Error sending message'))
      }
      
      setExitoSoporte(true)
      
      // Resetear formulario después de 3 segundos y cerrar modal
      setTimeout(() => {
        setFormularioSoporte({
          nombre: '',
          email: '',
          telefono: '',
          descripcion: ''
        })
        setExitoSoporte(false)
        setModalSoporteAbierto(false)
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setErroresSoporte({ submit: error instanceof Error ? error.message : (language === 'es' ? 'Error al enviar el mensaje' : 'Error sending message') })
    } finally {
      setEnviandoSoporte(false)
    }
  }

  const cerrarModalSoporte = () => {
    if (!enviandoSoporte) {
      setFormularioSoporte({
        nombre: '',
        email: '',
        telefono: '',
        descripcion: ''
      })
      setErroresSoporte({})
      setExitoSoporte(false)
      setModalSoporteAbierto(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'es' ? 'Error' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEvaluations}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'es' ? 'Reintentar' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Oculto en móvil cuando está en dashboard, oculto completamente en Compras, Ventas y Favoritos */}
      <header className={`${filtroActivo === 'dashboard' ? 'hidden md:block' : ''} ${filtroActivo === 'comprar' || filtroActivo === 'vender' || filtroActivo === 'favoritos' ? 'hidden' : ''} bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-0 md:h-auto`}>
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
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

      <div className={`flex ${filtroActivo === 'dashboard' ? 'pt-0 md:pt-16' : ''} ${filtroActivo === 'comprar' || filtroActivo === 'vender' || filtroActivo === 'favoritos' || filtroActivo === 'perfil' ? 'pt-0' : 'pt-16'}`}>
        {/* Sidebar */}
        <aside className={`hidden md:flex fixed left-0 ${filtroActivo === 'dashboard' ? 'top-0 h-screen' : 'top-16 h-[calc(100vh-4rem)]'} w-64 flex-shrink-0 flex-col bg-gray-50 border-r border-gray-200 z-40`}>
          <div className="p-6 flex-1 overflow-y-auto">
            <nav className="space-y-1">
              <button
                onClick={() => setFiltroActivo('dashboard')}
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
                onClick={() => setFiltroActivo('comprar')}
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
                onClick={() => setFiltroActivo('vender')}
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
                onClick={() => setFiltroActivo('favoritos')}
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
          <div className={`${filtroActivo === 'dashboard' ? 'pt-0 px-4 pb-24 sm:px-6 sm:pb-24 lg:px-8 lg:pb-8 xl:px-12' : 'p-4 sm:p-6 lg:p-8 xl:p-12'} ${filtroActivo === 'perfil' ? 'pb-32 md:pb-8' : filtroActivo === 'dashboard' ? '' : 'pb-24 md:pb-8'}`}>
            {/* Vista de Perfil */}
            {filtroActivo === 'perfil' ? (
              <div className="space-y-6">
                {/* Contenedor principal de perfil vacío - sin título */}

                {/* Sección de Uso de Búsquedas */}
                {(() => {
                  // Obtener fecha de hoy (solo fecha, sin hora)
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  const fechaHoy = hoy.toISOString().split('T')[0] // Formato YYYY-MM-DD
                  
                  // Función para verificar si una fecha es de hoy
                  const esHoy = (fecha: string) => {
                    if (!fecha) return false
                    const fechaEvaluacion = new Date(fecha)
                    fechaEvaluacion.setHours(0, 0, 0, 0)
                    const fechaEvaluacionStr = fechaEvaluacion.toISOString().split('T')[0]
                    return fechaEvaluacionStr === fechaHoy
                  }

                  // Contar búsquedas normales de compra (directa) - Solo las de hoy (ilimitadas)
                  const busquedasNormales = evaluaciones.filter(e => {
                    if (!esAccionComprar(e.accion) || archivadas.has(e.id)) return false
                    // Si tiene scraping y tipoBusqueda es 'directa', o si no tiene tipoBusqueda pero tiene scraping (asumimos directa)
                    // Y debe ser del día de hoy
                    return e.scraping && (e.scraping.tipoBusqueda === 'directa' || !e.scraping.tipoBusqueda) && esHoy(e.fecha)
                  }).length

                  // Contar búsquedas avanzadas (completa) - Solo las de hoy
                  const busquedasAvanzadas = evaluaciones.filter(e => 
                    e.scraping?.tipoBusqueda === 'completa' &&
                    !archivadas.has(e.id) &&
                    esHoy(e.fecha)
                  ).length

                  // Contar búsquedas de venta - Solo las de hoy
                  const busquedasVenta = evaluaciones.filter(e => 
                    esAccionVender(e.accion) &&
                    !archivadas.has(e.id) &&
                    esHoy(e.fecha)
                  ).length

                  // Límites (obtenidos desde la API que lee EVALUACIONES_LIMITE_DIARIO de .env.local)
                  const limiteAvanzadas = limiteDiario
                  const limiteVenta = limiteDiario
                            
                            return (
                    <div className="max-w-4xl mx-auto pt-20 md:pt-4 pb-40 md:pb-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 px-4">
                        {language === 'es' ? 'Uso de búsquedas' : 'Search usage'}
                                    </h3>
                      
                      <div className="space-y-3 md:space-y-6 px-4">
                        {/* Búsquedas Normales de Compra */}
                        <div className="bg-white rounded-lg md:rounded-xl shadow-md border border-gray-200 p-3 md:p-6">
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-6 md:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                                  {language === 'es' ? 'Búsquedas normales' : 'Normal searches'}
                                </h4>
                                <p className="text-xs text-gray-500 hidden md:block">
                                  {language === 'es' ? 'Búsquedas de compra directas' : 'Direct purchase searches'}
                                      </p>
                                    </div>
                                </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xl md:text-2xl font-bold text-primary-600">{busquedasNormales}</p>
                              <p className="text-xs text-gray-500">
                                {language === 'es' ? 'Ilimitadas' : 'Unlimited'}
                              </p>
                              </div>
                        </div>
                          {/* Barra de progreso infinita (siempre llena) */}
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                            <div 
                              className="bg-primary-600 h-2 md:h-3 rounded-full transition-all duration-500"
                              style={{ width: '100%' }}
                            />
                      </div>
                        </div>

                        {/* Búsquedas Avanzadas */}
                        <div className="bg-white rounded-lg md:rounded-xl shadow-md border border-gray-200 p-3 md:p-6">
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                  </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                                  {language === 'es' ? 'Búsquedas inteligentes' : 'Intelligent searches'}
                        </h4>
                                <p className="text-xs text-gray-500 hidden md:block">
                                  {language === 'es' ? 'Búsquedas avanzadas con análisis' : 'Advanced searches with analysis'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xl md:text-2xl font-bold text-purple-600">
                                {busquedasAvanzadas} / {limiteAvanzadas}
                              </p>
                              <p className="text-xs text-gray-500">
                                {language === 'es' ? 'Por día' : 'Per day'}
                              </p>
                            </div>
                          </div>
                          {/* Barra de progreso */}
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                            <div 
                              className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                                busquedasAvanzadas >= limiteAvanzadas 
                                  ? 'bg-red-500' 
                                  : busquedasAvanzadas > 0 
                                    ? 'bg-purple-600' 
                                    : 'bg-gray-300'
                              }`}
                              style={{ width: `${Math.min((busquedasAvanzadas / limiteAvanzadas) * 100, 100)}%` }}
                            />
                          </div>
                          {busquedasAvanzadas >= limiteAvanzadas && (
                            <p className="text-xs text-red-600 mt-1 md:mt-2">
                              {language === 'es' ? 'Límite diario alcanzado' : 'Daily limit reached'}
                            </p>
                          )}
                                  </div>
                                  
                        {/* Búsquedas de Venta */}
                        <div className="bg-white rounded-lg md:rounded-xl shadow-md border border-gray-200 p-3 md:p-6">
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm md:text-base font-semibold text-gray-900">
                                  {language === 'es' ? 'Búsquedas de venta' : 'Sell searches'}
                                </h4>
                                <p className="text-xs text-gray-500 hidden md:block">
                                  {language === 'es' ? 'Análisis de precio de venta' : 'Sale price analysis'}
                                </p>
                                          </div>
                                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xl md:text-2xl font-bold text-green-600">
                                {busquedasVenta} / {limiteVenta}
                              </p>
                              <p className="text-xs text-gray-500">
                                {language === 'es' ? 'Por día' : 'Per day'}
                              </p>
                                          </div>
                                        </div>
                          {/* Barra de progreso */}
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                            <div 
                              className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                                busquedasVenta >= limiteVenta 
                                  ? 'bg-red-500' 
                                  : busquedasVenta > 0 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-300'
                              }`}
                              style={{ width: `${Math.min((busquedasVenta / limiteVenta) * 100, 100)}%` }}
                            />
                                      </div>
                          {busquedasVenta >= limiteVenta && (
                            <p className="text-xs text-red-600 mt-1 md:mt-2">
                              {language === 'es' ? 'Límite diario alcanzado' : 'Daily limit reached'}
                                      </p>
                          )}
                                    </div>
                      </div>
                    </div>
                  )
                })()}
                                  
                {/* Botones Cerrar Sesión y Soporte - Fijos en la parte inferior, justo encima del menú */}
                <div className="fixed bottom-16 left-0 right-0 md:bottom-auto md:relative md:left-auto md:right-auto bg-white border-t border-gray-200 shadow-lg md:shadow-none z-[9998] md:z-auto p-2 md:p-0 md:max-w-md md:mx-auto md:mt-auto md:pt-4">
                  <div className="space-y-2 max-w-md mx-auto md:max-w-none">
                    {/* Botón Cerrar Sesión */}
                                  <button
                      onClick={handleSignOut}
                      className="w-full px-6 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                                  </button>

                    {/* Botón Soporte */}
                    <button
                      onClick={() => setModalSoporteAbierto(true)}
                      className="w-full px-6 py-1.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                      {language === 'es' ? 'Soporte' : 'Support'}
                    </button>
                  </div>
                </div>
              </div>
            ) : filtroActivo === 'dashboard' ? (
              <div className="space-y-4 md:space-y-4">
                {/* Header fijo en móvil - Logo, barra de búsqueda y botones */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white pb-4 border-b border-gray-100 overflow-visible">
                  <div className="px-4 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      {/* Logo */}
                      <a href="/" className="flex-shrink-0">
                        <img
                          src="/images/solo_logo_sin_Fondo.png"
                          alt="Pricofy Logo"
                          className="h-12 object-contain"
                        />
                      </a>
                {/* Barra de búsqueda */}
                      <div className="flex-1 relative">
                        <div className="flex items-stretch border border-primary-500 rounded-full overflow-hidden shadow-md">
                    <div className="relative flex-1 flex items-center min-w-0">
                      <input
                        type="text"
                        value={busquedaTexto}
                        onChange={(e) => setBusquedaTexto(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleBuscarDirecto()
                          }
                        }}
                        onFocus={() => {
                          if (sugerenciasBusqueda.length > 0) {
                            setMostrarSugerenciasBusqueda(true)
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setMostrarSugerenciasBusqueda(false), 200)
                        }}
                        placeholder={language === 'es' ? '¿Qué quieres buscar?' : 'Search new product'}
                        disabled={buscandoDirecto || buscandoCompleto}
                              className="w-full pl-4 pr-4 py-2 focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-xs"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>
                        </div>
                        {(() => {
                          console.log('[Frontend] Renderizando sugerencias - mostrarSugerenciasBusqueda:', mostrarSugerenciasBusqueda, 'sugerenciasBusqueda.length:', sugerenciasBusqueda.length, 'sugerenciasBusqueda:', sugerenciasBusqueda)
                          return null
                        })()}
                    {mostrarSugerenciasBusqueda && sugerenciasBusqueda.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                        {sugerenciasBusqueda.map((sugerencia, index) => (
                          <button
                            key={`${sugerencia}-${index}`}
                            type="button"
                            onClick={() => {
                              setBusquedaTexto(sugerencia)
                              setMostrarSugerenciasBusqueda(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                          >
                            {sugerencia}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                    {/* 2 Botones: Comprar y Vender */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (!busquedaTexto.trim()) {
                            setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
                            setTimeout(() => setMensajeBusqueda(null), 3000)
                            return
                          }
                          // Redirigir a Compras con el texto de búsqueda
                          router.push(`/dashboard?filtro=comprar&busqueda=${encodeURIComponent(busquedaTexto.trim())}`)
                        }}
                        className="flex-1 h-8 border border-primary-500 rounded-full px-4 bg-white hover:bg-primary-50 transition-colors font-semibold text-primary-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {language === 'es' ? 'Comprar' : 'Buy'}
                      </button>
                      <button
                        onClick={() => {
                          if (!busquedaTexto.trim()) {
                            setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
                            setTimeout(() => setMensajeBusqueda(null), 3000)
                            return
                          }
                          // Redirigir a Ventas con el texto de búsqueda
                          router.push(`/dashboard?filtro=vender&busqueda=${encodeURIComponent(busquedaTexto.trim())}`)
                        }}
                        className="flex-1 h-8 border border-green-500 rounded-full px-4 bg-white hover:bg-green-50 transition-colors font-semibold text-green-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        {language === 'es' ? 'Vender' : 'Sell'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barra de búsqueda y botones - Escritorio */}
                <div className="hidden md:block">
                  <div className="flex items-center gap-3 pt-4 mb-8">
                    {/* Logo */}
                    <a href="/" className="flex-shrink-0">
                      <img
                        src="/images/solo_logo_sin_Fondo.png"
                        alt="Pricofy Logo"
                        className="h-12 object-contain"
                      />
                    </a>
                    {/* Barra de búsqueda */}
                    <div className="flex-1 relative">
                      <div className="flex items-stretch border border-primary-500 rounded-full overflow-hidden shadow-md">
                      <div className="relative flex-1 flex items-center min-w-0">
                        <input
                          type="text"
                          value={busquedaTexto}
                          onChange={(e) => setBusquedaTexto(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleBuscarDirecto()
                            }
                          }}
                          onFocus={() => {
                            if (sugerenciasBusqueda.length > 0) {
                              setMostrarSugerenciasBusqueda(true)
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setMostrarSugerenciasBusqueda(false), 200)
                          }}
                          placeholder={language === 'es' ? '¿Qué quieres buscar?' : 'Search new product'}
                          disabled={buscandoDirecto || buscandoCompleto}
                          className="w-full pl-4 pr-4 py-2 focus:outline-none bg-transparent disabled:opacity-50"
                          style={{ 
                            fontSize: '16px',
                            lineHeight: '1.5'
                          }}
                        />
                        </div>
                      </div>
                      {mostrarSugerenciasBusqueda && sugerenciasBusqueda.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-48 overflow-y-auto">
                          {sugerenciasBusqueda.map((sugerencia, index) => (
                            <button
                              key={`${sugerencia}-${index}`}
                              type="button"
                              onClick={() => {
                                setBusquedaTexto(sugerencia)
                                setMostrarSugerenciasBusqueda(false)
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                            >
                              {sugerencia}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 2 Botones: Comprar y Vender - Mismo ancho que la barra de búsqueda */}
                  <div className="flex items-center gap-3 mb-8">
                    {/* Espaciador para alinear con el logo */}
                    <div className="flex-shrink-0" style={{ width: '48px' }}></div>
                    {/* Contenedor de botones con el mismo ancho que la barra de búsqueda */}
                    <div className="flex-1 flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (!busquedaTexto.trim()) {
                          setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
                          setTimeout(() => setMensajeBusqueda(null), 3000)
                          return
                        }
                          // Redirigir a Compras con el texto de búsqueda
                          router.push(`/dashboard?filtro=comprar&busqueda=${encodeURIComponent(busquedaTexto.trim())}`)
                        }}
                        className="flex-1 h-10 border border-primary-500 rounded-full px-4 bg-white hover:bg-primary-50 transition-colors font-semibold text-primary-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {language === 'es' ? 'Comprar' : 'Buy'}
                      </button>
                      <button
                        onClick={() => {
                          if (!busquedaTexto.trim()) {
                            setMensajeBusqueda(language === 'es' ? 'Por favor, introduce un producto en la barra de búsqueda' : 'Please enter a product in the search bar')
                            setTimeout(() => setMensajeBusqueda(null), 3000)
                            return
                          }
                          // Redirigir a Ventas con el texto de búsqueda
                          router.push(`/dashboard?filtro=vender&busqueda=${encodeURIComponent(busquedaTexto.trim())}`)
                        }}
                        className="flex-1 h-10 border border-green-500 rounded-full px-4 bg-white hover:bg-green-50 transition-colors font-semibold text-green-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      {language === 'es' ? 'Vender' : 'Sell'}
                    </button>
                    </div>
                  </div>
                </div>

                {/* Espaciador para el header fijo en móvil */}
                <div className="md:hidden h-6"></div>

                {/* Mensaje de búsqueda */}
                {mensajeBusqueda && (
                  <div className={`mb-4 text-sm ${
                    mensajeBusqueda.includes('Error') || mensajeBusqueda.includes('Debes estar') || mensajeBusqueda.includes('Solo se puede') || mensajeBusqueda.includes('Por favor')
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {mensajeBusqueda}
                  </div>
                )}

                {/* Sección: Compras */}
                {(() => {
                  const compras = evaluaciones.filter(e => 
                    esAccionComprar(e.accion) && 
                    !archivadas.has(e.id) && 
                    e.scraping?.tipoBusqueda === 'completa'
                  )
                  return compras.length > 0 ? (
                    <div className="pt-4 mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Compras' : 'Purchases'}
                      </h3>
                      <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-12">
                        <div className="flex gap-4" style={{ width: 'max-content' }}>
                          {compras.map((evaluacion) => {
                            const esFavorito = favoritos.has(evaluacion.id)
                            const tieneScraping = evaluacion.scraping !== null
                            const evaluationId = evaluacion.scraping?.id || evaluacion.id
                            return (
                              <Link
                                key={evaluacion.id}
                                href={`/dashboard/evaluation/${evaluationId}`}
                                className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                  !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  {evaluacion.scraping?.tipoBusqueda === 'directa' ? (
                                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  ) : evaluacion.scraping?.tipoBusqueda === 'completa' ? (
                                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                  ) : null}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
                                    {evaluacion.producto}
                                  </h4>
                                      {evaluacion.scraping?.tipoBusqueda === 'completa' && (
                                        <button
                                          onClick={async (e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            // Cargar los datos completos de la evaluación incluyendo productosNuevos
                                            if (evaluacion.scraping?.id) {
                                              try {
                                                const evalResponse = await fetch(`/api/evaluation/${evaluacion.scraping.id}`)
                                                if (evalResponse.ok) {
                                                  const evalData = await evalResponse.json()
                                                  setResultadoBusquedaAvanzada(evalData.evaluacion)
                                                  abrirPanelInfo()
                                                } else {
                                                  // Si falla, usar los datos que ya tenemos
                                                  setResultadoBusquedaAvanzada(evaluacion)
                                                  abrirPanelInfo()
                                                }
                                              } catch (error) {
                                                console.error('Error al cargar detalles de evaluación:', error)
                                                // Si falla, usar los datos que ya tenemos
                                                setResultadoBusquedaAvanzada(evaluacion)
                                                abrirPanelInfo()
                                              }
                                            } else {
                                              setResultadoBusquedaAvanzada(evaluacion)
                                              abrirPanelInfo()
                                            }
                                          }}
                                          className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors flex-shrink-0"
                                        >
                                          + info
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDateShort(evaluacion.fecha)}
                                </p>
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                                  {/* Botón de archivar */}
                                <button
                                  onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      archivarEvaluacion(evaluacion.id)
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                    title={language === 'es' ? 'Archivar' : 'Archive'}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                  </button>
                                  {/* Botón de favorito */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorito(evaluacion.id)
                                  }}
                                    className="w-8 h-8 flex items-center justify-center z-20"
                                >
                                  <svg
                                    className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                    fill={esFavorito ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Compras' : 'Purchases'}
                      </h3>
                      <div className="bg-white rounded-lg border border-gray-200 px-8 py-4 text-left md:text-center">
                        <div className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto">
                          <p className="mb-3">
                            {language === 'es' 
                              ? (
                                <>
                                  Desde{' '}
                                  <button
                                    onClick={() => setFiltroActivo('comprar')}
                                    className="inline-flex items-center justify-center gap-1.5 border border-primary-500 rounded-full px-3 py-0 bg-white font-semibold text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Comprar
                                  </button>
                                  {' '}tienes dos tipos de búsqueda:
                                </>
                              )
                              : (
                                <>
                                  From{' '}
                                  <button
                                    onClick={() => setFiltroActivo('comprar')}
                                    className="inline-flex items-center justify-center gap-1.5 border border-primary-500 rounded-full px-3 py-0 bg-white font-semibold text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Buy
                                  </button>
                                  {' '}you have two types of search:
                                </>
                              )}
                          </p>
                          <div className="text-left space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                              <p>
                                {language === 'es' 
                                  ? <><span className="font-bold">Multi-plataforma:</span> busca tu producto en varias plataformas a la vez.</>
                                  : <><span className="font-bold">Multi-platform:</span> search for your product across multiple platforms at once.</>}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                              <p>
                                {language === 'es' 
                                  ? (
                                    <>
                                      <span className="font-bold">Búsqueda inteligente:</span> encuentra exactamente lo que realmente quieres. <span className="italic">"Porque si buscas un iPhone, no quieres ver cargadores, cajas vacías ni carcasas de Spiderman"</span>
                                    </>
                                  )
                                  : (
                                    <>
                                      <span className="font-bold">Intelligent search:</span> find exactly what you really want. <span className="italic">Because if you're looking for an iPhone, you don't want to see chargers, empty boxes, or Spiderman cases</span>
                                    </>
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Sección: Ventas */}
                {(() => {
                  const ventas = evaluaciones.filter(e => esAccionVender(e.accion) && !archivadas.has(e.id))
                  return ventas.length > 0 ? (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Ventas' : 'Sales'}
                      </h3>
                      <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-12">
                        <div className="flex gap-4" style={{ width: 'max-content' }}>
                          {ventas.map((evaluacion) => {
                            const esFavorito = favoritos.has(evaluacion.id)
                            const tieneScraping = evaluacion.scraping !== null
                            const evaluationId = evaluacion.scraping?.id || evaluacion.id
                            return (
                              <Link
                                key={evaluacion.id}
                                href={`/dashboard/evaluation/${evaluationId}`}
                                className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                  !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                }`}
                              >
                                <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                                  {evaluacion.producto}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDateShort(evaluacion.fecha)}
                                </p>
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                                  {/* Botón de archivar */}
                                <button
                                  onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      archivarEvaluacion(evaluacion.id)
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                    title={language === 'es' ? 'Archivar' : 'Archive'}
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                  </button>
                                  {/* Botón de favorito */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorito(evaluacion.id)
                                  }}
                                    className="w-8 h-8 flex items-center justify-center z-20"
                                >
                                  <svg
                                    className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                    fill={esFavorito ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Ventas' : 'Sales'}
                      </h3>
                      <div className="bg-white rounded-lg border border-gray-200 px-8 py-4 text-center">
                        <div className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto">
                          <p>
                            {language === 'es' 
                              ? (
                                <>
                                  Desde la opción{' '}
                                  <button
                                    onClick={() => setFiltroActivo('vender')}
                                    className="inline-flex items-center justify-center gap-1.5 border border-green-500 rounded-full px-3 py-0 bg-white font-semibold text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Vender
                                  </button>
                                  {' '}podrás buscar un producto y nosotros te damos todas las métricas del mercado para que lo vendas con total seguridad.
                                </>
                              )
                              : (
                                <>
                                  From the{' '}
                                  <button
                                    onClick={() => setFiltroActivo('vender')}
                                    className="inline-flex items-center justify-center gap-1.5 border border-green-500 rounded-full px-3 py-0 bg-white font-semibold text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sell
                                  </button>
                                  {' '}option you can search for a product and we'll give you all the market metrics so you can sell it with complete confidence.
                                </>
                              )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Sección: Alertas configuradas */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {language === 'es' ? 'Alertas configuradas' : 'Configured alerts'}
                  </h3>
                  <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                    <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                      {/* Ficha 1: Alertas automáticas de mercado */}
                      <div 
                        onClick={() => setModalContratarPlanAbierto(true)}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-2 md:p-3 flex-shrink-0 w-80 md:w-full cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <p className="text-sm text-gray-600 text-center leading-tight">
                      {language === 'es' 
                            ? <>Alertas automáticas de mercado. <span className="font-bold">Actívalas</span> y no te llevarás la sorpresa '<span className="font-bold">¡Oh no! Han publicado uno más barato que el tuyo</span>'</>
                            : <>Automatic market alerts. <span className="font-bold">Activate them</span> and you won't be surprised '<span className="font-bold">Oh no! Someone posted one cheaper than yours</span>'</>}
                        </p>
                      </div>
                      {/* Ficha 2: Alertas automáticas de ofertas de mercado */}
                      <div 
                        onClick={() => setModalContratarPlanAbierto(true)}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-2 md:p-3 flex-shrink-0 w-80 md:w-full cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <p className="text-sm text-gray-600 text-center leading-tight">
                          {language === 'es' 
                            ? <>Alertas automáticas de ofertas de mercado.<br /><span className="font-bold">Actívalas</span> y nosotros te avisamos si alguien vende esa Bicicleta que tanto deseas</>
                            : <>Automatic market offer alerts.<br /><span className="font-bold">Activate them</span> and we'll notify you if someone sells that Bicycle you want so much</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Notificaciones */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {language === 'es' ? 'Notificaciones' : 'Notifications'}
                  </h3>
                  <div 
                    onClick={() => setModalContratarPlanAbierto(true)}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <p className="text-gray-600 text-center">
                      {language === 'es' ? 'No tienes ninguna notificación pendiente' : 'You have no pending notifications'}
                    </p>
                  </div>
                </div>

                {/* Sección: Favoritos */}
                {(() => {
                  const favoritosList = evaluaciones.filter(e =>
                    favoritos.has(e.id) &&
                    !archivadas.has(e.id) &&
                    (!busquedaTexto.trim() ||
                     e.producto.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                     e.categoria.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                     e.ubicacion.toLowerCase().includes(busquedaTexto.toLowerCase()))
                  )
                  
                  // Separar búsquedas de compra y venta
                  const favoritosBusquedas = favoritosList.filter(e => esAccionComprar(e.accion))
                  const favoritosVentas = favoritosList.filter(e => esAccionVender(e.accion))
                  
                  // Obtener todos los anuncios favoritos de todas las búsquedas
                  const todosLosAnuncios: any[] = []
                  const urlsAnuncios = new Set<string>()
                  evaluaciones.forEach(evaluacion => {
                    if (evaluacion.scraping?.totalResultadosScrapping) {
                      const resultados = Array.isArray(evaluacion.scraping.totalResultadosScrapping)
                        ? evaluacion.scraping.totalResultadosScrapping
                        : evaluacion.scraping.totalResultadosScrapping.compradores || []
                      resultados.forEach((anuncio: any) => {
                        if (
                          anuncio.url_anuncio &&
                          anunciosFavoritos.has(anuncio.url_anuncio) &&
                          !urlsAnuncios.has(anuncio.url_anuncio)
                        ) {
                          todosLosAnuncios.push(anuncio)
                          urlsAnuncios.add(anuncio.url_anuncio)
                        }
                      })
                    }
                    if (evaluacion.scraping?.jsonCompradores) {
                      const compradores = Array.isArray(evaluacion.scraping.jsonCompradores)
                        ? evaluacion.scraping.jsonCompradores
                        : evaluacion.scraping.jsonCompradores.compradores || []
                      compradores.forEach((anuncio: any) => {
                        if (
                          anuncio.url_anuncio &&
                          anunciosFavoritos.has(anuncio.url_anuncio) &&
                          !urlsAnuncios.has(anuncio.url_anuncio)
                        ) {
                          todosLosAnuncios.push(anuncio)
                          urlsAnuncios.add(anuncio.url_anuncio)
                        }
                      })
                    }
                  })
                  
                  // Filtrar anuncios favoritos por búsqueda si hay texto
                  const anunciosFavoritosFiltrados = busquedaTexto.trim()
                    ? todosLosAnuncios.filter(anuncio =>
                        anuncio.titulo?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                        anuncio.descripcion?.toLowerCase().includes(busquedaTexto.toLowerCase())
                      )
                    : todosLosAnuncios
                  
                  return (
                    <div className="mb-8">
                      {/* Título "Favoritos" solo en Dashboard */}
                      {filtroActivo === 'dashboard' && (
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'es' ? 'Favoritos' : 'Favorites'}
                      </h3>
                      )}
                      {/* Switch con 3 botones: Búsquedas, Anuncios, Ventas - Ocupa todo el ancho */}
                      <div className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1 w-full mb-4">
                        <button
                          onClick={() => setTipoFavoritos('busquedas')}
                          className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                            tipoFavoritos === 'busquedas'
                              ? 'bg-purple-600 text-white shadow-md transform scale-105'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {language === 'es' ? 'Búsquedas' : 'Searches'}
                        </button>
                        <button
                          onClick={() => setTipoFavoritos('anuncios')}
                          className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                            tipoFavoritos === 'anuncios'
                              ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {language === 'es' ? 'Anuncios' : 'Listings'}
                        </button>
                        <button
                          onClick={() => setTipoFavoritos('ventas')}
                          className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                            tipoFavoritos === 'ventas'
                              ? 'bg-green-600 text-white shadow-md transform scale-105'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {language === 'es' ? 'Ventas' : 'Sales'}
                        </button>
                      </div>
                      {tipoFavoritos === 'busquedas' ? (
                        // Mostrar búsquedas favoritas (solo compras)
                        favoritosBusquedas.length > 0 ? (
                        <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                          <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                              {favoritosBusquedas.map((evaluacion) => {
                              const esFavorito = favoritos.has(evaluacion.id)
                              const esComprar = esAccionComprar(evaluacion.accion)
                              const esVender = esAccionVender(evaluacion.accion)
                              const tieneScraping = evaluacion.scraping !== null
                              const evaluationId = evaluacion.scraping?.id || evaluacion.id
                              return (
                                <Link
                                  key={evaluacion.id}
                                  href={`/dashboard/evaluation/${evaluationId}`}
                                  className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                    !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-2 mb-2">
                                    {esComprar && evaluacion.scraping?.tipoBusqueda === 'directa' ? (
                                      <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    ) : esComprar && evaluacion.scraping?.tipoBusqueda === 'completa' ? (
                                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                      </svg>
                                    ) : null}
                                    <h4 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2">
                                      {evaluacion.producto}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {formatDateShort(evaluacion.fecha)}
                                  </p>
                                  <div className="mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      esComprar ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'
                                    }`}>
                                      {esComprar ? (language === 'es' ? 'Compra' : 'Buy') : (language === 'es' ? 'Venta' : 'Sell')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                      e.stopPropagation()
                                      toggleFavorito(evaluacion.id)
                                    }}
                                      className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center z-20"
                                  >
                                    <svg
                                      className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                      fill={esFavorito ? 'currentColor' : 'none'}
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                          <p className="text-gray-600 text-center">
                            {language === 'es' ? 'No existe ningún Favorito para mostrar' : 'No favorites in the list'}
                          </p>
                          </div>
                        )
                        ) : tipoFavoritos === 'anuncios' ? (
                        // Mostrar anuncios favoritos
                        anunciosFavoritosFiltrados.length > 0 ? (
                          <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                            <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                              {anunciosFavoritosFiltrados.map((anuncio, index) => {
                                const esFavoritoAnuncio = anuncio.url_anuncio ? anunciosFavoritos.has(anuncio.url_anuncio) : false
                                return (
                                  <div
                                    key={anuncio.url_anuncio || index}
                                    onClick={() => setAnuncioModal(anuncio)}
                                    className="relative flex items-start gap-3 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex-shrink-0 w-64 p-4 cursor-pointer"
                                  >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      {anuncio.product_image ? (
                                        <img
                                          src={anuncio.product_image}
                                          alt={anuncio.titulo || 'Anuncio'}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                        </div>
                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                        {anuncio.titulo || 'Sin título'}
                                      </h4>
                                      <p className="text-base font-bold text-primary-600 mt-2">
                                        {anuncio.precio_eur ? `${anuncio.precio_eur.toFixed(2)}€` : 'N/A'}
                                      </p>
                                      {anuncio.plataforma && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                          <img
                                            src={anuncio.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                            alt={anuncio.plataforma}
                                            className="h-4 w-auto"
                                          />
                                          <span className="truncate">{anuncio.plataforma}</span>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (anuncio.url_anuncio) {
                                          toggleAnuncioFavorito(anuncio.url_anuncio)
                                        }
                                      }}
                                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                      title={esFavoritoAnuncio
                                        ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                                        : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                                      aria-label={esFavoritoAnuncio
                                        ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                                        : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                                    >
                                      <svg
                                        className={`w-5 h-5 ${esFavoritoAnuncio ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                        fill={esFavoritoAnuncio ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    </button>
                    </div>
                  )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <p className="text-gray-600 text-center">
                              {language === 'es' ? 'No hay anuncios favoritos para mostrar' : 'No favorite listings to show'}
                            </p>
                          </div>
                        )
                      ) : (
                        // Mostrar ventas favoritas
                        favoritosVentas.length > 0 ? (
                        <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                          <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                              {favoritosVentas.map((evaluacion) => {
                                const esFavorito = favoritos.has(evaluacion.id)
                              const esVender = esAccionVender(evaluacion.accion)
                              const tieneScraping = evaluacion.scraping !== null
                              const evaluationId = evaluacion.scraping?.id || evaluacion.id
                              return (
                              <Link
                                key={evaluacion.id}
                                href={`/dashboard/evaluation/${evaluationId}`}
                                className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                  !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2">
                                    {evaluacion.producto}
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDateShort(evaluacion.fecha)}
                                </p>
                                <div className="mt-2">
                                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                                        {language === 'es' ? 'Venta' : 'Sell'}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                        e.preventDefault()
                                    e.stopPropagation()
                                        toggleFavorito(evaluacion.id)
                                      }}
                                      className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center z-20"
                                    >
                                      <svg
                                        className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                        fill={esFavorito ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </Link>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                          <p className="text-gray-600 text-center">
                              {language === 'es' ? 'No hay ventas favoritas para mostrar' : 'No favorite sales to show'}
                          </p>
                        </div>
                        )
                      )}
                    </div>
                  )
                })()}
              </div>
            ) : (
              <>
                  {/* Header sticky para Compras - Logo y barra de búsqueda */}
                {filtroActivo === 'comprar' && (
                    <div className="md:hidden h-16 sticky top-0 z-40 bg-white border-b border-gray-100 overflow-visible">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <img
                            src="/images/solo_logo_sin_Fondo.png"
                            alt="Pricofy Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                        {/* Barra de búsqueda */}
                        <div className="flex-1 relative">
                          <div className="flex items-stretch border border-primary-500 rounded-full overflow-hidden shadow-md">
                        <div className="relative flex-1 flex items-center min-w-0">
                          <input
                            type="text"
                            value={busquedaTexto}
                            onChange={(e) => setBusquedaTexto(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleBuscarDirecto()
                              }
                            }}
                            onFocus={() => {
                              if (sugerenciasBusqueda.length > 0) {
                                setMostrarSugerenciasBusqueda(true)
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setMostrarSugerenciasBusqueda(false), 200)
                            }}
                            placeholder={language === 'es' ? 'Buscar nuevo producto' : 'Search new product'}
                            disabled={buscandoDirecto || buscandoCompleto}
                                className="w-full pl-4 pr-14 py-2 focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-xs"
                            style={{ 
                              fontSize: '16px',
                              lineHeight: '1.5'
                            }}
                          />
                          {/* Círculo de lupa a la derecha (reemplaza al botón Buscar) */}
                          <button
                            onClick={handleBuscarDirecto}
                            disabled={!busquedaTexto.trim() || buscandoDirecto || buscandoCompleto}
                            className="absolute right-2 flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 flex-shrink-0"
                          >
                            {buscandoDirecto ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            )}
                          </button>
                            </div>
                          </div>
                          {mostrarSugerenciasBusqueda && sugerenciasBusqueda.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                              {sugerenciasBusqueda.map((sugerencia, index) => (
                                <button
                                  key={`${sugerencia}-${index}`}
                                  type="button"
                                  onClick={() => {
                                    setBusquedaTexto(sugerencia)
                                    setMostrarSugerenciasBusqueda(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                                >
                                  {sugerencia}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      
                      {/* Botón Varita Mágica (componente separado, redondo) - Abre panel */}
                      <button
                        onClick={() => {
                          // Autorellenar el campo de búsqueda del panel con el texto actual
                          setBusquedaTextoPanel(busquedaTexto)
                          setPanelBusquedaAvanzadaAbierto(true)
                        }}
                        className="w-12 h-12 bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center flex-shrink-0 rounded-full shadow-md"
                        title={language === 'es' ? 'Búsqueda inteligente con alternativas' : 'Smart search with alternatives'}
                      >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                      </button>
                    </div>
                    {mensajeBusqueda && (
                      <div className={`mt-2 text-sm ${
                        mensajeBusqueda.includes('Error') || mensajeBusqueda.includes('Debes estar') || mensajeBusqueda.includes('Solo se puede')
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {mensajeBusqueda}
                      </div>
                    )}
                  </div>
                )}

                  {/* Header sticky para Ventas - Logo y barra de búsqueda */}
                {filtroActivo === 'vender' && (
                  <>
                    <div className="md:hidden h-16 sticky top-0 z-40 bg-white border-b border-gray-100 overflow-visible">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <img
                            src="/images/solo_logo_sin_Fondo.png"
                            alt="Pricofy Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                        {/* Barra de búsqueda */}
                        <div className="flex-1 relative">
                          <div className="flex items-stretch border border-green-500 rounded-full overflow-hidden shadow-md">
                        <div className="relative flex-1 flex items-center min-w-0">
                          <input
                            type="text"
                            value={busquedaTextoVender}
                            onChange={(e) => setBusquedaTextoVender(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleBuscarVender()
                              }
                            }}
                            onFocus={() => {
                              if (sugerenciasBusquedaVender.length > 0) {
                                setMostrarSugerenciasBusquedaVender(true)
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setMostrarSugerenciasBusquedaVender(false), 200)
                            }}
                            placeholder={language === 'es' ? 'Buscar producto para vender' : 'Search product to sell'}
                            disabled={buscandoVender}
                                className="w-full pl-4 pr-14 py-2 focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-xs"
                            style={{ 
                              fontSize: '16px',
                              lineHeight: '1.5'
                            }}
                          />
                          {/* Círculo de lupa a la derecha */}
                          <button
                            onClick={handleBuscarVender}
                            disabled={!busquedaTextoVender.trim() || buscandoVender}
                            className="absolute right-2 flex items-center justify-center w-8 h-8 bg-green-600 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 flex-shrink-0"
                          >
                            {buscandoVender ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            )}
                          </button>
                            </div>
                          </div>
                          {mostrarSugerenciasBusquedaVender && sugerenciasBusquedaVender.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                              {sugerenciasBusquedaVender.map((sugerencia, index) => (
                                <button
                                  key={`${sugerencia}-${index}`}
                                  type="button"
                                  onClick={() => {
                                    setBusquedaTextoVender(sugerencia)
                                    setMostrarSugerenciasBusquedaVender(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                                >
                                  {sugerencia}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      
                      {/* Selector de vista (píldora) a la derecha de la barra de búsqueda */}
                      {evaluacionesFiltradas.length > 0 && (
                          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white flex-shrink-0">
                          {/* Botón Vista Lista (3 rayas) */}
                          <button
                            onClick={() => setVistaActivaVender('lista')}
                              className={`px-2 py-1.5 flex items-center justify-center transition-colors min-w-[44px] min-h-[36px] ${
                              vistaActivaVender === 'lista'
                                ? 'bg-green-600 text-white'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </button>
                          {/* Botón Vista Fichas (4 cuadraditos) */}
                          <button
                            onClick={() => setVistaActivaVender('fichas')}
                              className={`px-2 py-1.5 flex items-center justify-center border-l border-gray-300 transition-colors min-w-[44px] min-h-[36px] ${
                              vistaActivaVender === 'fichas'
                                ? 'bg-green-600 text-white'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                    {mensajeBusquedaVender && (
                      <div className={`mt-2 text-sm ${
                        mensajeBusquedaVender.includes('Error') || mensajeBusquedaVender.includes('Debes estar') || mensajeBusquedaVender.includes('Por favor')
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {mensajeBusquedaVender}
                      </div>
                    )}
                  </>
                )}

                {/* Lista de Anuncios de Búsqueda Directa - Solo en Comprar */}
                {filtroActivo === 'comprar' && (
                  <>
                    {/* Lista de Anuncios de Búsqueda Directa */}
                    {buscandoDirecto && anunciosBusquedaDirecta.length === 0 ? (
                      /* Spinner mientras se cargan los resultados */
                      <div className="mb-6 flex flex-col items-center justify-center py-12">
                        <div className="relative">
                          <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                          {language === 'es' ? 'Buscando resultados...' : 'Searching for results...'}
                        </p>
                      </div>
                    ) : anunciosBusquedaDirecta.length > 0 ? (
                      <div className="mb-6">
                        {/* Título "Resultados encontrados" */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {language === 'es' ? 'Resultados encontrados' : 'Results found'}
                        </h3>
                        {/* Barra de búsqueda, filtros y selector de vista para anuncios */}
                        <div className="mb-4 flex flex-row gap-2 sm:gap-3 items-center">
                          <div className="flex-1 relative flex items-stretch border border-primary-500 rounded-full overflow-hidden shadow-md min-w-0">
                            <div className="relative flex-1 flex items-center min-w-0">
                              <svg className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                type="text"
                                value={busquedaTextoAnuncios}
                                onChange={(e) => setBusquedaTextoAnuncios(e.target.value)}
                                placeholder={language === 'es' ? 'Buscar en anuncios...' : 'Search in listings...'}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 focus:outline-none bg-transparent placeholder:text-xs"
                                style={{ 
                                  fontSize: '16px',
                                  lineHeight: '1.5'
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => setMostrarFiltrosAnuncios(true)}
                            className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg flex-shrink-0 min-w-[40px] min-h-[40px] md:min-w-[36px] md:min-h-[36px]"
                          >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Lista de anuncios - Vista Lista */}
                        {vistaAnuncios === 'lista' ? (
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Cabecera con Precio clickeable */}
                            <div className="bg-gray-50 border-b-2 border-gray-200 px-4 py-1.5 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Título' : 'Title'}</span>
                              </div>
                              <div 
                                className="flex-shrink-0 cursor-pointer px-2 py-1 rounded select-none"
                                onClick={() => setOrdenPrecioAnuncios(ordenPrecioAnuncios === 'desc' ? 'asc' : 'desc')}
                              >
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">{language === 'es' ? 'Precio' : 'Price'}</span>
                                  {ordenPrecioAnuncios === 'desc' && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  )}
                                  {ordenPrecioAnuncios === 'asc' && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-5"></div>
                            </div>
                            <div className="divide-y divide-gray-100">
                              {anunciosBusquedaDirecta
                                .filter((anuncio) => {
                                  // Filtro de texto
                                  if (busquedaTextoAnuncios.trim()) {
                                    const textoBusqueda = busquedaTextoAnuncios.toLowerCase().trim()
                                    const titulo = anuncio.titulo?.toLowerCase() || ''
                                    if (!titulo.includes(textoBusqueda)) return false
                                  }
                                  
                                  // Filtro de precio mínimo
                                  if (filtrosAnuncios.precioMinimo > 0 && anuncio.precio_eur) {
                                    if (anuncio.precio_eur < filtrosAnuncios.precioMinimo) return false
                                  }
                                  
                                  // Filtro de precio máximo
                                  if (filtrosAnuncios.precioMaximo > 0 && anuncio.precio_eur) {
                                    if (anuncio.precio_eur > filtrosAnuncios.precioMaximo) return false
                                  }
                                  
                                  // Filtro de tipo de envío
                                  if (filtrosAnuncios.tipoEnvio === 'mano') {
                                    // Solo mostrar anuncios con is_shippable: false (trato en mano)
                                    if (anuncio.is_shippable !== false) return false
                                  }
                                  // Si es 'envio', mostrar todos (true o false)
                                  
                                  // Filtro por estado (estrellas)
                                  if (filtrosAnuncios.estadoMinimo > 0) {
                                    const valorEstadoAnuncio = obtenerValorEstado(anuncio.estado_declarado)
                                    if (valorEstadoAnuncio < filtrosAnuncios.estadoMinimo) {
                                      return false
                                    }
                                  }
                                  
                                  // Filtro de solo perfiles top
                                  if (filtrosAnuncios.soloTopProfile && !anuncio.is_top_profile) {
                                    return false
                                  }
                                  
                                  // Filtro por país
                                  if (filtrosAnuncios.pais) {
                                    const countryCode = (anuncio as any).country_code || 'N/A'
                                    if (countryCode !== filtrosAnuncios.pais) {
                                      return false
                                    }
                                  }
                                  
                                  return true
                                })
                                .sort((a, b) => {
                                  // Aplicar ordenamiento por precio si está activo
                                  if (ordenPrecioAnuncios !== null) {
                                    const precioA = a.precio_eur || 0
                                    const precioB = b.precio_eur || 0
                                    return ordenPrecioAnuncios === 'desc' ? precioB - precioA : precioA - precioB
                                  }
                                  // Orden aleatorio por defecto
                                  return Math.random() - 0.5
                                })
                                .map((anuncio, index) => (
                                  <div
                                    key={index}
                                    onClick={() => setAnuncioModal(anuncio)}
                                    className="px-4 py-2 md:py-1.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3 min-h-[44px] md:min-h-0"
                                  >
                                    {/* Título */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                                        {anuncio.titulo}
                                      </h4>
                                    </div>
                                    
                                    {/* Precio */}
                                    <div className="flex-shrink-0">
                                      <p className="text-sm md:text-base font-bold text-primary-600 whitespace-nowrap">
                                        {anuncio.precio_eur ? `${anuncio.precio_eur.toFixed(2)}€` : 'N/A'}
                                      </p>
                                    </div>
                                    
                                    {/* Icono de plataforma */}
                                    {anuncio.plataforma && (
                                      <div className="flex-shrink-0">
                                        <a
                                          href={anuncio.url_anuncio}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <img
                                            src={anuncio.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                            alt={anuncio.plataforma}
                                            className="h-4 md:h-5 w-auto"
                                          />
                                        </a>
                  </div>
                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          /* Lista de anuncios - Vista Fichas */
                          <div className="grid grid-cols-2 gap-4">
                            {anunciosBusquedaDirecta
                              .filter((anuncio) => {
                                // Filtro de texto
                                if (busquedaTextoAnuncios.trim()) {
                                  const textoBusqueda = busquedaTextoAnuncios.toLowerCase().trim()
                                  const titulo = anuncio.titulo?.toLowerCase() || ''
                                  if (!titulo.includes(textoBusqueda)) return false
                                }
                                
                                // Filtro de precio mínimo
                                if (filtrosAnuncios.precioMinimo > 0 && anuncio.precio_eur) {
                                  if (anuncio.precio_eur < filtrosAnuncios.precioMinimo) return false
                                }
                                
                                // Filtro de precio máximo
                                if (filtrosAnuncios.precioMaximo > 0 && anuncio.precio_eur) {
                                  if (anuncio.precio_eur > filtrosAnuncios.precioMaximo) return false
                                }
                                
                                // Filtro de tipo de envío
                                if (filtrosAnuncios.tipoEnvio === 'mano') {
                                  // Solo mostrar anuncios con is_shippable: false (trato en mano)
                                  if (anuncio.is_shippable !== false) return false
                                }
                                // Si es 'envio', mostrar todos (true o false)
                                
                                // Filtro por estado (estrellas)
                                if (filtrosAnuncios.estadoMinimo > 0) {
                                  const valorEstadoAnuncio = obtenerValorEstado(anuncio.estado_declarado)
                                  if (valorEstadoAnuncio < filtrosAnuncios.estadoMinimo) {
                                    return false
                                  }
                                }
                                
                                // Filtro de solo perfiles top
                                if (filtrosAnuncios.soloTopProfile && !anuncio.is_top_profile) {
                                  return false
                                }
                                
                                // Filtro por país
                                if (filtrosAnuncios.pais) {
                                  const countryCode = (anuncio as any).country_code || 'N/A'
                                  if (countryCode !== filtrosAnuncios.pais) {
                                    return false
                                  }
                                }
                                
                                return true
                              })
                              .sort((a, b) => {
                                // Aplicar ordenamiento por precio si está activo
                                if (ordenPrecioAnuncios !== null) {
                                  const precioA = a.precio_eur || 0
                                  const precioB = b.precio_eur || 0
                                  return ordenPrecioAnuncios === 'desc' ? precioB - precioA : precioA - precioB
                                }
                                // Orden aleatorio por defecto
                                return Math.random() - 0.5
                              })
                              .map((anuncio, index) => (
                                <div
                                  key={index}
                                  onClick={() => setAnuncioModal(anuncio)}
                                  className="bg-white rounded-xl shadow-lg p-2 md:p-3 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                                >
                                  {/* Foto */}
                                  {anuncio.product_image ? (
                                    <div className="mb-1.5 rounded-lg overflow-hidden aspect-square">
                                      <img
                                        src={anuncio.product_image}
                                        alt={anuncio.titulo || 'Producto'}
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
                                      {anuncio.titulo}
                                    </h4>
                                    {anuncio.plataforma && (
                                      <a
                                        href={anuncio.url_anuncio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-shrink-0"
                                      >
                                        <img
                                          src={anuncio.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                          alt={anuncio.plataforma}
                                          className="h-5 w-auto"
                                        />
                                      </a>
                                    )}
                                  </div>
                                  
                                  {/* Precio */}
                                  <div className="flex items-center justify-start">
                                    <p className="text-sm md:text-base font-bold text-primary-600">
                                      {anuncio.precio_eur ? `${anuncio.precio_eur.toFixed(2)}€` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        
                        {/* Modal de Filtros para Anuncios */}
                        {mostrarFiltrosAnuncios && (
                          <>
                            {/* Overlay */}
                            <div 
                              className="fixed inset-0 bg-black bg-opacity-50 z-50"
                              onClick={() => setMostrarFiltrosAnuncios(false)}
                              onTouchMove={(e) => e.preventDefault()}
                              style={{ touchAction: 'none' }}
                            />
                            {/* Modal */}
                            <div 
                              className="fixed inset-0 z-50 flex items-center justify-center p-4"
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                  setMostrarFiltrosAnuncios(false)
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
                                  onClick={() => setMostrarFiltrosAnuncios(false)}
                                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">
                                  {language === 'es' ? 'Filtros' : 'Filters'}
                                </h3>
                                
                                {(() => {
                                  // Calcular precios mínimo y máximo de todos los anuncios
                                  const precios = anunciosBusquedaDirecta
                                    .map(a => a.precio_eur)
                                    .filter((p): p is number => typeof p === 'number' && p > 0)
                                  const precioMin = precios.length > 0 ? Math.min(...precios) : 0
                                  const precioMax = precios.length > 0 ? Math.max(...precios) : 1000
                                  
                                  return (
                                    <>
                                      {/* Slider de Rango de Precio */}
                                      <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          {language === 'es' ? 'Rango de precios' : 'Price range'}
                                        </label>
                                        <div className="relative">
                                          {/* Línea del slider */}
                                          <div 
                                            ref={sliderContainerRefAnuncios}
                                            className="relative h-2 bg-gray-200 rounded-full"
                                          >
                                            {/* Barra de progreso entre mínimo y máximo */}
                                            <div 
                                              className="absolute h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full top-0"
                                              style={{ 
                                                left: filtrosAnuncios.precioMinimo === 0 
                                                  ? '0%' 
                                                  : `${((filtrosAnuncios.precioMinimo - precioMin) / (precioMax - precioMin)) * 100}%`,
                                                width: (() => {
                                                  const minPos = filtrosAnuncios.precioMinimo === 0 
                                                    ? 0 
                                                    : ((filtrosAnuncios.precioMinimo - precioMin) / (precioMax - precioMin)) * 100
                                                  const maxPos = filtrosAnuncios.precioMaximo === 0 
                                                    ? 100 
                                                    : ((filtrosAnuncios.precioMaximo - precioMin) / (precioMax - precioMin)) * 100
                                                  return `${maxPos - minPos}%`
                                                })()
                                              }}
                                            />
                                            
                                            {/* Input para precio mínimo */}
                                            <input
                                              data-range="min"
                                              type="range"
                                              min={precioMin}
                                              max={filtrosAnuncios.precioMaximo > 0 ? filtrosAnuncios.precioMaximo : precioMax}
                                              step={Math.max(1, Math.floor((precioMax - precioMin) / 100))}
                                              value={filtrosAnuncios.precioMinimo === 0 ? precioMin : filtrosAnuncios.precioMinimo}
                                              onMouseDown={(e) => {
                                                const input = e.currentTarget as HTMLInputElement
                                                input.style.zIndex = '30'
                                                const maxInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                                if (maxInput) maxInput.style.zIndex = '10'
                                              }}
                                              onTouchStart={(e) => {
                                                const input = e.currentTarget as HTMLInputElement
                                                input.style.zIndex = '30'
                                                const maxInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                                if (maxInput) maxInput.style.zIndex = '10'
                                              }}
                                              onChange={(e) => {
                                                const valor = parseFloat(e.target.value)
                                                // Asegurar que el mínimo no sea mayor que el máximo
                                                if (filtrosAnuncios.precioMaximo > 0 && valor > filtrosAnuncios.precioMaximo) {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMinimo: filtrosAnuncios.precioMaximo })
                                                } else if (valor <= precioMin) {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMinimo: 0 })
                                                } else {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMinimo: valor })
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
                                              min={filtrosAnuncios.precioMinimo > 0 ? filtrosAnuncios.precioMinimo : precioMin}
                                              max={precioMax}
                                              step={Math.max(1, Math.floor((precioMax - precioMin) / 100))}
                                              value={filtrosAnuncios.precioMaximo === 0 ? precioMax : filtrosAnuncios.precioMaximo}
                                              onMouseDown={(e) => {
                                                const input = e.currentTarget as HTMLInputElement
                                                input.style.zIndex = '30'
                                                const minInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                                if (minInput) minInput.style.zIndex = '10'
                                              }}
                                              onTouchStart={(e) => {
                                                const input = e.currentTarget as HTMLInputElement
                                                input.style.zIndex = '30'
                                                const minInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                                if (minInput) minInput.style.zIndex = '10'
                                              }}
                                              onChange={(e) => {
                                                const valor = parseFloat(e.target.value)
                                                // Asegurar que el máximo no sea menor que el mínimo
                                                if (filtrosAnuncios.precioMinimo > 0 && valor < filtrosAnuncios.precioMinimo) {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMaximo: filtrosAnuncios.precioMinimo })
                                                } else if (valor >= precioMax) {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMaximo: 0 })
                                                } else {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, precioMaximo: valor })
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
                                                left: filtrosAnuncios.precioMinimo === 0
                                                  ? '0px'
                                                  : `calc(${((filtrosAnuncios.precioMinimo - precioMin) / (precioMax - precioMin)) * 100}% - 12px)`,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                touchAction: 'none'
                                              }}
                                              onPointerDown={(e) => {
                                                e.stopPropagation()
                                                setArrastrandoAnuncios('min')
                                                const input = sliderContainerRefAnuncios.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                                if (input) {
                                                  input.style.zIndex = '30'
                                                  const maxInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                                  if (maxInput) maxInput.style.zIndex = '10'
                                                }
                                              }}
                                            />
                                            
                                            {/* Bolita para precio máximo - Ahora arrastrable */}
                                            <div
                                              className="absolute w-6 h-6 bg-primary-600 rounded-full shadow-lg border-2 border-white cursor-pointer z-30"
                                              style={{ 
                                                left: filtrosAnuncios.precioMaximo === 0
                                                  ? `calc(100% - 12px)`
                                                  : `calc(${((filtrosAnuncios.precioMaximo - precioMin) / (precioMax - precioMin)) * 100}% - 12px)`,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                touchAction: 'none'
                                              }}
                                              onPointerDown={(e) => {
                                                e.stopPropagation()
                                                setArrastrandoAnuncios('max')
                                                const input = sliderContainerRefAnuncios.current?.querySelector('input[data-range="max"]') as HTMLInputElement
                                                if (input) {
                                                  input.style.zIndex = '30'
                                                  const minInput = sliderContainerRefAnuncios.current?.querySelector('input[data-range="min"]') as HTMLInputElement
                                                  if (minInput) minInput.style.zIndex = '10'
                                                }
                                              }}
                                            />
                                          </div>
                                          
                                          {/* Valores mostrados debajo del slider */}
                                          <div className="mt-2 flex justify-center gap-3">
                                            <div className="inline-block px-2 py-0.5 bg-primary-100 rounded-full">
                                              <span className="text-xs font-semibold text-primary-700">
                                                {filtrosAnuncios.precioMinimo === 0 
                                                  ? (language === 'es' ? 'Mín: Sin límite' : 'Min: No limit')
                                                  : `${language === 'es' ? 'Mín: ' : 'Min: '}${formatPrice(filtrosAnuncios.precioMinimo)}`
                                                }
                                              </span>
                                            </div>
                                            <div className="inline-block px-2 py-0.5 bg-primary-100 rounded-full">
                                              <span className="text-xs font-semibold text-primary-700">
                                                {filtrosAnuncios.precioMaximo === 0 
                                                  ? (language === 'es' ? 'Máx: Sin límite' : 'Max: No limit')
                                                  : `${language === 'es' ? 'Máx: ' : 'Max: '}${formatPrice(filtrosAnuncios.precioMaximo)}`
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
                                                if (filtrosAnuncios.estadoMinimo === estrella) {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, estadoMinimo: 0 })
                                                } else {
                                                  setFiltrosAnuncios({ ...filtrosAnuncios, estadoMinimo: estrella })
                                                }
                                              }}
                                              className="focus:outline-none transition-transform hover:scale-110"
                                              aria-label={`${estrella} ${estrella === 1 ? 'estrella' : 'estrellas'}`}
                                            >
                                              <svg
                                                className={`w-8 h-8 ${
                                                  filtrosAnuncios.estadoMinimo >= estrella
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
                                        {filtrosAnuncios.estadoMinimo > 0 && (
                                          <p className="mt-1 text-xs text-gray-600">
                                            {language === 'es' 
                                              ? `Mostrando: ${filtrosAnuncios.estadoMinimo === 1 ? 'Necesita reparación' : filtrosAnuncios.estadoMinimo === 2 ? 'Usado' : filtrosAnuncios.estadoMinimo === 3 ? 'Buen estado' : filtrosAnuncios.estadoMinimo === 4 ? 'Como nuevo' : 'Nuevo'} o mejor`
                                              : `Showing: ${filtrosAnuncios.estadoMinimo === 1 ? 'Needs repair' : filtrosAnuncios.estadoMinimo === 2 ? 'Used' : filtrosAnuncios.estadoMinimo === 3 ? 'Good condition' : filtrosAnuncios.estadoMinimo === 4 ? 'Like new' : 'New'} or better`}
                                          </p>
                                        )}
                                      </div>

                                      {/* Selector de tipo de envío (píldora) - Solo 2 opciones */}
                                      <div className="mb-3">
                                        <div className="relative bg-gray-100 rounded-full p-0.5 flex">
                                          <button
                                            onClick={() => setFiltrosAnuncios({ ...filtrosAnuncios, tipoEnvio: 'envio' })}
                                            className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
                                              filtrosAnuncios.tipoEnvio === 'envio'
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                          >
                                            {language === 'es' ? 'Con envío' : 'With shipping'}
                                          </button>
                                          <button
                                            onClick={() => setFiltrosAnuncios({ ...filtrosAnuncios, tipoEnvio: 'mano' })}
                                            className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
                                              filtrosAnuncios.tipoEnvio === 'mano'
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
                                            checked={filtrosAnuncios.soloTopProfile}
                                            onChange={(e) => setFiltrosAnuncios({ ...filtrosAnuncios, soloTopProfile: e.target.checked })}
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
                                          value={filtrosAnuncios.pais}
                                          onChange={(e) => setFiltrosAnuncios({ ...filtrosAnuncios, pais: e.target.value })}
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
                                            
                                            // Obtener países únicos de los anuncios
                                            const paisesUnicos = new Set<string>()
                                            anunciosBusquedaDirecta.forEach(anuncio => {
                                              const countryCode = (anuncio as any).country_code
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
                                            setFiltrosAnuncios({
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
                                          onClick={() => setMostrarFiltrosAnuncios(false)}
                                          className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                                        >
                                          {language === 'es' ? 'Aplicar filtros' : 'Apply filters'}
                                        </button>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Mensaje amigable cuando no hay búsquedas */
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div>
                          {/* <p className="text-gray-600 mb-4">
                            {language === 'es' 
                              ? 'Nada que mostrar por aquí' 
                              : 'Nothing to show here'}
                             
                          </p> */}
                          <div className="mb-4">
                            <img 
                              src="/images/nada_mostrar_busqueda_normal.png" 
                              alt={language === 'es' ? 'Búsqueda normal' : 'Normal search'}
                              className="w-28 h-28 mx-auto object-contain"
                            />
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto space-y-3 text-center">
                            <p>
                              {language === 'es' 
                                ? 'Dinos qué estás buscando y nosotros lo haremos por ti, analizando todas las plataformas que podamos'
                                : 'Tell us what you\'re looking for and we\'ll search for it across all available platforms'}
                            </p>
                            <p className="font-medium text-primary-600">
                              {language === 'es'
                                ? 'O utiliza nuestro Buscador Inteligente para optimizar los resultados devueltos'
                                : 'Or use our Intelligent Search to optimize the returned results'}
                            </p>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => setPanelBusquedaAvanzadaAbierto(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-colors"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <span>{language === 'es' ? 'Buscador Inteligente' : 'Intelligent Search'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modal de Anuncio */}
                    {anuncioModal && (
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
                        onClick={() => setAnuncioModal(null)}
                      >
                        <div 
                          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              {language === 'es' ? 'Detalles del anuncio' : 'Listing details'}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAnuncioModal(null)
                              }}
                              className="text-white hover:text-gray-200 transition-colors z-10"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-6">
                            {anuncioModal.product_image && (
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <img
                                  src={anuncioModal.product_image}
                                  alt={anuncioModal.titulo || 'Producto'}
                                  className="w-full max-h-64 object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h4 className="text-xl font-bold text-gray-900">
                                {anuncioModal.titulo}
                              </h4>
                              {anuncioModal.plataforma && (
                                <a
                                  href={anuncioModal.url_anuncio || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0"
                                  onClick={(e) => {
                                    if (!anuncioModal.url_anuncio) {
                                      e.preventDefault()
                                      return
                                    }
                                    e.stopPropagation()
                                  }}
                                >
                                  <img
                                    src={anuncioModal.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                    alt={anuncioModal.plataforma}
                                    className="h-7 w-7 object-contain"
                                  />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                  {language === 'es' ? 'Precio' : 'Price'}
                                </p>
                                <p className="text-3xl font-bold text-primary-600">
                                  {anuncioModal.precio_eur ? `${anuncioModal.precio_eur.toFixed(2)}€` : 'N/A'}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (anuncioModal.url_anuncio) {
                                    toggleAnuncioFavorito(anuncioModal.url_anuncio)
                                  }
                                }}
                                className={`p-2.5 rounded-full transition-colors ${
                                  anuncioModal.url_anuncio ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 cursor-not-allowed'
                                }`}
                                aria-label={
                                  anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio)
                                    ? language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites'
                                    : language === 'es' ? 'Añadir a favoritos' : 'Add to favorites'
                                }
                                disabled={!anuncioModal.url_anuncio}
                              >
                                <svg
                                  className={`w-8 h-8 ${
                                    anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio)
                                      ? 'text-red-500'
                                      : 'text-gray-300'
                                  }`}
                                  fill={anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio) ? 'currentColor' : 'none'}
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={anuncioModal.url_anuncio && anunciosFavoritos.has(anuncioModal.url_anuncio) ? 0 : 1.8}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                            {anuncioModal.descripcion && (
                              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                                {anuncioModal.descripcion}
                              </p>
                            )}
                            <div className="space-y-2 text-sm">
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
                  </>
                )}

                {/* Evaluaciones */}
                  {/* Header sticky para Favoritos - Logo y barra de búsqueda */}
                  {filtroActivo === 'favoritos' && (
                    <div className="sticky top-0 z-40 bg-white pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <img
                            src="/images/solo_logo_sin_Fondo.png"
                            alt="Pricofy Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                        {/* Barra de búsqueda */}
                        <div className="flex-1 relative flex items-stretch border border-primary-500 rounded-full overflow-hidden shadow-md">
                        <div className="relative flex-1 flex items-center min-w-0">
                          <input
                            type="text"
                            value={busquedaTexto}
                            onChange={(e) => setBusquedaTexto(e.target.value)}
                            placeholder={language === 'es' ? 'Buscar en favoritos' : 'Search in favorites'}
                            className="w-full pl-4 pr-4 py-3 focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-xs"
                            style={{
                              fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)',
                              lineHeight: '1.5'
                            }}
                          />
                        </div>
                      </div>
                      </div>
                    </div>
                  )}

                  {/* Header sticky para Perfil - Logo y bandera del idioma */}
                  {filtroActivo === 'perfil' && (
                    <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        {/* Logo a la izquierda */}
                        <div className="flex-shrink-0">
                          <img
                            src="/images/solo_logo_sin_Fondo.png"
                            alt="Pricofy Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                        {/* Bandera del idioma a la derecha */}
                        <div className="flex-shrink-0">
                          <LanguageSelector />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* En Compras, no mostrar evaluaciones - solo se muestran los anuncios de búsqueda directa */}
                  {filtroActivo === 'comprar' ? null : filtroActivo === 'favoritos' ? (
                    // Sección de Favoritos (igual que en Dashboard)
                    (() => {
                      const favoritosList = evaluaciones.filter(e =>
                        favoritos.has(e.id) &&
                        !archivadas.has(e.id) &&
                        (!busquedaTexto.trim() ||
                         e.producto.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                         e.categoria.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                         e.ubicacion.toLowerCase().includes(busquedaTexto.toLowerCase()))
                      )
                      
                      // Separar búsquedas de compra y venta
                      const favoritosBusquedas = favoritosList.filter(e => esAccionComprar(e.accion))
                      const favoritosVentas = favoritosList.filter(e => esAccionVender(e.accion))
                      
                      // Obtener todos los anuncios favoritos de todas las búsquedas
                      const todosLosAnuncios: any[] = []
                      const urlsAnuncios = new Set<string>()
                      evaluaciones.forEach(evaluacion => {
                        if (evaluacion.scraping?.totalResultadosScrapping) {
                          const resultados = Array.isArray(evaluacion.scraping.totalResultadosScrapping)
                            ? evaluacion.scraping.totalResultadosScrapping
                            : evaluacion.scraping.totalResultadosScrapping.compradores || []
                          resultados.forEach((anuncio: any) => {
                            if (
                              anuncio.url_anuncio &&
                              anunciosFavoritos.has(anuncio.url_anuncio) &&
                              !urlsAnuncios.has(anuncio.url_anuncio)
                            ) {
                              todosLosAnuncios.push(anuncio)
                              urlsAnuncios.add(anuncio.url_anuncio)
                            }
                          })
                        }
                        if (evaluacion.scraping?.jsonCompradores) {
                          const compradores = Array.isArray(evaluacion.scraping.jsonCompradores)
                            ? evaluacion.scraping.jsonCompradores
                            : evaluacion.scraping.jsonCompradores.compradores || []
                          compradores.forEach((anuncio: any) => {
                            if (
                              anuncio.url_anuncio &&
                              anunciosFavoritos.has(anuncio.url_anuncio) &&
                              !urlsAnuncios.has(anuncio.url_anuncio)
                            ) {
                              todosLosAnuncios.push(anuncio)
                              urlsAnuncios.add(anuncio.url_anuncio)
                            }
                          })
                        }
                      })
                      
                      // Filtrar anuncios favoritos por búsqueda si hay texto
                      const anunciosFavoritosFiltrados = busquedaTexto.trim()
                        ? todosLosAnuncios.filter(anuncio =>
                            anuncio.titulo?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                            anuncio.descripcion?.toLowerCase().includes(busquedaTexto.toLowerCase())
                          )
                        : todosLosAnuncios
                      
                      return (
                        <div className="mb-8">
                          {/* Switch con 3 botones: Búsquedas, Anuncios, Ventas - Ocupa todo el ancho */}
                          <div className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1 w-full mb-4">
                            <button
                              onClick={() => setTipoFavoritos('busquedas')}
                              className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                                tipoFavoritos === 'busquedas'
                                  ? 'bg-purple-600 text-white shadow-md transform scale-105'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {language === 'es' ? 'Búsquedas' : 'Searches'}
                            </button>
                            <button
                              onClick={() => setTipoFavoritos('anuncios')}
                              className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                                tipoFavoritos === 'anuncios'
                                  ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {language === 'es' ? 'Anuncios' : 'Listings'}
                            </button>
                            <button
                              onClick={() => setTipoFavoritos('ventas')}
                              className={`flex-1 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                                tipoFavoritos === 'ventas'
                                  ? 'bg-green-600 text-white shadow-md transform scale-105'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {language === 'es' ? 'Ventas' : 'Sales'}
                            </button>
                          </div>
                          {tipoFavoritos === 'busquedas' ? (
                            // Mostrar búsquedas favoritas (solo compras)
                            favoritosBusquedas.length > 0 ? (
                              <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                                <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                                  {favoritosBusquedas.map((evaluacion) => {
                                    const esFavorito = favoritos.has(evaluacion.id)
                                    const esComprar = esAccionComprar(evaluacion.accion)
                                    const esVender = esAccionVender(evaluacion.accion)
                                    const tieneScraping = evaluacion.scraping !== null
                                    const evaluationId = evaluacion.scraping?.id || evaluacion.id
                                    return (
                                      <Link
                                        key={evaluacion.id}
                                        href={`/dashboard/evaluation/${evaluationId}`}
                                        className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                          !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                        }`}
                                      >
                                        <div className="flex items-start gap-2 mb-2">
                                          {esComprar && evaluacion.scraping?.tipoBusqueda === 'directa' ? (
                                            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                          ) : esComprar && evaluacion.scraping?.tipoBusqueda === 'completa' ? (
                                            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                          ) : null}
                                          <h4 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2">
                                            {evaluacion.producto}
                                          </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                          {formatDateShort(evaluacion.fecha)}
                                        </p>
                                        <div className="mt-2">
                                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            esComprar ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'
                                          }`}>
                                            {esComprar ? (language === 'es' ? 'Compra' : 'Buy') : (language === 'es' ? 'Venta' : 'Sell')}
                                          </span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggleFavorito(evaluacion.id)
                                          }}
                                          className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center z-20"
                                        >
                                          <svg
                                            className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                            fill={esFavorito ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                          </svg>
                                        </button>
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <p className="text-gray-600 text-center">
                                  {language === 'es' ? 'No existe ningún Favorito para mostrar' : 'No favorites in the list'}
                                </p>
                              </div>
                            )
                          ) : tipoFavoritos === 'anuncios' ? (
                            // Mostrar anuncios favoritos
                            anunciosFavoritosFiltrados.length > 0 ? (
                              <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                                <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                                  {anunciosFavoritosFiltrados.map((anuncio, index) => {
                                    const esFavoritoAnuncio = anuncio.url_anuncio ? anunciosFavoritos.has(anuncio.url_anuncio) : false
                                    return (
                                      <div
                                        key={anuncio.url_anuncio || index}
                                        onClick={() => setAnuncioModal(anuncio)}
                                        className="relative flex items-start gap-3 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex-shrink-0 w-64 p-4 cursor-pointer"
                                      >
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                          {anuncio.product_image ? (
                                            <img
                                              src={anuncio.product_image}
                                              alt={anuncio.titulo || 'Anuncio'}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                            {anuncio.titulo || 'Sin título'}
                                          </h4>
                                          <p className="text-base font-bold text-primary-600 mt-2">
                                            {anuncio.precio_eur ? `${anuncio.precio_eur.toFixed(2)}€` : 'N/A'}
                                          </p>
                                          {anuncio.plataforma && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                              <img
                                                src={anuncio.plataforma?.toLowerCase() === 'wallapop' ? '/images/wallapop.png' : '/images/milanuncios.png'}
                                                alt={anuncio.plataforma}
                                                className="h-4 w-auto"
                                              />
                                              <span className="truncate">{anuncio.plataforma}</span>
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            if (anuncio.url_anuncio) {
                                              toggleAnuncioFavorito(anuncio.url_anuncio)
                                            }
                                          }}
                                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-20"
                                          title={esFavoritoAnuncio
                                            ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                                            : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                                          aria-label={esFavoritoAnuncio
                                            ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites')
                                            : (language === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                                        >
                                          <svg
                                            className={`w-5 h-5 ${esFavoritoAnuncio ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                            fill={esFavoritoAnuncio ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                          </svg>
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <p className="text-gray-600 text-center">
                                  {language === 'es' ? 'No hay anuncios favoritos para mostrar' : 'No favorite listings to show'}
                                </p>
                              </div>
                            )
                          ) : (
                            // Mostrar ventas favoritas
                            favoritosVentas.length > 0 ? (
                              <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:overflow-x-visible md:-mx-0 md:px-0">
                                <div className="flex gap-4 w-max md:w-full md:flex-wrap">
                                  {favoritosVentas.map((evaluacion) => {
                                    const esFavorito = favoritos.has(evaluacion.id)
                                    const esVender = esAccionVender(evaluacion.accion)
                                    const tieneScraping = evaluacion.scraping !== null
                                    const evaluationId = evaluacion.scraping?.id || evaluacion.id
                                    return (
                                      <Link
                                        key={evaluacion.id}
                                        href={`/dashboard/evaluation/${evaluationId}`}
                                        className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 relative flex-shrink-0 w-64 p-4 cursor-pointer ${
                                          !tieneScraping ? 'opacity-50 animate-pulse' : ''
                                        }`}
                                      >
                                        <div className="flex items-start gap-2 mb-2">
                                          <h4 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2">
                                            {evaluacion.producto}
                                          </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                          {formatDateShort(evaluacion.fecha)}
                                        </p>
                                        <div className="mt-2">
                                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                                            {language === 'es' ? 'Venta' : 'Sell'}
                                          </span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggleFavorito(evaluacion.id)
                                          }}
                                          className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center z-20"
                                        >
                                          <svg
                                            className={`w-6 h-6 ${esFavorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                            fill={esFavorito ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                          </svg>
                                        </button>
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <p className="text-gray-600 text-center">
                                  {language === 'es' ? 'No hay ventas favoritas para mostrar' : 'No favorite sales to show'}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )
                    })()
                  ) : (
                    evaluacionesParaLista.length === 0 && anunciosBusquedaDirecta.length === 0 ? (
                    // Mensaje específico para Ventas cuando no hay búsquedas
                    filtroActivo === 'vender' ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div>
                          {/* <p className="text-gray-600 mb-4">
                            {language === 'es' 
                              ? 'Nada que mostrar por aquí' 
                              : 'Nothing to show here'}
                              
                          </p> */}
                          <div className="mb-4">
                            <img 
                              src="/images/nada_mostrar_venta.png" 
                              alt={language === 'es' ? 'Venta' : 'Sell'}
                              className="w-28 h-28 mx-auto object-contain"
                            />
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto">
                            <p>
                              {language === 'es' 
                                ? 'Solo tienes que decirnos lo que quieres vender, y nosotros analizamos el mercado para que decidas el precio perfecto.'
                                : 'Just tell us what you want to sell, and we\'ll analyze the market so you can decide the perfect price.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : filtroActivo === 'favoritos' ? (
                      // Mensaje específico para Favoritos cuando no hay favoritos
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div>
                          <p className="text-gray-600 mb-4">
                            {language === 'es' 
                              ? 'Aún no existen favoritos' 
                              : 'No favorites yet'}
                          </p>
                          <div className="mb-4">
                            <img 
                              src="/images/nada_mostrar_favoritos.png" 
                              alt={language === 'es' ? 'Favoritos' : 'Favorites'}
                              className="w-28 h-28 mx-auto object-contain"
                            />
                          </div>
                          <button
                            onClick={() => router.push('/dashboard?filtro=dashboard')}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            {language === 'es' ? 'Ir al Dashboard' : 'Go to Dashboard'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mensaje genérico para otros filtros
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {evaluaciones.length === 0
                    ? (language === 'es' ? 'No hay evaluaciones' : 'No evaluations')
                    : (language === 'es' ? 'No hay evaluaciones con este filtro' : 'No evaluations with this filter')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {evaluaciones.length === 0
                    ? (language === 'es' 
                        ? 'Aún no has realizado ninguna evaluación. ¡Comienza ahora!' 
                        : 'You haven\'t made any evaluations yet. Get started now!')
                    : (language === 'es'
                        ? 'No hay evaluaciones que coincidan con el filtro seleccionado.'
                        : 'No evaluations match the selected filter.')}
                </p>
                <button
                  onClick={() => openForm()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {language === 'es' ? 'Crear Evaluación' : 'Create Evaluation'}
                </button>
              </div>
                    )
                  ) : (filtroActivo === 'vender' && vistaActivaVender === 'lista') ? (
                  /* Vista Lista - Solo Vender (Compras no muestra evaluaciones) */
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Header con gradiente y título */}
                    <div className="rounded-t-lg px-2 sm:px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600">
                      <h2 className="text-xl font-bold text-white">
                        {language === 'es' ? 'Ventas recientes' : 'Recent sales'}
                      </h2>
                    </div>
                    
                    {/* Tabla de resultados */}
                    <div className="overflow-x-auto">
                      {/* Filas */}
                      <div className="bg-white divide-y divide-gray-100">
                        {evaluacionesFiltradas.map((evaluacion) => {
                          const esFavorito = favoritos.has(evaluacion.id)
                          const estaDeslizada = fichaDeslizada === evaluacion.id
                          const offsetActual = estaDeslizada ? swipeOffset : 0
                          const tieneScraping = evaluacion.scraping !== null
                          
                          return (
                            <div key={evaluacion.id} className="relative overflow-hidden">
                              {/* Contenedor de acciones (botones que aparecen al deslizar) - Detrás de la fila */}
                              <div 
                                className="absolute right-0 top-0 bottom-0 flex z-20" 
                                style={{ 
                                  width: '160px', 
                                  margin: 0, 
                                  padding: 0,
                                  pointerEvents: estaDeslizada && offsetActual > 0 ? 'auto' : 'none'
                                }}
                              >
                                {/* Botón de más opciones (3 puntos) - Aparece gradualmente desde 0 hasta 80px */}
                                <button
                                  ref={(el) => {
                                    if (el) {
                                      botonMasRefs.current.set(evaluacion.id, el)
                                    } else {
                                      botonMasRefs.current.delete(evaluacion.id)
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    const boton = botonMasRefs.current.get(evaluacion.id)
                                    if (boton) {
                                      const rect = boton.getBoundingClientRect()
                                      setMenuPosicion({
                                        top: rect.bottom + 8,
                                        right: window.innerWidth - rect.right
                                      })
                                    }
                                    const nuevoEstado = menuAbierto === evaluacion.id ? null : evaluacion.id
                                    setMenuAbierto(nuevoEstado)
                                    if (nuevoEstado === null) {
                                      setMenuPosicion(null)
                                    }
                                    setSwipeOffset(160)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    const boton = botonMasRefs.current.get(evaluacion.id)
                                    if (boton) {
                                      const rect = boton.getBoundingClientRect()
                                      setMenuPosicion({
                                        top: rect.bottom + 8,
                                        right: window.innerWidth - rect.right
                                      })
                                    }
                                    setMenuAbierto(menuAbierto === evaluacion.id ? null : evaluacion.id)
                                    setSwipeOffset(160)
                                  }}
                                  className={`boton-mas-opciones flex flex-col items-center justify-center text-white h-full flex-shrink-0 ${
                                    filtroActivo === 'vender' ? 'bg-green-600' : 'bg-primary-600'
                                  }`}
                                  style={{
                                    width: '80px',
                                    margin: 0,
                                    padding: 0,
                                    opacity: offsetActual <= 0 ? 0 : Math.min(1, offsetActual / 80), // Aparece gradualmente de 0 a 80px
                                    pointerEvents: offsetActual > 40 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                    transition: swipeStartX === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                                  }}
                                >
                                  <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                  <span className="text-[10px]">{language === 'es' ? 'Más' : 'More'}</span>
                                </button>
                                
                                {/* Botón de eliminar (basura) - Aparece gradualmente desde 80px hasta 160px */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    eliminarEvaluacion(evaluacion.id)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    eliminarEvaluacion(evaluacion.id)
                                  }}
                                  className="bg-red-600 flex flex-col items-center justify-center text-white h-full flex-shrink-0"
                                  style={{
                                    width: '80px',
                                    margin: 0,
                                    padding: 0,
                                    borderRadius: '0 0.5rem 0.5rem 0',
                                    opacity: offsetActual <= 80 ? 0 : Math.min(1, (offsetActual - 80) / 80), // Aparece gradualmente de 80px a 160px
                                    pointerEvents: offsetActual > 120 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                    transition: swipeStartX === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                                  }}
                                >
                                  <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span className="text-[10px]">{language === 'es' ? 'Eliminar' : 'Delete'}</span>
                                </button>
                              </div>
                              
                              {/* Menú desplegable de más opciones - Renderizado como portal */}
                              {menuAbierto === evaluacion.id && menuPosicion && (
                                <>
                                  {/* Overlay para cerrar al hacer click fuera */}
                                  <div 
                                    className="fixed inset-0 z-[99]"
                                    onClick={() => {
                                      setMenuAbierto(null)
                                      setMenuPosicion(null)
                                    }}
                                  />
                                  {/* Menú */}
                                  <div 
                                    className="menu-desplegable fixed bg-white rounded-xl shadow-2xl z-[100] min-w-[220px] py-2"
                                    style={{
                                      top: `${menuPosicion.top}px`,
                                      right: `${menuPosicion.right}px`
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Por ahora no hace nada
                                        setMenuAbierto(null)
                                        setMenuPosicion(null)
                                      }}
                                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      {language === 'es' ? 'Editar' : 'Edit'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        archivarEvaluacion(evaluacion.id)
                                        setMenuPosicion(null)
                                      }}
                                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                      </svg>
                                      {language === 'es' ? 'Archivar' : 'Archive'}
                                    </button>
                                  </div>
                                </>
                              )}
                              
                              {/* Fila principal - Se desliza sobre los botones */}
                              <div 
                                className={`grid grid-cols-[1fr_48px_100px] items-center bg-white relative z-10 min-h-[32px] ${
                                  tieneScraping && evaluacion.scraping 
                                    ? 'hover:bg-gray-50 cursor-pointer' 
                                    : 'cursor-default opacity-50 animate-pulse'
                                }`}
                                style={{
                                  transform: `translateX(-${offsetActual}px)`,
                                  transition: swipeStartX === null ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                                  pointerEvents: 'auto' // Siempre permitir eventos para poder hacer swipe y cerrar
                                }}
                                onTouchStart={(e) => handleTouchStart(e, evaluacion.id)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={(e) => handleTouchEnd(e)}
                                onClick={(e) => {
                                  // Si está deslizada, no navegar (permitir clicks en botones)
                                  if (estaDeslizada && offsetActual > 0) {
                                    return
                                  }
                                  // Verificar que no se hizo click en un botón de acción
                                  const target = e.target as HTMLElement
                                  // Si el click fue en el botón del corazón, no navegar
                                  if (target.closest('.boton-favorito')) {
                                    return // El botón del corazón ya maneja su propio click con stopPropagation
                                  }
                                  // Si el click fue en los botones de acción (Más o Eliminar), no navegar
                                  if (target.closest('.boton-mas-opciones') || target.closest('.bg-primary-600') || target.closest('.bg-red-600')) {
                                    return
                                  }
                                  // Navegar al detalle solo si hay scraping disponible (igual que el botón "Ver detalles")
                                  if (tieneScraping && evaluacion.scraping) {
                                    router.push(`/dashboard/evaluation/${evaluacion.scraping.id}`)
                                  }
                                }}
                              >
                                {/* Columna Título */}
                                <div className="px-2 sm:px-4 py-0.5 flex items-center min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate w-full">
                                    {evaluacion.producto}
                                  </div>
                                </div>
                                
                                {/* Columna Corazón */}
                                <div className="px-2 sm:px-4 pr-1 py-0.5 whitespace-nowrap text-center flex items-center justify-center flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      toggleFavorito(evaluacion.id)
                                    }}
                                    className="boton-favorito p-2 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center z-20"
                                  >
                                    {esFavorito ? (
                                      <svg className="w-5 h-5 md:w-4 md:h-4 text-red-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 md:w-4 md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                                
                                {/* Columna Píldora - Compra o Venta */}
                                <div className="px-2 sm:px-4 pl-1 py-0.5 whitespace-nowrap flex items-center justify-center flex-shrink-0">
                                  {filtroActivo === 'vender' ? (
                                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-600 text-white">
                                      {language === 'es' ? 'Venta' : 'Sell'}
                                    </span>
                                  ) : evaluacion.scraping?.tipoBusqueda ? (
                                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-primary-600 text-white">
                                      {language === 'es' ? 'Compra' : 'Buy'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Vista Fichas */
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {evaluacionesFiltradas.map((evaluacion) => {
                      const precioMinimo = calcularPrecioMinimo(evaluacion)
                      const preciosVendedores = obtenerPreciosVendedores(evaluacion)
                      const tieneScraping = evaluacion.scraping !== null
                      const estaExpandida = fichaExpandida === evaluacion.id
                      const esVender = filtroActivo === 'vender' || esAccionVender(evaluacion.accion)
                      
                      const estaDeslizada = fichaDeslizada === evaluacion.id
                      const offsetActual = estaDeslizada ? swipeOffset : 0
                      
                      return (
                        <div className="relative overflow-hidden rounded-xl">
                          {/* Contenedor de acciones (botones que aparecen al deslizar) - Detrás de la ficha */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 flex rounded-r-xl overflow-hidden z-20"
                            style={{
                              width: '160px',
                              pointerEvents: estaDeslizada && offsetActual > 0 ? 'auto' : 'none'
                            }}
                          >
                            {/* Botón de más opciones (3 puntos) - Aparece gradualmente desde 0 hasta 80px */}
                            <div className="relative">
                              <button
                                ref={(el) => {
                                  if (el) {
                                    botonMasRefs.current.set(evaluacion.id, el)
                                  } else {
                                    botonMasRefs.current.delete(evaluacion.id)
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  const boton = botonMasRefs.current.get(evaluacion.id)
                                  if (boton) {
                                    const rect = boton.getBoundingClientRect()
                                    setMenuPosicion({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right
                                    })
                                  }
                                  const nuevoEstado = menuAbierto === evaluacion.id ? null : evaluacion.id
                                  setMenuAbierto(nuevoEstado)
                                  if (nuevoEstado === null) {
                                    setMenuPosicion(null)
                                  }
                                  setSwipeOffset(160) // Mantener el swipe abierto completamente
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  const boton = botonMasRefs.current.get(evaluacion.id)
                                  if (boton) {
                                    const rect = boton.getBoundingClientRect()
                                    setMenuPosicion({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right
                                    })
                                  }
                                  setMenuAbierto(menuAbierto === evaluacion.id ? null : evaluacion.id)
                                  setSwipeOffset(160) // Mantener el swipe abierto completamente
                                }}
                                className="boton-mas-opciones w-20 bg-primary-600 flex flex-col items-center justify-center text-white h-full"
                                style={{
                                  opacity: offsetActual <= 0 ? 0 : Math.min(1, offsetActual / 80), // Aparece gradualmente de 0 a 80px
                                  pointerEvents: offsetActual > 40 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                  transition: swipeStartX === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                                }}
                              >
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                <span className="text-xs">{language === 'es' ? 'Más' : 'More'}</span>
                              </button>
                            </div>
                            
                            {/* Botón de eliminar (basura) - Aparece gradualmente desde 80px hasta 160px */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                eliminarEvaluacion(evaluacion.id)
                              }}
                              onTouchEnd={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                eliminarEvaluacion(evaluacion.id)
                              }}
                              className="w-20 bg-red-600 flex flex-col items-center justify-center text-white rounded-r-xl"
                              style={{
                                opacity: offsetActual <= 80 ? 0 : Math.min(1, (offsetActual - 80) / 80), // Aparece gradualmente de 80px a 160px
                                pointerEvents: offsetActual > 120 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                transition: swipeStartX === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                              }}
                            >
                              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-xs">{language === 'es' ? 'Eliminar' : 'Delete'}</span>
                            </button>
                          </div>
                          
                          {/* Menú desplegable de más opciones - Renderizado como portal */}
                          {menuAbierto === evaluacion.id && menuPosicion && (
                            <>
                              {/* Overlay para cerrar al hacer click fuera */}
                              <div 
                                className="fixed inset-0 z-[99]"
                                onClick={() => {
                                  setMenuAbierto(null)
                                  setMenuPosicion(null)
                                }}
                              />
                              {/* Menú */}
                              <div 
                                className="menu-desplegable fixed bg-white rounded-xl shadow-2xl z-[100] min-w-[220px] py-2"
                                style={{
                                  top: `${menuPosicion.top}px`,
                                  right: `${menuPosicion.right}px`
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Por ahora no hace nada
                                    setMenuAbierto(null)
                                    setMenuPosicion(null)
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {language === 'es' ? 'Editar' : 'Edit'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    archivarEvaluacion(evaluacion.id)
                                    setMenuAbiertoAvanzadas(null)
                                    setMenuPosicionAvanzadas(null)
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  {language === 'es' ? 'Archivar' : 'Archive'}
                                </button>
                              </div>
                          </>
                          )}
                          
                          {/* Ficha principal - Se desliza sobre los botones */}
                          <div
                            key={evaluacion.id}
                            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer md:cursor-default relative z-10 ${
                              estaExpandida ? 'md:shadow-xl' : ''
                            } ${
                              !tieneScraping ? 'opacity-50 animate-pulse' : ''
                            }`}
                            style={{
                              transform: `translateX(-${offsetActual}px)`,
                              transition: swipeStartX === null ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                              pointerEvents: 'auto' // Siempre permitir eventos para poder hacer swipe y cerrar
                            }}
                            onTouchStart={(e) => handleTouchStart(e, evaluacion.id)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onClick={(e) => {
                              // Si la ficha está deslizada, no procesar clicks en la ficha
                              if (estaDeslizada && offsetActual > 0) {
                                return
                              }
                              
                              // Verificar si el click fue en un enlace o botón
                              const target = e.target as HTMLElement
                              if (target.closest('a') || target.closest('button') || target.closest('.boton-mas-opciones')) {
                                return // No expandir si se clickeó en un enlace o botón
                              }
                              // Solo expandir en móvil (usando media query de Tailwind)
                              if (window.innerWidth < 768) {
                                // Cerrar tooltips cuando se hace click en la ficha
                                setTooltipVisible(null)
                                setFichaExpandida(estaExpandida ? null : evaluacion.id)
                              }
                            }}
                          >
                      <div className="p-2 md:p-3">
                        {/* Versión compacta para móvil - Siempre visible */}
                        <div className="md:hidden">
                          {/* Header con producto y botón de acción */}
                          <div className={`flex ${filtroActivo === 'comprar' && evaluacion.scraping?.tipoBusqueda === 'directa' ? 'items-center' : 'items-start'} justify-between mb-1.5`}>
                            <div className="flex items-center gap-2 flex-1 pr-2">
                              {/* Icono de búsqueda (lupa o varita mágica) según el tipo de búsqueda - Solo en Comprar */}
                              {filtroActivo === 'comprar' && evaluacion.scraping?.tipoBusqueda && (
                                <div className="flex-shrink-0">
                                  {evaluacion.scraping.tipoBusqueda === 'directa' ? (
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              <h3 className="text-base font-bold text-gray-900">
                                {evaluacion.producto}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Botón del corazón - Justo a la izquierda de la píldora */}
                              {(filtroActivo === 'comprar' || esVender) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorito(evaluacion.id)
                                  }}
                                  className="p-2.5 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                                  aria-label={favoritos.has(evaluacion.id) ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites') : (language === 'es' ? 'Agregar a favoritos' : 'Add to favorites')}
                                >
                                  <svg 
                                    className={`w-6 h-6 md:w-5 md:h-5 transition-colors ${
                                      favoritos.has(evaluacion.id) 
                                        ? 'text-red-500 fill-red-500' 
                                        : 'text-gray-400 hover:text-red-400'
                                    }`}
                                    fill={favoritos.has(evaluacion.id) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              )}
                              {evaluacion.accion && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                                  esAccionVender(evaluacion.accion)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary-600 text-white'
                                }`}>
                                  {esAccionVender(evaluacion.accion)
                                    ? (language === 'es' ? 'Venta' : 'Sell')
                                    : (language === 'es' ? 'Compra' : 'Buy')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Métricas según el tipo de acción - Solo precio principal cuando está colapsada */}
                          {tieneScraping && esVender && preciosVendedores.ideal !== null ? (
                            /* Precio ideal recomendado para Vender (siempre visible) */
                            <div>
                              <div className="flex items-center gap-1 mb-0.5">
                                <p className="text-xs text-gray-600">
                                  {language === 'es' ? 'Precio ideal recomendado' : 'Recommended ideal price'}
                                </p>
                                <div className="group relative">
                                  <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                    <span className="text-base font-great-vibes text-gray-600">i</span>
                                  </div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    {language === 'es' 
                                      ? 'Precio de venta alineado al precio de mercado actual'
                                      : 'Sale price aligned with current market price'}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xl md:text-2xl font-bold text-green-600">
                                {Math.round(preciosVendedores.ideal)}€
                              </p>
                            </div>
                          ) : tieneScraping && !esVender && precioMinimo !== null ? (
                            /* Precio mínimo para Comprar */
                            <div>
                              <p className="text-xs text-gray-600 mb-0.5">
                                {language === 'es' ? 'Precio mínimo recomendado' : 'Recommended minimum price'}
                              </p>
                              <p className="text-xl md:text-2xl font-bold text-gray-900">
                                {Math.round(precioMinimo)}€
                              </p>
                            </div>
                          ) : null}
                          
                          {/* Análisis en curso - Solo si no hay scraping */}
                          {!tieneScraping && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-1.5">
                              <h4 className="text-xs font-bold text-green-900 mb-0.5">
                                {language === 'es' ? 'Análisis en curso' : 'Analysis in progress'}
                              </h4>
                              <p className="text-xs text-green-800">
                                {language === 'es' 
                                  ? 'El analisis se encuentra en cúrso, por favor espere a que finalice'
                                  : 'The analysis is in progress, please wait for it to finish'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Contenido expandido - Solo visible en móvil cuando está expandida */}
                        {estaExpandida && (
                          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                            {/* Precio mínimo y rápido para Vender - Solo cuando está expandida */}
                            {tieneScraping && esVender && preciosVendedores.ideal !== null && (
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                {preciosVendedores.minimo !== null && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <p className="text-xs text-gray-600">
                                        {language === 'es' ? 'Precio mínimo' : 'Minimum price'}
                                      </p>
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setTooltipVisible(tooltipVisible === 'minimo' ? null : 'minimo')
                                          }}
                                          className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center cursor-help"
                                        >
                                          <span className="text-base font-great-vibes text-gray-600">i</span>
                                        </button>
                                        {tooltipVisible === 'minimo' && (
                                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-50">
                                            {language === 'es' 
                                              ? 'Estrategia agresiva, precio por debajo del más barato del mercado'
                                              : 'Aggressive strategy, price below the cheapest in the market'}
                                            <div className="absolute top-full left-4 -mt-1">
                                              <div className="border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {Math.round(preciosVendedores.minimo)}€
                                    </p>
                                  </div>
                                )}
                                {preciosVendedores.rapido !== null && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <p className="text-xs text-gray-600">
                                        {language === 'es' ? 'Precio rápido' : 'Quick price'}
                                      </p>
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setTooltipVisible(tooltipVisible === 'rapido' ? null : 'rapido')
                                          }}
                                          className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center cursor-help"
                                        >
                                          <span className="text-base font-great-vibes text-gray-600">i</span>
                                        </button>
                                        {tooltipVisible === 'rapido' && (
                                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-50">
                                            {language === 'es' 
                                              ? 'Precio orientado a venta ágil sin asumir riesgos'
                                              : 'Price oriented to quick sale without taking risks'}
                                            <div className="absolute top-full right-4 -mt-1">
                                              <div className="border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {Math.round(preciosVendedores.rapido)}€
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Categoría */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>{evaluacion.categoria || 'N/A'}</span>
                            </div>
                            
                            {/* Fecha */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(evaluacion.fecha)}</span>
                            </div>

                            {/* Botón ver detalles */}
                            {tieneScraping && evaluacion.scraping && (
                              <a
                                href={`/dashboard/evaluation/${evaluacion.scraping.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-center font-semibold hover:bg-primary-700 transition-colors"
                              >
                                {language === 'es' ? 'Ver detalles' : 'View details'}
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Versión completa para desktop - Siempre visible */}
                        <div className="hidden md:block">
                          {/* Header con producto y botón de acción */}
                          <div className={`flex ${filtroActivo === 'comprar' && evaluacion.scraping?.tipoBusqueda === 'directa' ? 'items-center' : 'items-start'} justify-between mb-2`}>
                            <div className="flex items-center gap-2 flex-1 pr-2">
                              {/* Icono de búsqueda (lupa o varita mágica) según el tipo de búsqueda - Solo en Comprar */}
                              {filtroActivo === 'comprar' && evaluacion.scraping?.tipoBusqueda && (
                                <div className="flex-shrink-0">
                                  {evaluacion.scraping.tipoBusqueda === 'directa' ? (
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              <h3 className="text-base font-bold text-gray-900">
                                {evaluacion.producto}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Botón del corazón - Justo a la izquierda de la píldora */}
                              {(filtroActivo === 'comprar' || esVender) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleFavorito(evaluacion.id)
                                  }}
                                  className="p-2.5 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                                  aria-label={favoritos.has(evaluacion.id) ? (language === 'es' ? 'Quitar de favoritos' : 'Remove from favorites') : (language === 'es' ? 'Agregar a favoritos' : 'Add to favorites')}
                                >
                                  <svg 
                                    className={`w-6 h-6 md:w-5 md:h-5 transition-colors ${
                                      favoritos.has(evaluacion.id) 
                                        ? 'text-red-500 fill-red-500' 
                                        : 'text-gray-400 hover:text-red-400'
                                    }`}
                                    fill={favoritos.has(evaluacion.id) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              )}
                              {evaluacion.accion && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                                  esAccionVender(evaluacion.accion)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary-600 text-white'
                                }`}>
                                  {esAccionVender(evaluacion.accion)
                                    ? (language === 'es' ? 'Venta' : 'Sell')
                                    : (language === 'es' ? 'Compra' : 'Buy')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Categoría */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>{evaluacion.categoria || 'N/A'}</span>
                          </div>
                          
                          {/* Fecha */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(evaluacion.fecha)}</span>
                          </div>

                          {/* Contenido según estado */}
                          {!tieneScraping ? (
                            /* Análisis en curso */
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                              <h4 className="text-sm font-bold text-green-900 mb-0.5">
                                {language === 'es' ? 'Análisis en curso' : 'Analysis in progress'}
                              </h4>
                              <p className="text-xs text-green-800">
                                {language === 'es' 
                                  ? 'El analisis se encuentra en cúrso, por favor espere a que finalice'
                                  : 'The analysis is in progress, please wait for it to finish'}
                              </p>
                            </div>
                          ) : esVender && preciosVendedores.ideal !== null ? (
                            /* Precio ideal recomendado para Vender (siempre visible en desktop) */
                            <div className="mb-2">
                              <div className="flex items-center gap-1 mb-0.5">
                                <p className="text-sm text-gray-600">
                                  {language === 'es' ? 'Precio ideal recomendado' : 'Recommended ideal price'}
                                </p>
                                <div className="group relative">
                                  <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                    <span className="text-lg font-great-vibes text-gray-600">i</span>
                                  </div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    {language === 'es' 
                                      ? 'Precio de venta alineado al precio de mercado actual'
                                      : 'Sale price aligned with current market price'}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-3xl font-bold text-green-700">
                                {Math.round(preciosVendedores.ideal)}€
                              </p>
                            </div>
                          ) : !esVender && precioMinimo !== null ? (
                            /* Precio mínimo para Comprar */
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">
                                {language === 'es' ? 'Precio mínimo recomendado' : 'Recommended minimum price'}
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                {Math.round(precioMinimo)}€
                              </p>
                            </div>
                          ) : null}
                          
                          {/* Precio mínimo y rápido para Vender - Solo en desktop (siempre visible) */}
                          {tieneScraping && esVender && preciosVendedores.ideal !== null && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {preciosVendedores.minimo !== null && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-1 mb-1">
                                    <p className="text-xs text-gray-600">
                                      {language === 'es' ? 'Precio mínimo' : 'Minimum price'}
                                    </p>
                                    <div className="group relative">
                                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                        <span className="text-xs font-great-vibes text-gray-600">i</span>
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        {language === 'es' 
                                          ? 'Estrategia agresiva, precio por debajo del más barato del mercado'
                                          : 'Aggressive strategy, price below the cheapest in the market'}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                          <div className="border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xl font-semibold text-gray-900">
                                    {Math.round(preciosVendedores.minimo)}€
                                  </p>
                                </div>
                              )}
                              {preciosVendedores.rapido !== null && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-1 mb-1">
                                    <p className="text-xs text-gray-600">
                                      {language === 'es' ? 'Precio rápido' : 'Quick price'}
                                    </p>
                                    <div className="group relative">
                                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                        <span className="text-xs font-great-vibes text-gray-600">i</span>
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        {language === 'es' 
                                          ? 'Precio orientado a venta ágil sin asumir riesgos'
                                          : 'Price oriented to quick sale without taking risks'}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                          <div className="border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xl font-semibold text-gray-900">
                                    {Math.round(preciosVendedores.rapido)}€
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botón ver detalles */}
                          {tieneScraping && evaluacion.scraping && (
                            <a
                              href={`/dashboard/evaluation/${evaluacion.scraping.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-center font-semibold hover:bg-primary-700 transition-colors"
                            >
                              {language === 'es' ? 'Ver detalles' : 'View details'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                        </div>
                      )
                    })}
                  </div>
                )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior - Solo visible en móvil */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]" 
        style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          transform: 'translateZ(0)', // Forzar aceleración por hardware
          backfaceVisibility: 'hidden', // Prevenir parpadeos
        }}
      >
        <div className="flex items-center justify-around h-16">
          {/* Dashboard */}
          <button
            onClick={() => setFiltroActivo('dashboard')}
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
            onClick={() => setFiltroActivo('comprar')}
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
            onClick={() => setFiltroActivo('vender')}
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
            onClick={() => setFiltroActivo('favoritos')}
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

      {/* Panel de Búsqueda Inteligente - Se desliza desde la izquierda */}
      {panelBusquedaAvanzadaAbierto && (
        <>
          {/* Overlay oscuro */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-500 ${
              panelCerrandose ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={cerrarPanel}
          />
          
          {/* Panel que se desliza desde la izquierda */}
          <div 
            className={`fixed inset-y-0 left-0 right-0 bg-white z-[9999] transform transition-transform duration-500 ease-out ${
              panelCerrandose ? '-translate-x-full' : 'translate-x-0'
            }`}
            style={!panelCerrandose ? {
              animation: 'slideIn 0.5s ease-out'
            } : {}}
          >
            <div className="h-full flex flex-col">
              {/* Header del panel */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shadow-lg">
                <h2 className="text-xl font-bold text-white">
                  {language === 'es' ? 'Búsqueda Inteligente' : 'Smart Search'}
                </h2>
                <button
                  onClick={cerrarPanel}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del panel */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Barra de búsqueda con botón de barita */}
                <div className="mb-6">
                  <div className="relative flex items-stretch border border-purple-500 rounded-full overflow-hidden shadow-md">
                    <div className="relative flex-1 flex items-center min-w-0">
                      <input
                        type="text"
                        value={busquedaTextoPanel}
                        onChange={(e) => setBusquedaTextoPanel(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleBuscarDesdePanel()
                          }
                        }}
                        onFocus={() => {
                          if (sugerenciasBusquedaPanel.length > 0) {
                            setMostrarSugerenciasBusquedaPanel(true)
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setMostrarSugerenciasBusquedaPanel(false), 200)
                        }}
                        placeholder={language === 'es' ? '¿Qué estás buscando?' : 'What are you looking for?'}
                        disabled={buscandoCompleto}
                        className="w-full pl-4 pr-14 py-3 focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-xs"
                        style={{ 
                          fontSize: '16px',
                          lineHeight: '1.5'
                        }}
                      />
                      {/* Botón de barita a la derecha */}
                      <button
                        onClick={handleBuscarDesdePanel}
                        disabled={!busquedaTextoPanel.trim() || buscandoCompleto}
                        className="absolute right-2 flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 flex-shrink-0"
                      >
                        {buscandoCompleto ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                      </button>
                      {mostrarSugerenciasBusquedaPanel && sugerenciasBusquedaPanel.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {sugerenciasBusquedaPanel.map((sugerencia, index) => (
                            <button
                              key={`${sugerencia}-${index}`}
                              type="button"
                              onClick={() => {
                                setBusquedaTextoPanel(sugerencia)
                                setMostrarSugerenciasBusquedaPanel(false)
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                            >
                              {sugerencia}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección de Búsquedas Inteligentes - Histórico */}
                <div className="mb-6">
                  <button
                    onClick={() => setHistoricoColapsado(!historicoColapsado)}
                    className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'es' ? 'Búsquedas Inteligentes' : 'Smart searches'}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        historicoColapsado ? '' : 'rotate-180'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {!historicoColapsado && busquedasAvanzadas.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {busquedasAvanzadas.map((evaluacion) => {
                        const evaluationId = evaluacion.scraping?.id || evaluacion.id
                        const estaDeslizada = fichaDeslizadaAvanzadas === evaluacion.id
                        const offsetActual = estaDeslizada ? swipeOffsetAvanzadas : 0
                        return (
                          <div
                            key={evaluacion.id}
                            className="relative overflow-hidden"
                            onTouchStart={(e) => handleTouchStartAvanzadas(e, evaluacion.id)}
                            onTouchMove={handleTouchMoveAvanzadas}
                            onTouchEnd={handleTouchEndAvanzadas}
                          >
                            {/* Contenedor de acciones (botones que aparecen al deslizar) - Detrás de la fila */}
                            <div 
                              className="absolute right-0 top-0 bottom-0 flex z-20" 
                              style={{ 
                                width: '160px', 
                                margin: 0, 
                                padding: 0,
                                pointerEvents: estaDeslizada && offsetActual > 0 ? 'auto' : 'none'
                              }}
                            >
                              {/* Botón de más opciones (3 puntos) - Aparece gradualmente desde 0 hasta 80px */}
                              <button
                                ref={(el) => {
                                  if (el) {
                                    botonMasRefsAvanzadas.current.set(evaluacion.id, el)
                                  } else {
                                    botonMasRefsAvanzadas.current.delete(evaluacion.id)
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  const boton = botonMasRefsAvanzadas.current.get(evaluacion.id)
                                  if (boton) {
                                    const rect = boton.getBoundingClientRect()
                                    setMenuPosicionAvanzadas({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right
                                    })
                                  }
                                  const nuevoEstado = menuAbiertoAvanzadas === evaluacion.id ? null : evaluacion.id
                                  setMenuAbiertoAvanzadas(nuevoEstado)
                                  if (nuevoEstado === null) {
                                    setMenuPosicionAvanzadas(null)
                                  }
                                  setSwipeOffsetAvanzadas(160)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  const boton = botonMasRefsAvanzadas.current.get(evaluacion.id)
                                  if (boton) {
                                    const rect = boton.getBoundingClientRect()
                                    setMenuPosicionAvanzadas({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right
                                    })
                                  }
                                  setMenuAbiertoAvanzadas(menuAbiertoAvanzadas === evaluacion.id ? null : evaluacion.id)
                                  setSwipeOffsetAvanzadas(160)
                                }}
                                className="boton-mas-opciones flex flex-col items-center justify-center text-white h-full flex-shrink-0 bg-primary-600"
                                style={{
                                  width: '80px',
                                  margin: 0,
                                  padding: 0,
                                  opacity: offsetActual <= 0 ? 0 : Math.min(1, offsetActual / 80), // Aparece gradualmente de 0 a 80px
                                  pointerEvents: offsetActual > 40 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                  transition: swipeStartXAvanzadas === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                                }}
                              >
                                <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                <span className="text-[10px]">{language === 'es' ? 'Más' : 'More'}</span>
                              </button>
                              
                              {/* Botón de eliminar (basura) - Aparece gradualmente desde 80px hasta 160px */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  eliminarEvaluacion(evaluacion.id)
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  eliminarEvaluacion(evaluacion.id)
                                }}
                                className="bg-red-600 flex flex-col items-center justify-center text-white h-full flex-shrink-0"
                                style={{
                                  width: '80px',
                                  margin: 0,
                                  padding: 0,
                                  borderRadius: '0 0.5rem 0.5rem 0',
                                  opacity: offsetActual <= 80 ? 0 : Math.min(1, (offsetActual - 80) / 80), // Aparece gradualmente de 80px a 160px
                                  pointerEvents: offsetActual > 120 ? 'auto' : 'none', // Solo clickeable cuando está suficientemente visible
                                  transition: swipeStartXAvanzadas === null ? 'opacity 0.15s ease-out' : 'none' // Solo transición al soltar
                                }}
                              >
                                <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-[10px]">{language === 'es' ? 'Eliminar' : 'Delete'}</span>
                              </button>
                            </div>
                            
                            {/* Menú desplegable de más opciones - Renderizado como portal */}
                            {menuAbiertoAvanzadas === evaluacion.id && menuPosicionAvanzadas && (
                              <>
                                {/* Overlay para cerrar al hacer click fuera */}
                                <div 
                                  className="fixed inset-0 z-[99]"
                                  onClick={() => {
                                    setMenuAbiertoAvanzadas(null)
                                    setMenuPosicionAvanzadas(null)
                                  }}
                                />
                                {/* Menú */}
                                <div 
                                  className="menu-desplegable fixed bg-white rounded-xl shadow-2xl z-[100] min-w-[220px] py-2"
                                  style={{
                                    top: `${menuPosicionAvanzadas.top}px`,
                                    right: `${menuPosicionAvanzadas.right}px`
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Por ahora no hace nada
                                      setMenuAbiertoAvanzadas(null)
                                      setMenuPosicionAvanzadas(null)
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {language === 'es' ? 'Editar' : 'Edit'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      archivarEvaluacion(evaluacion.id)
                                      setMenuAbiertoAvanzadas(null)
                                      setMenuPosicionAvanzadas(null)
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                  >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    {language === 'es' ? 'Archivar' : 'Archive'}
                                  </button>
                                </div>
                              </>
                            )}
                            
                            {/* Link principal (delante) - Se desliza sobre los botones */}
                            <Link
                              href={`/dashboard/evaluation/${evaluationId}?filtro=comprar`}
                              className="block px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all bg-white relative z-10"
                              style={{
                                transform: `translateX(-${offsetActual}px)`,
                                transition: swipeStartXAvanzadas === null ? 'transform 0.15s ease-out' : 'none'
                              }}
                              onClick={(e) => {
                                if (offsetActual > 10) {
                                  e.preventDefault()
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {evaluacion.producto}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDateShort(evaluacion.fecha)}
                                  </p>
                                </div>
                              </div>
                            </Link>
    </div>
  )
                      })}
                    </div>
                  )}

                  {/* Resultado de búsqueda o mensaje amigable */}
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    {resultadoBusquedaAvanzada ? (
                      <div className="text-left">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {resultadoBusquedaAvanzada.producto}
                                </h4>
                            <button
                              onClick={abrirPanelInfo}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1 flex-shrink-0"
                            >
                              <span>+ info</span>
                            </button>
                              </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {resultadoBusquedaAvanzada.categoria || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDateShort(resultadoBusquedaAvanzada.fecha)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-purple-200">
                            <Link
                              href={`/dashboard/evaluation/${resultadoBusquedaAvanzada.scraping?.id || resultadoBusquedaAvanzada.id}?filtro=comprar`}
                              className="text-sm text-purple-700 font-medium hover:text-purple-800"
                            >
                                {language === 'es' ? 'Haz clic para ver detalles' : 'Click to view details'}
                            </Link>
                            </div>
                          </div>
                      </div>
                    ) : (
                      <div>
                        {/* <p className="text-gray-600 mb-4">
                          {language === 'es' 
                            //? 'Nada que mostrar por aquí' 
                            //: 'Nothing to show here'}
                            ? '' 
                            : ''}
                        </p> */}
                        <div className="mb-4">
                          <img 
                            src="/images/nada_mostrar_busqueda_inteligente.png" 
                            alt={language === 'es' ? 'Búsqueda inteligente' : 'Smart search'}
                            className="w-28 h-28 mx-auto object-contain"
                          />
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto">
                          <p className="mb-2">
                            {language === 'es' 
                              ? 'Si nos dices qué estás buscando, Pricofy buscará en todas las plataformas de segunda mano, centrándonos en el mejor resultado para ti.'
                              : 'If you tell us what you\'re looking for, Pricofy will search all second-hand platforms, focusing on the best result for you.'}
                          </p>
                          <p className="font-bold italic">
                            {language === 'es' 
                              ? '"Porque si buscas un iPhone no quieres ver auriculares, cajas vacías, ni carcasas de Spiderman 😉"'
                              : '"Because if you\'re looking for an iPhone, you don\'t want to see headphones, empty boxes, or Spiderman cases 😉"'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Soporte */}
      {modalSoporteAbierto && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !enviandoSoporte) {
              cerrarModalSoporte()
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
                {language === 'es' ? 'Contactar con Soporte' : 'Contact Support'}
              </h2>
              <button
                onClick={cerrarModalSoporte}
                disabled={enviandoSoporte}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitSoporte} className="p-6 space-y-3">
              {/* Nombre */}
              <div className="relative">
                <label htmlFor="soporte-nombre" className="block text-sm font-medium text-gray-700 mb-1 pointer-events-none">
                  {language === 'es' ? 'Nombre' : 'Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="soporte-nombre"
                  name="nombre"
                  value={formularioSoporte.nombre}
                  onChange={handleChangeSoporte}
                  onBlur={(e) => {
                    // Forzar que el siguiente campo sea clickeable
                    setTimeout(() => {
                      const emailInput = document.getElementById('soporte-email')
                      if (emailInput) {
                        (emailInput as HTMLInputElement).style.pointerEvents = 'auto'
                      }
                    }, 10)
                  }}
                  className={`w-full px-4 py-1.5 border rounded-lg focus:border-primary-500 focus:outline-none focus:ring-0 ${
                    erroresSoporte.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ fontSize: '16px' }}
                  placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
                />
                {erroresSoporte.nombre && <p className="mt-1 text-sm text-red-500 pointer-events-none">{erroresSoporte.nombre}</p>}
              </div>

              {/* Email */}
              <div className="relative">
                <label htmlFor="soporte-email" className="block text-sm font-medium text-gray-700 mb-1 pointer-events-none">
                  {language === 'es' ? 'Email' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="soporte-email"
                  name="email"
                  value={formularioSoporte.email}
                  onChange={handleChangeSoporte}
                  className={`w-full px-4 py-1.5 border rounded-lg focus:border-primary-500 focus:outline-none focus:ring-0 ${
                    erroresSoporte.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ fontSize: '16px' }}
                  placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {erroresSoporte.email && <p className="mt-1 text-sm text-red-500 pointer-events-none">{erroresSoporte.email}</p>}
              </div>

              {/* Teléfono */}
              <div className="relative">
                <label htmlFor="soporte-telefono" className="block text-sm font-medium text-gray-700 mb-1 pointer-events-none">
                  {language === 'es' ? 'Teléfono' : 'Phone'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="soporte-telefono"
                  name="telefono"
                  value={formularioSoporte.telefono}
                  onChange={handleChangeSoporte}
                  className={`w-full px-4 py-1.5 border rounded-lg focus:border-primary-500 focus:outline-none focus:ring-0 ${
                    erroresSoporte.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ fontSize: '16px' }}
                  placeholder={language === 'es' ? '+34 600 000 000' : '+1 555 000 0000'}
                />
                {erroresSoporte.telefono && <p className="mt-1 text-sm text-red-500 pointer-events-none">{erroresSoporte.telefono}</p>}
              </div>

              {/* Descripción del asunto */}
              <div>
                <label htmlFor="soporte-descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Descripción del asunto' : 'Description'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="soporte-descripcion"
                  name="descripcion"
                  value={formularioSoporte.descripcion}
                  onChange={handleChangeSoporte}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    erroresSoporte.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ fontSize: '16px' }}
                  placeholder={language === 'es' ? 'Describe tu consulta o problema...' : 'Describe your inquiry or issue...'}
                />
                {erroresSoporte.descripcion && <p className="mt-1 text-sm text-red-500">{erroresSoporte.descripcion}</p>}
              </div>

              {erroresSoporte.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {erroresSoporte.submit}
                </div>
              )}

              {exitoSoporte && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {language === 'es' ? 'Mensaje enviado correctamente. Te contactaremos pronto.' : 'Message sent successfully. We will contact you soon.'}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalSoporte}
                  disabled={enviandoSoporte}
                  className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={enviandoSoporte}
                  className="flex-1 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoSoporte 
                    ? (language === 'es' ? 'Enviando...' : 'Sending...') 
                    : (language === 'es' ? 'Enviar' : 'Send')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Contratar Plan */}
      {modalContratarPlanAbierto && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setModalContratarPlanAbierto(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setModalContratarPlanAbierto(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido del modal */}
            <div className="text-center">
              {/* Imagen */}
              <div className="mb-6">
                <img 
                  src="/images/contratar_plan.png" 
                  alt="Contratar plan"
                  className="w-28 h-28 mx-auto object-contain"
                />
              </div>

              {/* Texto */}
              <p className="text-lg text-gray-800 mb-6">
                {language === 'es' 
                  ? 'Lo sentimos, es necesario contratar un plan para disfrutar de esta funcionalidad'
                  : 'Sorry, you need to subscribe to a plan to enjoy this feature'}
              </p>

              {/* Enlace a pricing */}
              <Link
                href="/pricing"
                onClick={() => setModalContratarPlanAbierto(false)}
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {language === 'es' ? 'Ver planes' : 'View plans'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Panel de información de búsqueda avanzada */}
      {panelInfoAbierto && resultadoBusquedaAvanzada && (
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
                          {resultadoBusquedaAvanzada.scraping?.totalAnalizados || 0}
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
                          {resultadoBusquedaAvanzada.scraping?.totalDescartados || 0}
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
                          {resultadoBusquedaAvanzada.scraping?.totalOutliers || 0}
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
                      const anunciosEnZona = resultadoBusquedaAvanzada.scraping?.jsonCompradores?.compradores?.filter((a: any) => 
                        a.ciudad_o_zona && resultadoBusquedaAvanzada.ubicacion && 
                        a.ciudad_o_zona.toLowerCase().includes(resultadoBusquedaAvanzada.ubicacion.toLowerCase())
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
                      const perfilesTop = resultadoBusquedaAvanzada.scraping?.jsonCompradores?.compradores?.filter((a: any) => 
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
                          {resultadoBusquedaAvanzada.scraping?.totalFiltrados || 0}
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
                          <h4 className="text-sm font-semibold text-gray-900">
                            {language === 'es' ? 'Filtros activos' : 'Active filters'}
                          </h4>
                        </div>
                        <div className="p-2 max-h-60 overflow-y-auto">
                          {obtenerFiltrosActivos().map((filtro, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <span className="text-xs text-gray-700">{filtro.descripcion}</span>
                              <button
                                onClick={() => {
                                  setFiltrosGraficas(prev => {
                                    const { [filtro.tipo as keyof typeof prev]: _, ...rest } = prev
                                    return rest
                                  })
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="p-2 border-t border-gray-200">
                          <button
                            onClick={limpiarFiltrosGraficas}
                            className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                          >
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
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (resultadoBusquedaAvanzada.scraping?.jsonCompradores?.compradores || [])
                  const plataformasMap = new Map<string, number>()
                  anuncios.forEach((comprador: any) => {
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
                                    className={`bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500 ${filtrosGraficas.plataforma === item.plataforma ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
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
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (resultadoBusquedaAvanzada.scraping?.jsonCompradores?.compradores || [])
                  const precios = anuncios
                    .map((c: any) => c.precio_eur || 0)
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
                  const distribucionPrecios = rangos.map(rango => ({
                    ...rango,
                    percentage: total > 0 ? (rango.count / total) * 100 : 0,
                    label: `${formatPriceInfo(rango.min)} - ${formatPriceInfo(rango.max)}`
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
                                    className={`bg-gradient-to-r from-blue-500 to-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2 relative flex-shrink-0 ${filtrosGraficas.rangoPrecio?.min === rango.min && filtrosGraficas.rangoPrecio?.max === rango.max ? 'ring-2 ring-blue-700 ring-offset-2' : ''}`}
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
                <div className="mt-6">
                {(() => {
                  const anuncios = compradoresParaAnalisis.length > 0 ? compradoresParaAnalisis : (resultadoBusquedaAvanzada.scraping?.jsonCompradores?.compradores || [])
                  const ahora = new Date()
                  const categorias = {
                    menosDe1Semana: { precios: [] as number[], label: language === 'es' ? '< 1 semana' : '< 1 week' },
                    entre1Y4Semanas: { precios: [] as number[], label: language === 'es' ? '1-4 semanas' : '1-4 weeks' },
                    entre1Y3Meses: { precios: [] as number[], label: language === 'es' ? '1-3 meses' : '1-3 months' },
                    masDe3Meses: { precios: [] as number[], label: language === 'es' ? '> 3 meses' : '> 3 months' },
                    sinFecha: { precios: [] as number[], label: language === 'es' ? 'Sin fecha' : 'No date' }
                  }

                  anuncios.forEach((comprador: any) => {
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

                  return (
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
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
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {item.label}
                                </span>
                                <span className="text-xs font-semibold text-gray-900">
                                  {formatPriceInfo(item.promedio)} ({item.count})
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-4 relative overflow-visible flex items-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => handleClickBarra('precioAntiguedad', item.categoria)}
                              >
                                <div
                                  className={`bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 flex-shrink-0 ${filtrosGraficas.precioAntiguedad === item.categoria ? 'ring-2 ring-purple-700 ring-offset-1' : ''}`}
                                  style={{ width: `${alturaPromedio}%` }}
                                >
                                  {item.count > 0 && alturaPromedio > 25 && (
                                    <span className="text-[10px] font-semibold text-white">
                                      {formatPriceInfo(item.promedio)}
                                    </span>
                                  )}
                                </div>
                                {item.count > 0 && alturaPromedio <= 25 && (
                                  <span className="text-[10px] font-semibold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">
                                    {formatPriceInfo(item.promedio)}
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
                </div>

                {/* Gráfica de distribución de precios de productos nuevos */}
                {resultadoBusquedaAvanzada.scraping?.productosNuevos && resultadoBusquedaAvanzada.scraping.productosNuevos.length > 0 && (() => {
                  // Usar datos_producto_nuevo_filtrado del primer elemento
                  const primerProducto = resultadoBusquedaAvanzada.scraping.productosNuevos[0]
                  const productosFiltrados = primerProducto.datos_producto_nuevo_filtrado || []
                  
                  if (productosFiltrados.length === 0) return null
                  
                  const precios = productosFiltrados
                    .map((p: any) => p.price || 0)
                    .filter((p: number) => p > 0)
                  
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
                  
                  // Contar productos en cada rango
                  precios.forEach((precio: number) => {
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
                  
                  const formatPriceProductosNuevos = (price: number) => {
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
                    label: `${formatPriceProductosNuevos(rango.min)} - ${formatPriceProductosNuevos(rango.max)}`
                  })).filter(r => r.count > 0)

                  if (distribucionPrecios.length === 0) return null

                  return (
                    <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
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
                        {distribucionPrecios.map((rango, index) => {
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
                        })}
                      </div>
                      )}
                    </div>
                  )
                })()}

                {/* Lista de productos nuevos - Top 10 */}
                {resultadoBusquedaAvanzada.scraping?.productosNuevos && resultadoBusquedaAvanzada.scraping.productosNuevos.length > 0 && (() => {
                  // Obtener los productos filtrados del primer elemento (donde está almacenado)
                  const primerProducto = resultadoBusquedaAvanzada.scraping.productosNuevos[0]
                  const productosFiltrados = primerProducto.datos_producto_nuevo_filtrado || []
                  
                  // Si hay productos filtrados, mostrar Top 10 ordenados por precio ascendente
                  const top10Productos = productosFiltrados
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 10)
                  
                  if (top10Productos.length === 0) return null
                  
                  return (
                    <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
                      <button
                        onClick={() => setListaProductosNuevosColapsada(!listaProductosNuevosColapsada)}
                        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                          {language === 'es' ? 'Top 10' : 'Top 10'}
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
                        {top10Productos.map((producto, index) => {
                          const primeraImagen = producto.images && producto.images.length > 0 ? producto.images[0].url : null
                          const formatPriceProductosNuevos = (price: number) => {
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
                                      {formatPriceProductosNuevos(producto.price)}
                                    </span>
                                    <span className="text-[10px] text-blue-600 hover:text-blue-800">
                                      {language === 'es' ? 'Ver oferta →' : 'View offer →'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </a>
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
