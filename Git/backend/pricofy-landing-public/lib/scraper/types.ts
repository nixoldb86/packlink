// Tipos TypeScript para el sistema de scraping

export interface ScrapingInputs {
  producto_text: string
  categoria: string
  ubicacion: string // formato: "españa/madrid" o "españa/coslada"
  radio_km: number
  condicion_objetivo: 'nuevo' | 'como_nuevo' | 'muy_buen_estado' | 'buen_estado' | 'usado' | 'aceptable'
  idioma_busqueda: string
  min_paginas_por_plataforma: number
  min_resultados_por_plataforma: number
  coordenadas_ip?: { lat: number; lon: number; country_code?: string } // Coordenadas de la IP del usuario con código de país (opcional)
}

export interface AnuncioRaw {
  plataforma: string
  titulo: string
  precio: string | number
  precio_eur?: number
  moneda_original?: string
  estado_declarado?: string
  estado_inferido?: string
  ciudad_o_zona?: string
  url_anuncio: string
  url_listado?: string
  fecha_publicacion?: string
  descripcion?: string
  verificado_tarjeta?: boolean // true si no se pudo abrir el detalle
  id_anuncio?: string
  product_image?: string | null
  is_shippable?: boolean | null
  is_top_profile?: boolean | null
  user_id?: string | null
  country_code?: string // Código de país (ej: "ES" para Wallapop/Milanuncios)
}

export interface AnuncioNormalizado extends AnuncioRaw {
  precio_eur: number
  precio_normalizado: number
  titulo_normalizado: string
  estado_normalizado: 'nuevo' | 'como_nuevo' | 'muy_buen_estado' | 'buen_estado' | 'usado' | 'aceptable' | null
  ciudad_normalizada?: string
  distancia_km?: number
}

export interface TablaCompradores {
  plataforma: string
  precio: number
  estado_declarado: string | null
  ciudad_o_zona: string | null
  url_exacta: string
  fecha_publicacion: string
  product_image?: string | null
}

export interface TablaVendedores {
  tipo_precio: 'minimo' | 'ideal' | 'rapido'
  precio: number
  plataforma: string
  url_exacta: string
  plataforma_sugerida: string
}

export interface JSONCompradores {
  compradores: Array<{
    titulo: string
    plataforma: string
    precio_eur: number
    moneda_original: string
    estado_declarado: string | null
    ciudad_o_zona: string | null
    url_anuncio: string
    url_listado: string | null
    fecha_publicacion: string
    product_image?: string | null
    descripcion?: string | null
    is_shippable?: boolean | null
    is_top_profile?: boolean | null
    user_id?: string | null
    country_code?: string // Código de país (ej: "ES" para Milanuncios)
  }>
}

export interface JSONVendedores {
  vendedores: Array<{
    tipo_precio: 'minimo' | 'ideal' | 'rapido'
    precio_eur: number
    plataforma: string
    urls: string[]
    plataforma_sugerida: string[]
  }>
  descripcion_anuncio: string
}

export interface PlataformaScraper {
  nombre: string
  buscar(inputs: ScrapingInputs): Promise<AnuncioRaw[]>
  obtenerDetalleAnuncio(url: string, numeroAnuncio?: number, totalAnuncios?: number): Promise<Partial<AnuncioRaw> | null>
}

