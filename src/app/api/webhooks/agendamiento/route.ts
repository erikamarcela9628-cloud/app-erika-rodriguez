import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-webhook-secret')
    const body = await request.json().catch(() => ({}))
    
    // Validar token de seguridad (definido en env o fallback seguro)
    const expectedSecret = process.env.AGENDAMIENTO_WEBHOOK_SECRET || 'erika-agendamiento-secret-2026'
    const providedSecret = authHeader || body.secret

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Secreto de webhook inválido.' },
        { status: 401 }
      )
    }

    const { action = 'agendar', paciente, cita } = body

    if (!paciente || !paciente.nombre) {
      return NextResponse.json(
        { success: false, error: 'Información de paciente requerida (nombre obligatorio).' },
        { status: 400 }
      )
    }

    // 1. Identificar o Registrar al Paciente en Supabase
    let pacienteId: string | null = null
    const telRaw = (paciente.telefono || '').replace(/\D/g, '')
    const telClean = telRaw.length > 10 ? telRaw.slice(-10) : telRaw // Últimos 10 dígitos (Colombia)

    if (telClean) {
      const { data: pacienteExistente } = await supabaseServer
        .from('pacientes')
        .select('id, nombre_completo')
        .ilike('telefono', `%${telClean}%`)
        .limit(1)
        .maybeSingle()

      if (pacienteExistente) {
        pacienteId = pacienteExistente.id
      }
    }

    if (!pacienteId && paciente.email) {
      const { data: pacientePorEmail } = await supabaseServer
        .from('pacientes')
        .select('id, nombre_completo')
        .eq('email', paciente.email.trim().toLowerCase())
        .limit(1)
        .maybeSingle()

      if (pacientePorEmail) {
        pacienteId = pacientePorEmail.id
      }
    }

    // Si aún no existe, lo creamos de forma automática
    if (!pacienteId) {
      const { data: nuevoPaciente, error: errCrearP } = await supabaseServer
        .from('pacientes')
        .insert({
          nombre_completo: paciente.nombre.trim(),
          telefono: paciente.telefono || '',
          email: paciente.email ? paciente.email.trim().toLowerCase() : null,
          tipo_documento: paciente.tipo_documento || 'CC',
          numero_documento: paciente.documento || null
        })
        .select('id')
        .single()

      if (errCrearP || !nuevoPaciente) {
        console.error('Error creando paciente desde webhook de agendamiento:', errCrearP)
        return NextResponse.json(
          { success: false, error: `Error creando paciente: ${errCrearP?.message}` },
          { status: 500 }
        )
      }
      pacienteId = nuevoPaciente.id
    }

    // 2. Procesar la Acción (agendar | reagendar | cancelar)
    const fecha = cita?.fecha
    const hora = cita?.hora
    const duracion = parseInt(cita?.duracion_minutos || '60', 10)
    const modalidad = cita?.modalidad || 'Presencial'
    const googleEventId = cita?.google_event_id || ''

    if (action === 'agendar') {
      if (!fecha || !hora) {
        return NextResponse.json(
          { success: false, error: 'Fecha y hora son obligatorias para agendar.' },
          { status: 400 }
        )
      }

      const fechaInicio = new Date(`${fecha}T${hora}:00`)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)

      let obsTexto = cita?.observaciones || ''
      if (googleEventId) {
        obsTexto = `${obsTexto} [GCal ID: ${googleEventId}]`.trim()
      }

      const { data: nuevaCita, error: errCita } = await supabaseServer
        .from('citas')
        .insert({
          paciente_id: pacienteId,
          tipo_evento: 'cita_clinica',
          titulo: cita?.titulo || `Consulta Psicológica - ${paciente.nombre}`,
          fecha,
          hora,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          duracion_minutos: duracion,
          modalidad,
          estado: 'Programada',
          observaciones: obsTexto
        })
        .select('id')
        .single()

      if (errCita) {
        console.error('Error insertando cita desde webhook:', errCita)
        return NextResponse.json(
          { success: false, error: `Error registrando cita: ${errCita.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cita agendada exitosamente',
        cita_id: nuevaCita.id,
        paciente_id: pacienteId
      })
    }

    if (action === 'reagendar') {
      if (!fecha || !hora) {
        return NextResponse.json(
          { success: false, error: 'Nueva fecha y hora requeridas para reagendar.' },
          { status: 400 }
        )
      }

      const fechaInicio = new Date(`${fecha}T${hora}:00`)
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000)

      // Buscar la cita por Google Event ID o por el paciente con estado Programada
      let query = supabaseServer.from('citas').select('id')
      if (googleEventId) {
        query = query.ilike('observaciones', `%${googleEventId}%`)
      } else {
        query = query.eq('paciente_id', pacienteId).eq('estado', 'Programada')
      }

      const { data: citasEncontradas } = await query.order('created_at', { ascending: false }).limit(1)

      if (!citasEncontradas || citasEncontradas.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se encontró una cita programada para reagendar.' },
          { status: 404 }
        )
      }

      const citaIdToUpdate = citasEncontradas[0].id

      const { error: errUpdate } = await supabaseServer
        .from('citas')
        .update({
          fecha,
          hora,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          duracion_minutos: duracion,
          modalidad,
          estado: 'Programada',
          updated_at: new Date().toISOString()
        })
        .eq('id', citaIdToUpdate)

      if (errUpdate) {
        return NextResponse.json(
          { success: false, error: `Error reagendando cita: ${errUpdate.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cita reagendada exitosamente en el sistema',
        cita_id: citaIdToUpdate
      })
    }

    if (action === 'cancelar') {
      let query = supabaseServer.from('citas').select('id')
      if (googleEventId) {
        query = query.ilike('observaciones', `%${googleEventId}%`)
      } else {
        query = query.eq('paciente_id', pacienteId).eq('estado', 'Programada')
      }

      const { data: citasEncontradas } = await query.order('created_at', { ascending: false }).limit(1)

      if (!citasEncontradas || citasEncontradas.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se encontró la cita para cancelar.' },
          { status: 404 }
        )
      }

      const citaIdToCancel = citasEncontradas[0].id

      const { error: errCancel } = await supabaseServer
        .from('citas')
        .update({
          estado: 'Cancelada',
          updated_at: new Date().toISOString()
        })
        .eq('id', citaIdToCancel)

      if (errCancel) {
        return NextResponse.json(
          { success: false, error: `Error cancelando cita: ${errCancel.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cita cancelada exitosamente',
        cita_id: citaIdToCancel
      })
    }

    return NextResponse.json(
      { success: false, error: `Acción no soportada: ${action}` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error general en webhook de agendamiento:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
