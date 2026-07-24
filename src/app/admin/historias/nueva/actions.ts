'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

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

  const examen_mental = {
    aspecto_fisico: formData.get('examen_mental.aspecto_fisico'),
    actitud: formData.get('examen_mental.actitud'),
    consciencia: formData.get('examen_mental.consciencia'),
    lenguaje: formData.get('examen_mental.lenguaje'),
    orientacion: formData.get('examen_mental.orientacion'),
    sensopercepcion: formData.get('examen_mental.sensopercepcion'),
    pensamiento: formData.get('examen_mental.pensamiento'),
    afectividad: formData.get('examen_mental.afectividad'),
    riesgo_suicida: formData.get('examen_mental.riesgo_suicida'),
    consciencia_enfermedad: formData.get('examen_mental.consciencia_enfermedad')
  }

  const analisis_diagnostico = {
    analisis: formData.get('analisis_diagnostico.analisis'),
    cie10: formData.get('analisis_diagnostico.cie10'),
    tipo_tratamiento: formData.get('analisis_diagnostico.tipo_tratamiento'),
    plan: formData.get('analisis_diagnostico.plan')
  }

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
      analisis_diagnostico
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error guardando historia clínica:', error)
    throw new Error('No se pudo guardar la historia clínica: ' + error.message)
  }

  redirect('/admin/historias/' + data.id + '/evolucion')
}
