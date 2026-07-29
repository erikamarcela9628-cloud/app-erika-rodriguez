'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function guardarHistoriaClinica(formData: FormData) {
  const paciente_id = formData.get('paciente_id') as string

  const acudiente = {
    nombre: formData.get('acudiente.nombre'),
    parentesco: formData.get('acudiente.parentesco'),
    telefono: formData.get('acudiente.telefono'),
    direccion: formData.get('acudiente.direccion')
  }

  const eps = {
    nombre: formData.get('eps.nombre'),
    regimen: formData.get('eps.regimen'),
    tipo_afiliado: formData.get('eps.tipo_afiliado')
  }

  const antecedentes = {
    personales_familiares: formData.get('antecedentes.personales_familiares'),
    paciente_a: {
      medicos: formData.get('antecedentes_a.medicos'),
      psiquiatricos: formData.get('antecedentes_a.psiquiatricos'),
      tratamientos: formData.get('antecedentes_a.tratamientos'),
      sustancias: formData.get('antecedentes_a.sustancias'),
    },
    paciente_b: {
      medicos: formData.get('antecedentes_b.medicos'),
      psiquiatricos: formData.get('antecedentes_b.psiquiatricos'),
      tratamientos: formData.get('antecedentes_b.tratamientos'),
      sustancias: formData.get('antecedentes_b.sustancias'),
    }
  }

  const anamnesis = {
    motivo_consulta: formData.get('anamnesis.motivo_consulta'),
    motivo_consulta_a: formData.get('anamnesis.motivo_consulta_a'),
    motivo_consulta_b: formData.get('anamnesis.motivo_consulta_b'),
    discrepancias: formData.get('anamnesis.discrepancias'),
    definicion_problema: formData.get('anamnesis.definicion_problema'),
    vinculos: formData.get('anamnesis.vinculos'),
    dinamica_historia_relacion: formData.get('anamnesis.dinamica_historia_relacion'),
    dinamica_comunicacion: formData.get('anamnesis.dinamica_comunicacion'),
    dinamica_intimidad: formData.get('anamnesis.dinamica_intimidad'),
    dinamica_roles: formData.get('anamnesis.dinamica_roles'),
    dinamica_expectativas: formData.get('anamnesis.dinamica_expectativas')
  }

  const datos_demograficos = {
    modalidad: formData.get('datos_demograficos.modalidad') || 'Individual',
    fecha_nacimiento: formData.get('datos_demograficos.fecha_nacimiento') || null,
    edad_atencion_anos: formData.get('datos_demograficos.edad_atencion_anos') || null,
    edad_atencion_meses: formData.get('datos_demograficos.edad_atencion_meses') || null,
    genero: formData.get('datos_demograficos.genero') || null,
    estado_civil: formData.get('datos_demograficos.estado_civil') || null,
    municipio_residencia: formData.get('datos_demograficos.municipio_residencia') || null,
    es_estudiante: formData.get('datos_demograficos.es_estudiante') === 'true',
    es_remitido_colegio: formData.get('datos_demograficos.es_remitido_colegio') === 'true',
    institucion_remite: formData.get('datos_demograficos.institucion_remite') || null,
    paciente_b_nombre: formData.get('datos_demograficos.paciente_b_nombre'),
    paciente_b_documento: formData.get('datos_demograficos.paciente_b_documento'),
    paciente_b_edad: formData.get('datos_demograficos.paciente_b_edad'),
    paciente_b_ocupacion: formData.get('datos_demograficos.paciente_b_ocupacion'),
    paciente_b_telefono: formData.get('datos_demograficos.paciente_b_telefono'),
    paciente_b_eps: formData.get('datos_demograficos.paciente_b_eps'),
    relacion_tiempo: formData.get('datos_demograficos.relacion_tiempo'),
    relacion_estado_legal: formData.get('datos_demograficos.relacion_estado_legal'),
    relacion_hijos: formData.get('datos_demograficos.relacion_hijos')
  }

  const examen_mental = {
    aspecto_fisico: formData.get('examen_mental.aspecto_fisico'),
    actitud: formData.get('examen_mental.actitud'),
    consciencia: formData.get('examen_mental.consciencia'),
    lenguaje: formData.get('examen_mental.lenguaje'),
    orientacion: formData.get('examen_mental.orientacion'),
    sensopercepcion: formData.get('examen_mental.sensopercepcion'),
    pensamiento: formData.get('examen_mental.pensamiento'),
    afectividad: formData.get('examen_mental.afectividad'),
    nivel_riesgo_suicida: formData.get('examen_mental.nivel_riesgo_suicida'),
    consciencia_enfermedad: formData.get('examen_mental.consciencia_enfermedad'),
    paciente_a: {
      aspecto_fisico: formData.get('examen_mental_a.aspecto_fisico'),
      actitud: formData.get('examen_mental_a.actitud'),
      consciencia: formData.get('examen_mental_a.consciencia'),
      lenguaje: formData.get('examen_mental_a.lenguaje'),
      orientacion: formData.get('examen_mental_a.orientacion'),
      sensopercepcion: formData.get('examen_mental_a.sensopercepcion'),
      pensamiento: formData.get('examen_mental_a.pensamiento'),
      afectividad: formData.get('examen_mental_a.afectividad'),
      nivel_riesgo_suicida: formData.get('examen_mental_a.nivel_riesgo_suicida'),
      consciencia_enfermedad: formData.get('examen_mental_a.consciencia_enfermedad'),
    },
    paciente_b: {
      aspecto_fisico: formData.get('examen_mental_b.aspecto_fisico'),
      actitud: formData.get('examen_mental_b.actitud'),
      consciencia: formData.get('examen_mental_b.consciencia'),
      lenguaje: formData.get('examen_mental_b.lenguaje'),
      orientacion: formData.get('examen_mental_b.orientacion'),
      sensopercepcion: formData.get('examen_mental_b.sensopercepcion'),
      pensamiento: formData.get('examen_mental_b.pensamiento'),
      afectividad: formData.get('examen_mental_b.afectividad'),
      nivel_riesgo_suicida: formData.get('examen_mental_b.nivel_riesgo_suicida'),
      consciencia_enfermedad: formData.get('examen_mental_b.consciencia_enfermedad'),
    },
    riesgo_vif: formData.get('examen_mental.riesgo_vif') === 'true'
  }

  const analisis_diagnostico = {
    analisis: formData.get('analisis_diagnostico.analisis'),
    cie10: formData.get('analisis_diagnostico.cie10'),
    tipo_tratamiento: formData.get('analisis_diagnostico.tipo_tratamiento'),
    plan: formData.get('analisis_diagnostico.plan')
  }

  if (!paciente_id) return { success: false, error: 'El paciente es obligatorio.' }
  if (!datos_demograficos.fecha_nacimiento) return { success: false, error: 'La fecha de nacimiento es obligatoria.' }

  try {
    // Insertar en Supabase
    const { data, error } = await supabaseServer
      .from('historias_clinicas')
      .insert({
        paciente_id,
        acudiente,
        eps,
        antecedentes,
        anamnesis,
        examen_mental,
        analisis_diagnostico,
        datos_demograficos
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error guardando HC (Supabase):', error)
      return { success: false, error: 'No se pudo guardar la historia clínica: ' + error.message }
    }

    revalidatePath('/admin/historias')
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Error guardando HC:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

export async function actualizarHistoriaClinica(id: string, formData: FormData) {
  const paciente_id = formData.get('paciente_id') as string

  const acudiente = {
    nombre: formData.get('acudiente.nombre'),
    parentesco: formData.get('acudiente.parentesco'),
    telefono: formData.get('acudiente.telefono'),
    direccion: formData.get('acudiente.direccion')
  }

  const eps = {
    nombre: formData.get('eps.nombre'),
    regimen: formData.get('eps.regimen'),
    tipo_afiliado: formData.get('eps.tipo_afiliado')
  }

  const antecedentes = {
    personales_familiares: formData.get('antecedentes.personales_familiares'),
    personales_a: formData.get('antecedentes.personales_a'),
    personales_b: formData.get('antecedentes.personales_b')
  }

  const anamnesis = {
    motivo_consulta: formData.get('anamnesis.motivo_consulta'),
    motivo_consulta_a: formData.get('anamnesis.motivo_consulta_a'),
    motivo_consulta_b: formData.get('anamnesis.motivo_consulta_b'),
    discrepancias: formData.get('anamnesis.discrepancias'),
    definicion_problema: formData.get('anamnesis.definicion_problema'),
    vinculos: formData.get('anamnesis.vinculos'),
    dinamica_historia_relacion: formData.get('anamnesis.dinamica_historia_relacion'),
    dinamica_comunicacion: formData.get('anamnesis.dinamica_comunicacion'),
    dinamica_intimidad: formData.get('anamnesis.dinamica_intimidad'),
    dinamica_roles: formData.get('anamnesis.dinamica_roles'),
    dinamica_expectativas: formData.get('anamnesis.dinamica_expectativas')
  }

  const datos_demograficos = {
    modalidad: formData.get('datos_demograficos.modalidad') || 'Individual',
    fecha_nacimiento: formData.get('datos_demograficos.fecha_nacimiento') || null,
    edad_atencion_anos: formData.get('datos_demograficos.edad_atencion_anos') || null,
    edad_atencion_meses: formData.get('datos_demograficos.edad_atencion_meses') || null,
    genero: formData.get('datos_demograficos.genero') || null,
    estado_civil: formData.get('datos_demograficos.estado_civil') || null,
    municipio_residencia: formData.get('datos_demograficos.municipio_residencia') || null,
    es_estudiante: formData.get('datos_demograficos.es_estudiante') === 'true',
    es_remitido_colegio: formData.get('datos_demograficos.es_remitido_colegio') === 'true',
    institucion_remite: formData.get('datos_demograficos.institucion_remite') || null,
    paciente_b_nombre: formData.get('datos_demograficos.paciente_b_nombre'),
    paciente_b_documento: formData.get('datos_demograficos.paciente_b_documento'),
    paciente_b_edad: formData.get('datos_demograficos.paciente_b_edad'),
    paciente_b_ocupacion: formData.get('datos_demograficos.paciente_b_ocupacion'),
    paciente_b_telefono: formData.get('datos_demograficos.paciente_b_telefono'),
    paciente_b_email: formData.get('datos_demograficos.paciente_b_email'),
    paciente_b_eps: formData.get('datos_demograficos.paciente_b_eps'),
    relacion_tiempo: formData.get('datos_demograficos.relacion_tiempo'),
    relacion_estado_legal: formData.get('datos_demograficos.relacion_estado_legal'),
    relacion_hijos: formData.get('datos_demograficos.relacion_hijos')
  }

  const examen_mental = {
    aspecto_fisico: formData.get('examen_mental.aspecto_fisico'),
    actitud: formData.get('examen_mental.actitud'),
    consciencia: formData.get('examen_mental.consciencia'),
    lenguaje: formData.get('examen_mental.lenguaje'),
    orientacion: formData.get('examen_mental.orientacion'),
    sensopercepcion: formData.get('examen_mental.sensopercepcion'),
    pensamiento: formData.get('examen_mental.pensamiento'),
    afectividad: formData.get('examen_mental.afectividad'),
    nivel_riesgo_suicida: formData.get('examen_mental.nivel_riesgo_suicida'),
    consciencia_enfermedad: formData.get('examen_mental.consciencia_enfermedad'),
    riesgo_vif: formData.get('examen_mental.riesgo_vif') === 'true'
  }

  const analisis_diagnostico = {
    analisis: formData.get('analisis_diagnostico.analisis'),
    cie10: formData.get('analisis_diagnostico.cie10'),
    tipo_tratamiento: formData.get('analisis_diagnostico.tipo_tratamiento'),
    plan: formData.get('analisis_diagnostico.plan')
  }

  if (!paciente_id) return { success: false, error: 'El paciente es obligatorio.' }
  if (!datos_demograficos.fecha_nacimiento) return { success: false, error: 'La fecha de nacimiento es obligatoria.' }

  try {
    const { error } = await supabaseServer
      .from('historias_clinicas')
      .update({
        paciente_id,
        acudiente,
        eps,
        antecedentes,
        anamnesis,
        examen_mental,
        analisis_diagnostico,
        datos_demograficos,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error actualizando HC (Supabase):', error)
      return { success: false, error: 'No se pudo actualizar la historia clínica: ' + error.message }
    }

    revalidatePath('/admin/historias')
    revalidatePath(`/admin/historias/${id}`)
    return { success: true, id }
  } catch (error: any) {
    console.error('Error actualizando HC:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

