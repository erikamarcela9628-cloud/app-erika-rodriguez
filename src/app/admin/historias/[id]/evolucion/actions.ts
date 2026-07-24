'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function guardarEvolucion(formData: FormData) {
  const historia_clinica_id = formData.get('historia_clinica_id') as string
  const numero_sesion = parseInt(formData.get('numero_sesion') as string, 10)
  const fecha = formData.get('fecha') as string
  const evolucion_detalle = formData.get('evolucion_detalle') as string
  const observaciones = formData.get('observaciones') as string
  const diagnostico_cie10 = formData.get('diagnostico_cie10') as string

  const { error } = await supabaseServer
    .from('evoluciones')
    .insert({
      historia_clinica_id,
      numero_sesion,
      fecha,
      evolucion_detalle,
      observaciones: observaciones || null,
      diagnostico_cie10: diagnostico_cie10 || null
    })

  if (error) {
    console.error('Error guardando evolucion:', error)
    throw new Error('Error guardando la sesión.')
  }

  // Actualizar updated_at de la historia
  await supabaseServer
    .from('historias_clinicas')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', historia_clinica_id)

  revalidatePath(`/admin/historias/${historia_clinica_id}/evolucion`)
}
