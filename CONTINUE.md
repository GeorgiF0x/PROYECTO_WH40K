# Prompt para Continuar - Warhammer 40K Community Platform

## Contexto del Proyecto
Plataforma comunitaria de Warhammer 40K con Next.js 16.1.4 + React 19 + Supabase.
- **Dominio:** grimdarklegion.com
- **Repo:** https://github.com/GeorgiF0x/PROYECTO_WH40K.git

## Skills a Usar (OBLIGATORIO)
Antes de escribir código, invoca estas skills para seguir las mejores prácticas:
- `/nextjs-best-practices` - Server Components, data fetching, routing
- `/vercel-react-best-practices` - Bundle optimization, parallel fetching, re-renders
- `/supabase-postgres-best-practices` - RLS, indexes, queries optimizadas
- `/frontend-design` - UI distintiva, no genérica

## Estado Actual

### Completado
- [x] Mercado P2P refactorizado a Server Components
- [x] Cursor-based pagination implementado
- [x] loading.tsx y error.tsx en rutas /mercado y /galeria
- [x] Dynamic imports para ListingCard y MiniatureCard
- [x] Promise.all() para fetch paralelo en /mercado/[id]
- [x] Vercel Analytics y Speed Insights añadidos
- [x] OAuth configurado (Google + Discord)
- [x] Likes conectados a base de datos real
- [x] Middleware migrado a proxy.ts (Next.js 16+)

### Pendiente de Arreglar (Errores TypeScript en Vercel)
1. **`src/app/(main)/mercado/page.tsx:160`** - LoadMoreButton props type incompatible
   - Error: `Type 'SearchParams' is not assignable to type 'Record<string, string | undefined>'`
   - Solución: Convertir `params` a `Record<string, string | undefined>` antes de pasarlo

2. **Verificar instalación de dependencias:**
   ```bash
   npm install @vercel/analytics @vercel/speed-insights --save
   ```

### Pendiente por Implementar
- [ ] Directorio de tiendas locales (mapa/listado por zona)
- [ ] Sistema de comentarios en galería
- [ ] Feed social
- [ ] Chat en tiempo real
- [ ] Panel de administración

## Archivos Clave Modificados

### Server Components (fetching en servidor)
```
src/app/(main)/mercado/page.tsx - Server Component con cursor pagination
src/app/(main)/mercado/[id]/page.tsx - Server Component con Promise.all()
```

### Client Components (interactividad)
```
src/components/marketplace/MarketplaceFilters.tsx - Filtros con URL state
src/components/marketplace/LoadMoreButton.tsx - Paginación con cursor
src/components/marketplace/ListingDetail.tsx - Galería de imágenes, favoritos, contacto
src/components/marketplace/MarketplaceHero.tsx - Hero section animado
src/components/marketplace/MarketplaceCTA.tsx - Call to action
```

### Loading/Error Boundaries
```
src/app/(main)/mercado/loading.tsx
src/app/(main)/mercado/error.tsx
src/app/(main)/mercado/[id]/loading.tsx
src/app/(main)/mercado/[id]/error.tsx
src/app/(main)/mercado/[id]/not-found.tsx
src/app/(main)/galeria/loading.tsx
src/app/(main)/galeria/error.tsx
src/app/(main)/galeria/[id]/loading.tsx
src/app/(main)/galeria/[id]/error.tsx
src/app/(main)/galeria/[id]/not-found.tsx
```

### Configuración
```
src/app/layout.tsx - Analytics + SpeedInsights
src/proxy.ts - Supabase session handling (reemplaza middleware.ts en Next.js 16+)
tailwind.config.ts - Animaciones fadeIn y spin-slow añadidas
```

## Instrucciones para Continuar

1. **Primero ejecuta:**
   ```bash
   cd H:/z-innova/DEMOS/warhammer-forge
   npm install
   ```

2. **Arregla el error de TypeScript en LoadMoreButton:**
   En `src/app/(main)/mercado/page.tsx` línea 160, cambiar:
   ```tsx
   <LoadMoreButton cursor={nextCursor} searchParams={params} />
   ```
   Por:
   ```tsx
   <LoadMoreButton cursor={nextCursor} searchParams={params as Record<string, string | undefined>} />
   ```

3. **Verifica el build localmente:**
   ```bash
   npm run build
   ```

4. **Si el build pasa, haz push:**
   ```bash
   git add -A && git commit -m "fix: TypeScript errors" && git push
   ```

5. **Continúa con las tareas pendientes**

## Credenciales (en .env.local)
- Supabase URL: yvjflhvbtjjmdwkgqqfs.supabase.co
- OpenAI API Key configurada
- Google OAuth configurado
- Discord OAuth configurado
- Resend configurado para emails

## Notas de Diseño
- Commits SIN Co-Authored-By (configurado en .claude/settings.md)
- Header con iconos Lucide animados (no emojis)
- Logo hexagonal estático con glow pulsante
- Estética grimdark: colores void, imperial-gold, blood-red, bone
