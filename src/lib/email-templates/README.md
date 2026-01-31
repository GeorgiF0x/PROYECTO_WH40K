# Email Templates - Grimdark Legion

Plantillas HTML para los emails de autenticación de Supabase con estética grimdark.

## Plantillas Disponibles

| Archivo | Uso en Supabase | Tema |
|---------|-----------------|------|
| `confirm-signup.html` | Confirm signup | Administratum / Reclutamiento Imperial |
| `reset-password.html` | Reset password | Ordo Inquisición / Seguridad |
| `magic-link.html` | Magic Link | Navigators / Portal Warp |

## Cómo Usar

### 1. Ir a Supabase Dashboard

**Authentication → Email Templates**

### 2. Copiar el contenido HTML

Abre cada archivo `.html` y copia todo el contenido.

### 3. Pegar en Supabase

Para cada template:
1. Selecciona el tipo de email (Confirm signup, Reset password, Magic link)
2. Pega el HTML en el campo "Body"
3. Configura el Subject:

| Template | Subject Sugerido |
|----------|------------------|
| Confirm signup | `[Grimdark Legion] Confirma tu Reclutamiento` |
| Reset password | `[Grimdark Legion] Restablece tus Credenciales` |
| Magic link | `[Grimdark Legion] Tu Portal de Acceso` |

### 4. Guardar

Click en "Save" para cada template.

## Variables de Supabase

Las plantillas usan estas variables que Supabase reemplaza automáticamente:

- `{{ .ConfirmationURL }}` - URL del enlace de confirmación
- `{{ .Token }}` - Token único (usado para referencia en documentos)
- `{{ .Email }}` - Email del usuario (si lo necesitas)
- `{{ .SiteURL }}` - URL del sitio configurada

## Colores Usados

```css
--void: #0a0a0c        /* Fondo principal */
--imperial-gold: #C9A227  /* Acentos dorados */
--blood-red: #8B0000     /* Alertas/Inquisición */
--bone: #E8E8F0          /* Texto principal */
--warp-purple: #6B46C1   /* Magic Link/Portal */
```

## Testing

Para probar las plantillas:
1. Envíate un email de prueba desde Supabase
2. O abre los archivos `.html` directamente en el navegador

## Compatibilidad

Las plantillas están diseñadas para ser compatibles con:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Thunderbird

Usan inline CSS y tablas para máxima compatibilidad.
