'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import crypto from 'crypto'

export async function crearContrato(formData: FormData) {
  try {
    const nombre_paciente = formData.get('nombre_paciente') as string
    const tipo_documento = formData.get('tipo_documento') as string
    const numero_documento = formData.get('numero_documento') as string
    const email_paciente = formData.get('email_paciente') as string
    const telefono_paciente = formData.get('telefono_paciente') as string
    
    const modalidad_atencion = formData.get('modalidad_atencion') as string || 'Individual'
    const nombre_paciente_2 = formData.get('nombre_paciente_2') as string
    const tipo_documento_2 = formData.get('tipo_documento_2') as string
    const numero_documento_2 = formData.get('numero_documento_2') as string
    const email_paciente_2 = formData.get('email_paciente_2') as string
    const telefono_paciente_2 = formData.get('telefono_paciente_2') as string

    const tipo_servicio = formData.get('tipo_servicio') as string
    const cantidad_sesiones = parseInt(formData.get('cantidad_sesiones') as string, 10)
    const valor_total_cop = parseFloat(formData.get('valor_total_cop') as string)
    const ciudad = formData.get('ciudad') as string

    // 1. Buscar o Crear Paciente 1
    let paciente_id: string

    const { data: p1Existente, error: errorP1 } = await supabaseServer
      .from('pacientes')
      .select('id')
      .eq('numero_documento', numero_documento)
      .single()

    if (p1Existente) {
      paciente_id = p1Existente.id
      await supabaseServer.from('pacientes').update({
        nombre_completo: nombre_paciente,
        tipo_documento,
        email: email_paciente,
        telefono: telefono_paciente
      }).eq('id', paciente_id)
    } else {
      const { data: p1Nuevo, error: errC1 } = await supabaseServer
        .from('pacientes')
        .insert({
          nombre_completo: nombre_paciente,
          tipo_documento,
          numero_documento,
          email: email_paciente,
          telefono: telefono_paciente
        })
        .select('id')
        .single()
      
      if (errC1 || !p1Nuevo) throw new Error(`Error al crear paciente 1: ${errC1?.message}`)
      paciente_id = p1Nuevo.id
    }

    // Buscar o Crear Paciente 2 (Si es pareja)
    let paciente_2_id: string | null = null
    if (modalidad_atencion === 'Pareja') {
      const { data: p2Existente } = await supabaseServer
        .from('pacientes')
        .select('id')
        .eq('numero_documento', numero_documento_2)
        .single()

      if (p2Existente) {
        paciente_2_id = p2Existente.id
        await supabaseServer.from('pacientes').update({
          nombre_completo: nombre_paciente_2,
          tipo_documento: tipo_documento_2,
          email: email_paciente_2,
          telefono: telefono_paciente_2
        }).eq('id', paciente_2_id)
      } else {
        const { data: p2Nuevo, error: errC2 } = await supabaseServer
          .from('pacientes')
          .insert({
            nombre_completo: nombre_paciente_2,
            tipo_documento: tipo_documento_2,
            numero_documento: numero_documento_2,
            email: email_paciente_2,
            telefono: telefono_paciente_2
          })
          .select('id')
          .single()
        
        if (errC2 || !p2Nuevo) throw new Error(`Error al crear paciente 2: ${errC2?.message}`)
        paciente_2_id = p2Nuevo.id
      }
    }

    // 2. Generar Token y Texto Legal
    const token_acceso = crypto.randomUUID()
    const fecha_actual = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    const valorFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor_total_cop)

    const introLegal = modalidad_atencion === 'Pareja'
      ? `y los pacientes ${nombre_paciente}, identificado/a con ${tipo_documento} No. ${numero_documento}, y ${nombre_paciente_2}, identificado/a con ${tipo_documento_2} No. ${numero_documento_2}, en adelante 'Los Pacientes'`
      : `y el/la paciente ${nombre_paciente}, identificado/a con ${tipo_documento} No. ${numero_documento}, en adelante 'El/La Paciente'`

    const term = modalidad_atencion === 'Pareja' ? 'Los Pacientes' : 'El/La Paciente'
    const termCompromete = modalidad_atencion === 'Pareja' ? 'Los Pacientes se comprometen' : 'El/La Paciente se compromete'
    const termConjugacion = modalidad_atencion === 'Pareja' ? 'sinceros/as' : 'sincero/a'

    const contenido_legal = `Contrato Terapéutico de Psicología

La profesional en psicología Erika Marcela Rodríguez López, identificada con cédula de ciudadanía No. 1.121.933.244 y tarjeta profesional No. 244628, en adelante 'La Psicóloga', ${introLegal}, celebran el presente contrato terapéutico de acuerdo a las siguientes cláusulas:

Primera. Objeto del Contrato
El objeto del presente contrato es establecer las condiciones bajo las cuales se llevará a cabo la intervención psicológica en el consultorio de la Psicóloga, conforme a las leyes de la República de Colombia y al Código Deontológico y Bioético del Psicólogo en Colombia (Ley 1090 de 2006).

Segunda. Confidencialidad
La Psicóloga se compromete a mantener la confidencialidad de la información suministrada por ${term} en las sesiones terapéuticas, de acuerdo con lo establecido en la Ley 1090 de 2006 y la Ley 1581 de 2012 (Protección de Datos Personales). Solo se podrá divulgar información con el consentimiento expreso de ${term} o en situaciones que involucren riesgo para la vida o la integridad física de terceras personas.

Tercera. Duración y Frecuencia de las Sesiones
El proceso terapéutico tendrá una duración indefinida y su terminación dependerá del acuerdo mutuo entre La Psicóloga y ${term}. Las sesiones se realizarán con la frecuencia acordada y cada una tendrá una duración de aproximadamente 60 minutos.

Cuarta. Honorarios y Modalidades de Pago
El costo correspondiente al servicio de ${tipo_servicio} (${cantidad_sesiones} sesión/es) será de ${valorFormateado}, que ${termCompromete} a pagar con anterioridad para dar apertura a su proceso psicoterapéutico. Los pagos podrán realizarse en efectivo, transferencia bancaria o por medios electrónicos acordados con La Psicóloga. En caso de requerir reprogramación o cancelación de una sesión, deberá ser notificado con al menos 24 horas de antelación, de lo contrario, se cobrará el 50% del valor de la sesión.

Quinta. Compromisos de las Partes
La Psicóloga se compromete a:
a) Proporcionar un servicio de atención psicológica conforme a los estándares éticos y profesionales.
b) Cumplir con el horario acordado para las sesiones.
c) Mantener el respeto y la neutralidad en la relación terapéutica.

${termCompromete} a:
a) Asistir puntualmente a las sesiones.
b) Ser ${termConjugacion} en el proceso terapéutico y aportar la información necesaria para el tratamiento.
c) Pagar oportunamente los honorarios acordados.

Sexta. Terminación del Contrato
Este contrato podrá darse por terminado en cualquier momento por mutuo acuerdo de las partes, o unilateralmente por cualquiera de ellas, informando a la otra parte con al menos 48 horas de anticipación. También se dará por terminado en caso de incumplimiento grave de las obligaciones aquí establecidas.

Séptima. Resolución de Conflictos
Cualquier controversia surgida en relación con este contrato será resuelta de manera amigable entre las partes. En caso de no llegar a un acuerdo, las partes acudirán a los mecanismos de resolución de conflictos establecidos por la ley colombiana.

Octava. Modificaciones al Contrato
Cualquier modificación a los términos del presente contrato deberá ser acordada por ambas partes y formalizada por escrito.

Novena. Legislación Aplicable
El presente contrato se rige por las leyes de la República de Colombia, en especial por lo dispuesto en la Ley 1090 de 2006.

En constancia de lo anterior, firman en señal de aceptación, en la ciudad de ${ciudad}, a los ${fecha_actual}.`

    // 3. Insertar Contrato
    const { error: errorContrato } = await supabaseServer
      .from('contratos')
      .insert({
        paciente_id,
        paciente_2_id,
        modalidad_atencion,
        titulo: `Consentimiento Informado - ${nombre_paciente}${modalidad_atencion === 'Pareja' ? ` y ${nombre_paciente_2}` : ''}`,
        tipo_servicio,
        cantidad_sesiones,
        valor_total: valor_total_cop,
        ciudad,
        contenido_texto: contenido_legal,
        token_acceso,
        estado: 'pendiente'
      })

    if (errorContrato) {
      throw new Error(`Error al crear contrato: ${errorContrato.message}`)
    }

    return { success: true, token: token_acceso, telefono: telefono_paciente }

  } catch (error: any) {
    console.error('Error en Server Action crearContrato:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
