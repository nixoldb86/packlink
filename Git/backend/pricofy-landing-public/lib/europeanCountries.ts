// Lista completa de países de Europa
export const europeanCountries = [
  'Albania',
  'Alemania',
  'Andorra',
  'Armenia',
  'Austria',
  'Azerbaiyán',
  'Bélgica',
  'Bielorrusia',
  'Bosnia y Herzegovina',
  'Bulgaria',
  'Chipre',
  'Croacia',
  'Dinamarca',
  'Eslovaquia',
  'Eslovenia',
  'España',
  'Estonia',
  'Finlandia',
  'Francia',
  'Georgia',
  'Grecia',
  'Hungría',
  'Irlanda',
  'Islandia',
  'Italia',
  'Kazajistán',
  'Letonia',
  'Liechtenstein',
  'Lituania',
  'Luxemburgo',
  'Malta',
  'Moldavia',
  'Mónaco',
  'Montenegro',
  'Noruega',
  'Países Bajos',
  'Polonia',
  'Portugal',
  'Reino Unido',
  'República Checa',
  'Rumanía',
  'Rusia',
  'San Marino',
  'Serbia',
  'Suecia',
  'Suiza',
  'Turquía',
  'Ucrania',
  'Vaticano',
]

// Función para ordenar países alfabéticamente
export function sortCountriesAlphabetically(countries: string[]): string[] {
  return [...countries].sort((a, b) => a.localeCompare(b, 'es'))
}

// Función para obtener la lista de países con el país detectado primero
export function getOrderedCountries(detectedCountry: string | null): string[] {
  const allCountries = sortCountriesAlphabetically(europeanCountries)
  
  if (!detectedCountry) {
    return allCountries
  }
  
  // Remover el país detectado de la lista
  const filteredCountries = allCountries.filter(country => country !== detectedCountry)
  
  // Retornar: [país detectado, ...resto ordenado alfabéticamente]
  return [detectedCountry, ...filteredCountries]
}

