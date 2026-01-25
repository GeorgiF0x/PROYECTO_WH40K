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
- [x] Autenticación funcionando (API keys corregidas, RLS policies añadidas)
- [x] Perfil de usuario se crea automáticamente al login

---

## PRÓXIMA TAREA: Rediseño de Páginas de Perfil

### Resumen
Rediseño completo de las 4 páginas relacionadas con el perfil de usuario, corrigiendo bugs críticos de datos, implementando funcionalidad faltante, y mejorando la estética grimdark.

### Fase 1: Correcciones Críticas de Datos

#### 1.1 Arreglar stats falsos en `/mi-galeria`

**Archivo:** `src/app/(main)/mi-galeria/page.tsx`

**Problema:** Líneas 66-79 usan `Math.random()` para likes/comments.

**Solución:**
```typescript
// Reemplazar con query real
const { data } = await supabase
  .from('miniatures')
  .select(`
    *,
    likes_count:miniature_likes(count),
    comments_count:miniature_comments(count)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Transformar resultados
const withStats = (data || []).map((m) => ({
  ...m,
  likes_count: m.likes_count?.[0]?.count || 0,
  comments_count: m.comments_count?.[0]?.count || 0,
}))
```

#### 1.2 Implementar modales de seguidores/siguiendo

**Archivo:** `src/components/user/ProfileHeader.tsx`

**Problema:** TODOs en líneas 156 y 170 - modales vacíos.

**Solución:**
- Cargar datos reales con `getFollowers()` y `getFollowing()` de `users.ts`
- Mostrar lista de `UserCard` con `FollowButton` para cada usuario
- Añadir estados de carga y vacío

### Fase 2: Funcionalidad Faltante

#### 2.1 Crear página de editar miniatura

**Nuevo archivo:** `src/app/(main)/mi-galeria/editar/[id]/page.tsx`

**Funcionalidades:**
- Cargar miniatura existente por ID
- Verificar que el usuario es el propietario
- Formulario para editar título, descripción, facción
- Grid de imágenes con drag & drop para reordenar
- Botón para eliminar con confirmación
- Regenerar embedding si cambia título/descripción

#### 2.2 Implementar tabs funcionales en perfil público

**Archivo:** `src/app/(main)/usuarios/[username]/page.tsx`

**Nuevo componente:** `src/components/user/ProfileTabs.tsx`

**Tabs:**
- **Miniaturas**: Grid con las miniaturas del usuario
- **Likes**: Miniaturas que el usuario ha dado like
- **Insignias**: Badges del usuario (si existen)

#### 2.3 Cargar miniaturas en perfil público

**Problema actual:** El grid de miniaturas está vacío aunque se muestra el conteo.

**Solución:** Fetch real de miniaturas del usuario con stats de engagement.

### Fase 3: Mejoras Visuales

#### 3.1 Mejorar `/perfil` (editar perfil)

- Header animado con icono imperial
- Secciones con cards `bg-void-light/80 backdrop-blur-sm`
- Preview en vivo del perfil mientras se edita
- Indicador de disponibilidad de username en tiempo real
- Selector de facción con cards animadas

#### 3.2 Mejorar ProfileHeader

- Banner animado con gradiente basado en facción
- Efecto de scan line sutil
- Animación de entrada para stats
- Avatar con ring glow pulsante

#### 3.3 Mejorar cards de stats en `/mi-galeria`

- Contador animado que incrementa al cargar
- Iconos con micro-animaciones
- Gradientes decorativos en bordes

### Fase 4: Animaciones con Framer Motion

```typescript
// Entrada de página
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

// Cards con spring
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}
```

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/app/(main)/mi-galeria/page.tsx` | Fix stats falsos, mejorar UI |
| `src/app/(main)/mi-galeria/editar/[id]/page.tsx` | **NUEVO** - Página de edición |
| `src/app/(main)/usuarios/[username]/page.tsx` | Tabs funcionales, cargar miniaturas |
| `src/app/(dashboard)/perfil/page.tsx` | Mejorar diseño, añadir preview |
| `src/components/user/ProfileHeader.tsx` | Modales funcionales, banner animado |
| `src/components/user/ProfileTabs.tsx` | **NUEVO** - Componente de tabs |
| `src/components/user/UserListModal.tsx` | **NUEVO** - Modal reutilizable para listas |

### Orden de Implementación

1. **Fase 1** (30 min): Corregir datos falsos en mi-galeria
2. **Fase 2.3** (20 min): Cargar miniaturas en perfil público
3. **Fase 2.1** (45 min): Crear página editar miniatura
4. **Fase 2.2** (30 min): Implementar tabs funcionales
5. **Fase 1.2** (30 min): Modales de seguidores/siguiendo
6. **Fase 3** (45 min): Mejoras visuales
7. **Fase 4** (30 min): Animaciones finales

### Verificación

- [ ] Stats en Mi Galería muestran números reales de la BD
- [ ] Botón editar lleva a página funcional
- [ ] Eliminar miniatura funciona con confirmación
- [ ] Página editar carga datos existentes
- [ ] Tabs en perfil público funcionan
- [ ] Miniaturas se muestran en grid del perfil público
- [ ] Modal de seguidores muestra lista real
- [ ] Modal de siguiendo muestra lista real

---

## Pendiente por Implementar (Futuro)
- [ ] Directorio de tiendas locales (mapa/listado por zona)
- [ ] Sistema de comentarios en galería
- [ ] Feed social
- [ ] Chat en tiempo real
- [ ] Panel de administración

## Credenciales (en .env.local)
- Supabase URL: yvjflhvbtjjmdwkgqqfs.supabase.co
- OpenAI API Key configurada
- Google OAuth configurado
- Discord OAuth configurado

## Notas de Diseño
- Commits SIN Co-Authored-By (configurado en .claude/settings.md)
- Header con iconos Lucide animados (no emojis)
- Logo hexagonal estático con glow pulsante
- Estética grimdark: colores void, imperial-gold, blood-red, bone
- Tipografía: Orbitron (títulos), Rajdhani (body)
