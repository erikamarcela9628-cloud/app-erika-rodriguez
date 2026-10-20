'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function solicitarRecuperacion(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico.' }
  }

  const headerList = await headers()
  const forwardedHost = headerList.get('x-forwarded-host')
  const host = forwardedHost || headerList.get('host') || 'localhost:3000'
  const protocol = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

  // Si NEXT_PUBLIC_APP_URL está definida en producción (no localhost), la priorizamos
  let origin = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : `${protocol}://${host}`

  // Asegurar formato correcto de origin sin slash final
  origin = origin.replace(/\/$/, '')

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin/cambiar-password`,
  })

  if (error) {
    console.error('Error al solicitar recuperación de contraseña:', error)
    // Mensaje genérico amigable
    return { 
      success: false, 
      error: 'Hubo un inconveniente al enviar el correo. Por favor intenta de nuevo en unos minutos.' 
    }
  }

  return {
    success: true,
    message: 'Te hemos enviado un correo con el enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o la carpeta de spam.'
  }
}

export async function cambiarPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { success: false, error: 'Todos los campos son obligatorios.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden.' }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { 
      success: false, 
      error: 'Tu sesión ha expirado o el enlace no es válido. Por favor solicita un nuevo enlace de recuperación.' 
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Error al actualizar contraseña:', error)
    return { success: false, error: 'No se pudo actualizar la contraseña: ' + error.message }
  }

  return { success: true }
}
