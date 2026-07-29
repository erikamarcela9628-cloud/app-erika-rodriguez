'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function guardarEvolucion(formData: FormData) {
  const historia_clinica_id = formData.get('historia_clinica_id') as string
  const paciente_id = formData.get('paciente_id') as string
  const numero_sesion = parseInt(formData.get('numero_sesion') as string, 10) || 1
  const evolucion_terapeutica = (formData.get('evolucion') || formData.get('evolucion_terapeutica')) as string
  const observaciones_valoracion = (formData.get('observaciones_valoracion') || '') as string
  const diagnostico_cie10 = (formData.get('diagnostico_cie10') || '') as string
  const asistente_sesion = (formData.get('asistente_sesion') || null) as string | null
  const fecha_sesion = formData.get('fecha_sesion') ? (formData.get('fecha_sesion') as string) : new Date().toISOString()

  const { error } = await supabaseServer
    .from('evoluciones_clinicas')
    .insert({
      historia_clinica_id,
      paciente_id,
      numero_sesion,
      fecha_sesion,
      evolucion_terapeutica,
      observaciones_valoracion,
      diagnostico_cie10,
      asistente_sesion
    })

  if (error) {
    console.error("Error detallado al guardar evolución:", error)
    throw new Error('Error guardando la sesión.')
  }

  // Actualizar updated_at de la historia
  await supabaseServer
    .from('historias_clinicas')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', historia_clinica_id)

  revalidatePath('/admin/historias')
  redirect(`/admin/historias/${historia_clinica_id}`)
}
