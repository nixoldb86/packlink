# Configuración de Fuentes por País

Este documento explica cómo configurar las fuentes de scraping por país usando variables de entorno.

## Variables de Entorno Requeridas

Para cada país que quieras incluir en las búsquedas avanzadas, necesitas configurar tres variables:

### Formato de Variables

- `{PAIS}_SOURCES`: Lista de plataformas separadas por comas para ese país
- `LATITUD_{PAIS}`: Latitud por defecto para ese país (opcional, tiene valores por defecto)
- `LONGITUD_{PAIS}`: Longitud por defecto para ese país (opcional, tiene valores por defecto)

### Ejemplo para España

```env
ES_SOURCES=wallapop,milanuncios
LATITUD_ES=40.4168
LONGITUD_ES=-3.7038
```

### Ejemplo para Italia

```env
IT_SOURCES=subito,prezzoforte
LATITUD_IT=41.9028
LONGITUD_IT=12.4964
```

### Ejemplo para Francia

```env
FR_SOURCES=leboncoin,vinted
LATITUD_FR=48.8566
LONGITUD_FR=2.3522
```

## Cómo Funciona

1. **Detección del País del Usuario**: Cuando un usuario hace una búsqueda avanzada, el sistema detecta su país mediante geolocalización de IP.

2. **Fuentes del País del Usuario**: Para las plataformas configuradas en `{PAIS}_SOURCES` del país del usuario, se usan las coordenadas exactas de la IP del usuario.

3. **Fuentes de Otros Países**: Para las plataformas de otros países, se usan las coordenadas por defecto configuradas en `LATITUD_{PAIS}` y `LONGITUD_{PAIS}`.

## Valores por Defecto

Si no configuras `LATITUD_{PAIS}` y `LONGITUD_{PAIS}`, el sistema usa valores por defecto:

- **ES (España)**: Madrid (40.4168, -3.7038)
- **IT (Italia)**: Roma (41.9028, 12.4964)
- **FR (Francia)**: París (48.8566, 2.3522)
- **PT (Portugal)**: Lisboa (38.7223, -9.1393)
- **DE (Alemania)**: Berlín (52.5200, 13.4050)
- **GB (Reino Unido)**: Londres (51.5074, -0.1278)

## Ejemplo Completo

```env
# España
ES_SOURCES=wallapop,milanuncios
LATITUD_ES=40.4168
LONGITUD_ES=-3.7038

# Italia
IT_SOURCES=subito,prezzoforte
LATITUD_IT=41.9028
LONGITUD_IT=12.4964

# Francia
FR_SOURCES=leboncoin,vinted
LATITUD_FR=48.8566
LONGITUD_FR=2.3522
```

## Notas Importantes

- Las variables se leen dinámicamente, por lo que puedes agregar nuevos países sin modificar código.
- El sistema detecta automáticamente todas las variables que terminan en `_SOURCES`.
- Las coordenadas por defecto se usan solo para plataformas de países que no son el del usuario.
- Si un usuario está en España, las plataformas de `ES_SOURCES` usarán sus coordenadas exactas, mientras que las de `IT_SOURCES` usarán las coordenadas por defecto de Italia.

