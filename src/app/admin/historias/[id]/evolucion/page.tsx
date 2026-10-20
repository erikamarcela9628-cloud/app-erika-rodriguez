import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import GenerarInformeBtn from './GenerarInformeBtn'
import TareasHistorialClient from './TareasHistorialClient'
import ControlSaldosClient from './ControlSaldosClient'
import EditarEvolucionModal from './EditarEvolucionModal'
import NuevaEvolucionForm from './NuevaEvolucionForm'

export const metadata = {
  title: 'Evoluciones Terapéuticas | Psicóloga Erika Rodríguez',
}

export default async function EvolucionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener historia y paciente
  const { data: historia, error } = await supabaseServer
    .from('historias_clinicas')
    .select('id, paciente_id, datos_demograficos, acudiente, pacientes(nombre_completo, numero_documento, telefono)')
    .eq('id', id)
    .single()

  const esPareja = historia?.datos_demograficos?.modalidad === 'Pareja'

  if (error || !historia) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center font-sans">
        <h1 className="text-2xl font-bold">Historia no encontrada</h1>
        <Link href="/admin/historias">&larr; Volver</Link>
      </div>
    )
  }

  // Obtener evoluciones
  const { data: evoluciones } = await supabaseServer
    .from('evoluciones_clinicas')
    .select('*')
    .eq('historia_clinica_id', historia.id)
    .order('numero_sesion', { ascending: false })

  // Obtener vista_saldo_paquetes
  const { data: vistaSaldo } = await supabaseServer
    .from('vista_saldo_paquetes')
    .select('*')
    .eq('paciente_id', historia.paciente_id)
    .maybeSingle()

  const numSiguienteSesion = (evoluciones?.length || 0) + 1
  const sesionPaqueteSiguiente = vistaSaldo ? vistaSaldo.sesiones_consumidas + 1 : numSiguienteSesion

  const ultimaEvolucion = evoluciones?.[0]
  const tareasPrevias = ultimaEvolucion?.tareas_casa ? (typeof ultimaEvolucion.tareas_casa === 'string' ? JSON.parse(ultimaEvolucion.tareas_casa) : ultimaEvolucion.tareas_casa) : []

  const pacienteTelefonoBase = (historia.pacientes as any)?.telefono || (historia.acudiente as any)?.telefono || ''
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evoluciones Terapéuticas</h1>
          <p className="mt-1 text-sm text-gray-500">Paciente: {(historia.pacientes as any)?.nombre_completo}</p>
        </div>
        <Link href={`/admin/historias/${historia.id}`} className="text-sm font-medium text-[#0e787a] hover:underline">
          &larr; Volver a la Historia
        </Link>
      </div>

      <ControlSaldosClient 
        vistaSaldo={vistaSaldo} 
        pacienteTelefono={pacienteTelefonoBase} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Formulario de Nueva Evolución con Protección Offline y Autoguardado */}
        <div className="md:col-span-1">
          <NuevaEvolucionForm
            historiaId={historia.id}
            pacienteId={historia.paciente_id}
            numSiguienteSesion={numSiguienteSesion}
            sesionPaqueteSiguiente={sesionPaqueteSiguiente}
            contratoId={vistaSaldo?.contrato_id || null}
            vistaSaldo={vistaSaldo}
            esPareja={esPareja}
            ultimaEvolucion={ultimaEvolucion}
            tareasPrevias={tareasPrevias}
            pacienteNombre={(historia.pacientes as any)?.nombre_completo || ''}
            pacienteTelefonoBase={pacienteTelefonoBase}
            evolucionesRecientes={evoluciones?.slice(0, 2) || []}
            motivoConsulta={(historia as any)?.anamnesis?.motivo_consulta || (historia as any)?.motivo_consulta || ''}
          />
        </div>

        {/* Historial de Evoluciones */}
        <div className="md:col-span-2 space-y-6">
          <GenerarInformeBtn evoluciones={evoluciones || []} />
          
          <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Historial de Sesiones</h2>
          {evoluciones?.length === 0 ? (
            <p className="text-gray-500">No hay sesiones registradas.</p>
          ) : (
            evoluciones?.map(evol => (
              <div key={evol.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#224252]">Sesión N° {evol.numero_sesion}</h3>
                    <EditarEvolucionModal evolucion={evol} esPareja={evol.asistente_sesion !== null} />
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block" suppressHydrationWarning>{new Date(evol.fecha_sesion).toLocaleString('es-CO')}</span>
                    {evol.asistente_sesion && (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                        Atención: {evol.asistente_sesion}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 block">Evolución:</span>
                    <p className="whitespace-pre-wrap mt-1 text-gray-600">{evol.evolucion_terapeutica}</p>
                  </div>
                  {evol.observaciones_valoracion && (
                    <div>
                      <span className="font-semibold text-gray-700 block">Observaciones:</span>
                      <p className="whitespace-pre-wrap mt-1 text-gray-600">{evol.observaciones_valoracion}</p>
                    </div>
                  )}
                  {evol.diagnostico_cie10 && (
                    <div className="inline-block bg-gray-100 rounded px-2 py-1">
                      <span className="font-semibold text-gray-700">CIE-10:</span> {evol.diagnostico_cie10}
                    </div>
                  )}
                </div>
                
                <TareasHistorialClient
                  evolucionId={evol.id}
                  tareasIniciales={evol.tareas_casa ? (typeof evol.tareas_casa === 'string' ? JSON.parse(evol.tareas_casa) : evol.tareas_casa) : []}
                  pacienteNombre={(historia.pacientes as any)?.nombre_completo || ''}
                  pacienteTelefono={pacienteTelefonoBase}
                />
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  )
}
