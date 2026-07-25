import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import CitasClient from './CitasClient'

export const metadata = {
  title: 'Agendamiento de Citas | Dra. Erika Rodríguez',
}

export default async function CitasPage() {
  // Obtener citas (solo las futuras o del último mes para no sobrecargar si hay muchas)
  // En este caso traemos todas pero ordenadas
  const { data: citas, error: citasError } = await supabaseServer
    .from('citas')
    .select(`
      *,
      pacientes (*)
    `)
    .order('fecha_cita', { ascending: true })

  // También obtener el listado de pacientes para el modal de historias, o verificar si tienen historias
  const { data: historias } = await supabaseServer
    .from('historias_clinicas')
    .select('id, paciente_id')

  // Mapear qué pacientes tienen historia activa
  const pacientesConHistoria = new Map(historias?.map(h => [h.paciente_id, h.id]) || [])

  if (citasError && citasError.code !== '42P01') {
    console.error("Error detallado citas:", citasError.message, citasError.details, citasError.hint)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los turnos de tus pacientes y envía recordatorios automáticos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/citas/nueva"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0e787a] hover:bg-[#224252] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a] transition-colors"
          >
            + Nueva Cita
          </Link>
        </div>
      </div>

      {citasError?.code === '42P01' ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Tabla no encontrada</h3>
          <p className="text-sm text-red-700 mt-2">
            La tabla <code>citas</code> no existe. Por favor ejecuta el script SQL provisto.
          </p>
        </div>
      ) : (
        <CitasClient 
          citas={citas || []} 
          pacientesConHistoria={Object.fromEntries(pacientesConHistoria)} 
        />
      )}
    </div>
  )
}
