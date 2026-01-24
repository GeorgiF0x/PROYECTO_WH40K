'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Textarea, Avatar, Spinner } from '@/components/ui'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guiones bajos'),
  display_name: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  location: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Populate form with current profile data
  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      })
    }
  }, [profile, reset])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/perfil')
    }
  }, [authLoading, user, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarUrl = profile?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const supabase = createClient()
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Update profile
      const { error } = await updateProfile({
        ...data,
        display_name: data.display_name || null,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        avatar_url: avatarUrl,
      })

      if (error) {
        if (error.message.includes('duplicate key')) {
          setError('Este nombre de usuario ya está en uso')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Error al actualizar el perfil')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bone mb-6">Editar Perfil</h1>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-md">
          <p className="text-green-400 text-sm">Perfil actualizado correctamente</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-void-light border border-bone/10 rounded-lg p-6">
          <h2 className="text-lg font-medium text-bone mb-4">Foto de perfil</h2>
          <div className="flex items-center gap-6">
            <Avatar
              src={avatarPreview || profile.avatar_url}
              alt={profile.display_name || profile.username}
              size="xl"
            />
            <div>
              <label className="cursor-pointer">
                <span className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-md hover:bg-gold/30 transition-colors">
                  Cambiar foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-bone/50 mt-2">
                JPG, PNG o GIF. Máximo 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-void-light border border-bone/10 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-bone mb-4">Información básica</h2>

          <Input
            label="Nombre de usuario"
            placeholder="tu_usuario"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Nombre para mostrar"
            placeholder="Tu Nombre"
            error={errors.display_name?.message}
            {...register('display_name')}
          />

          <Textarea
            label="Biografía"
            placeholder="Cuéntanos sobre ti..."
            error={errors.bio?.message}
            {...register('bio')}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-void-light border border-bone/10 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-bone mb-4">Información adicional</h2>

          <Input
            label="Ubicación"
            placeholder="Madrid, España"
            error={errors.location?.message}
            {...register('location')}
          />

          <Input
            label="Sitio web"
            type="url"
            placeholder="https://tu-sitio.com"
            error={errors.website?.message}
            {...register('website')}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
