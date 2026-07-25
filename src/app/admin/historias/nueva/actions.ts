'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
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
    personales_familiares: formData.get('antecedentes.personales_familiares')
  }

  const anamnesis = {
    motivo_consulta: formData.get('anamnesis.motivo_consulta'),
    definicion_problema: formData.get('anamnesis.definicion_problema'),
    vinculos: formData.get('anamnesis.vinculos')
  }

  const datos_demograficos = {
    fecha_nacimiento: formData.get('datos_demograficos.fecha_nacimiento') || null,
    edad_atencion_anos: formData.get('datos_demograficos.edad_atencion_anos') || null,
    edad_atencion_meses: formData.get('datos_demograficos.edad_atencion_meses') || null,
    genero: formData.get('datos_demograficos.genero') || null,
    estado_civil: formData.get('datos_demograficos.estado_civil') || null,
    municipio_residencia: formData.get('datos_demograficos.municipio_residencia') || null,
    es_estudiante: formData.get('datos_demograficos.es_estudiante') === 'true',
    es_remitido_colegio: formData.get('datos_demograficos.es_remitido_colegio') === 'true',
    institucion_remite: formData.get('datos_demograficos.institucion_remite') || null
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
    consciencia_enfermedad: formData.get('examen_mental.consciencia_enfermedad')
  }

  const analisis_diagnostico = {
    analisis: formData.get('analisis_diagnostico.analisis'),
    cie10: formData.get('analisis_diagnostico.cie10'),
    tipo_tratamiento: formData.get('analisis_diagnostico.tipo_tratamiento'),
    plan: formData.get('analisis_diagnostico.plan')
  }

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
      throw new Error('No se pudo guardar la historia clínica: ' + error.message)
    }

    revalidatePath('/admin/historias')
    redirect('/admin/historias/' + data.id + '/evolucion')
  } catch (error: any) {
    console.error('Error guardando HC:', error)
    throw error
  }
}
