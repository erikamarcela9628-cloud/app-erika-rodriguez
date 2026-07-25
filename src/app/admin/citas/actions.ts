'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function agendarCita(formData: FormData) {
  const paciente_id = formData.get('paciente_id') as string
  const fecha = formData.get('fecha') as string
  const hora = formData.get('hora') as string
  const duracion_minutos = parseInt(formData.get('duracion_minutos') as string, 10)
  const modalidad = formData.get('modalidad') as string
  const observaciones = formData.get('observaciones') as string

  // Combinar fecha y hora
  const fecha_hora = new Date(`${fecha}T${hora}:00`).toISOString()

  const { data, error } = await supabaseServer
    .from('citas')
    .insert({
      paciente_id,
      fecha,
      fecha_cita: fecha_hora,
      duracion_minutos,
      modalidad,
      estado: 'Programada',
      observaciones: observaciones || null
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error guardando cita:', error)
    throw new Error('No se pudo agendar la cita: ' + error.message)
  }

  revalidatePath('/admin/citas')
  redirect('/admin/citas')
}

export async function actualizarEstadoCita(citaId: string, nuevoEstado: string) {
  const { error } = await supabaseServer
    .from('citas')
    .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
    .eq('id', citaId)

  if (error) {
    console.error('Error actualizando estado de cita:', error)
    throw new Error('No se pudo actualizar el estado de la cita.')
  }

  revalidatePath('/admin/citas')
}
