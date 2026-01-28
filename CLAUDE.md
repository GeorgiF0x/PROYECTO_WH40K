# Warhammer 40K Community Platform - Estado del Proyecto

## Tecnologías
- **Next.js 16.1.4** con Turbopack y React 19
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **pgvector** para embeddings/búsqueda semántica
- **OpenAI** text-embedding-3-small para generar embeddings
- **Framer Motion** + **Lottie** para animaciones
- **Tailwind CSS** con tema grimdark personalizado
- **Mapbox GL JS** para mapas interactivos

## Credenciales (en .env.local)
- Supabase URL: yvjflhvbtjjmdwkgqqfs.supabase.co
- OpenAI API Key configurada
- Mapbox Token configurado

## Fases Completadas
- ✅ FASE 0: Infraestructura Base
- ✅ FASE 1: Autenticación + Perfiles
- ✅ FASE 4: Galería de Miniaturas (parcial - falta likes/comments)
- ✅ Mercado P2P
- ✅ Comunidad: Tiendas locales con mapa
- ✅ Comunidad: Programa de Creadores

## Pendiente
- [ ] Sistema de likes y comentarios en galería
- [ ] Facciones Wiki (expandir /facciones con lore, unidades, galerías)
- [ ] PWA (Progressive Web App)
- [ ] Feed social
- [ ] Blog/Tutoriales
- [ ] Chat en tiempo real
- [ ] Panel de administración (incluye monitoreo Mapbox)

## Arquitectura de Rutas
```
src/app/
├── (auth)/                    # Login, Register, Forgot Password
├── (main)/                    # Galería, Mi Galería, Usuarios
│   ├── comunidad/             # Hub de comunidad
│   │   ├── tiendas/           # Directorio de tiendas
│   │   └── creadores/         # Directorio de creadores
│   │       └── solicitar/     # Formulario de solicitud
│   ├── mercado/               # Marketplace P2P
│   └── usuarios/[username]/   # Perfiles de usuario
├── (dashboard)/               # Perfil/Configuración
├── facciones/                 # Páginas de facciones
└── api/                       # Embeddings, Search
```

## Componentes por Sección
```
src/components/
├── community/      # Tiendas: CommunityMap, StoreCard, StoreGrid, etc.
├── creator/        # Creadores: CreatorBadge, CreatorCard, CreatorGrid, etc.
├── marketplace/    # Mercado: ListingCard, ListingGrid, etc.
└── user/           # Usuario: ProfileHeader, ProfileTabs, FollowButton, etc.
```

## Migraciones SQL Pendientes
- `supabase/migrations/20260127_community_stores.sql` - Tiendas locales
- `supabase/migrations/20260128_creator_profiles.sql` - Programa de creadores

**IMPORTANTE**: Ejecutar estas migraciones en Supabase Dashboard > SQL Editor

## Notas de Diseño
- Commits SIN Co-Authored-By (ver .claude/settings.md)
- Header con iconos Lucide animados (no emojis)
- Logo hexagonal estático con glow pulsante
- Estética grimdark: colores void, imperial-gold, blood-red, bone
- Tema por sección:
  - Galería = Necron (teal)
  - Mercado = RogueTrader (gold)
  - Usuarios = Administratum (gold+red)
  - Comunidad = Cartographia (amber+steel, grid lines)
  - Creadores = Artisan (purple+pink)

## Dominio
https://grimdarklegion.com

## Repositorio
https://github.com/GeorgiF0x/PROYECTO_WH40K.git

## Workaround Windows (Claude Code)
- `npm run dev` / `npx` no producen output en Windows (bug #19294)
- Usar siempre: `node node_modules/next/dist/bin/next dev --turbopack`
- Para build: `node node_modules/next/dist/bin/next build`
- Para tsc: `npx tsc --noEmit` sí funciona
- Para npm install: usar PowerShell si bash falla

## Próxima Sesión
1. Facciones Wiki (expandir con lore, unidades, galerías)
2. PWA
3. Panel de administración
