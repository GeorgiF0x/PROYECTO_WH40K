# Warhammer 40K Community Platform - Estado del Proyecto

## Tecnologías
- **Next.js 16.1.4** con Turbopack y React 19
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **pgvector** para embeddings/búsqueda semántica
- **OpenAI** text-embedding-3-small para generar embeddings
- **Framer Motion** + **Lottie** para animaciones
- **Tailwind CSS** con tema grimdark personalizado

## Credenciales (en .env.local)
- Supabase URL: yvjflhvbtjjmdwkgqqfs.supabase.co
- OpenAI API Key configurada

## Fases Completadas
- ✅ FASE 0: Infraestructura Base
- ✅ FASE 1: Autenticación + Perfiles
- ✅ FASE 4: Galería de Miniaturas (parcial - falta likes/comments)

## Pendiente
- [ ] Sistema de likes y comentarios en galería
- [x] **Mercado P2P**: Usuarios venden/compran miniaturas entre ellos (tipo Wallapop)
  - `/mercado` - Listado con filtros (estado, tipo, ubicación)
  - `/mercado/[id]` - Detalle de anuncio con galería de imágenes
  - `/mercado/nuevo` - Crear nuevo anuncio
  - Componentes: ListingCard, ListingGrid
- [ ] **Directorio de Tiendas Locales**: Mapa/listado de tiendas físicas de Warhammer por zona geográfica
- [ ] Feed social
- [ ] Blog/Tutoriales
- [ ] Chat en tiempo real
- [ ] Panel de administración

## Arquitectura de Rutas
```
src/app/
├── (auth)/          # Login, Register, Forgot Password
├── (main)/          # Galería, Mi Galería, Usuarios
├── (dashboard)/     # Perfil/Configuración
├── facciones/       # Páginas de facciones
└── api/             # Embeddings, Search
```

## Notas de Diseño
- Commits SIN Co-Authored-By (ver .claude/settings.md)
- Header con iconos Lucide animados (no emojis)
- Logo hexagonal estático con glow pulsante
- Estética grimdark: colores void, imperial-gold, blood-red, bone

## Dominio
https://grimdarklegion.com

## Repositorio
https://github.com/GeorgiF0x/PROYECTO_WH40K.git

## Próxima Sesión
1. Rediseñar concepto de "Mercado" → Directorio de tiendas locales
2. Continuar con likes/comentarios en galería
3. Implementar feed social
