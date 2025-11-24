# 🔄 Revertir Colores Morados

Este documento contiene los cambios para revertir el estilo morado y volver a los colores azules originales.

## Cambios realizados

### 1. `tailwind.config.ts`
Restaurar colores primary azules:

```typescript
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
},
```

### 2. `app/globals.css`
Restaurar botón primary sin gradiente:

```css
.btn-primary {
  @apply bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200;
}
```

### 3. `components/Hero.tsx`
Restaurar fondo y título:

```tsx
<section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
  <span className="block text-primary-600">{t('hero.titleHighlight')}</span>
```

### 4. `components/CTA.tsx`
Restaurar fondo sólido:

```tsx
<section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
  <p className="text-xl text-primary-100 mb-8">
```

### 5. `components/UseCases.tsx`
Restaurar botón sin gradiente:

```tsx
className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-md"
```

### 6. `components/Features.tsx`
Restaurar fondo y bordes:

```tsx
<section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
  className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200"
```

### 7. `components/Footer.tsx`
Restaurar fondo y título:

```tsx
<footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
  <h3 className="text-2xl font-bold text-white mb-4">Pricofy</h3>
```

## Nota

Si quieres revertir, puedes usar este documento como referencia o pedirme que lo haga automáticamente.

