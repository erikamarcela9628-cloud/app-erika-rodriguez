'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

export async function registrarPago(formData: FormData) {
  const paciente_id = formData.get('paciente_id') as string
  const monto = parseFloat(formData.get('monto') as string)
  const metodo_pago = formData.get('metodo_pago') as string
  const referencia = formData.get('referencia') as string
  const concepto = formData.get('concepto') as string
  const notas = formData.get('notas') as string

  const es_menor = formData.get('es_menor') === 'true'
  const pagador_nombre = formData.get('pagador_nombre') as string
  const pagador_cedula = formData.get('pagador_cedula') as string
  const menor_nombre = formData.get('menor_nombre') as string

  // Generar ID de Recibo único: REC-YYYYMM-XXXX
  const date = new Date()
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase() // 4 caracteres hexadecimales
  const numero_recibo = `REC-${yearMonth}-${randomSuffix}`

  const contrato_id = formData.get('contrato_id') as string

  const { error } = await supabaseServer
    .from('pagos')
    .insert({
      paciente_id,
      contrato_id: contrato_id || null,
      monto,
      metodo_pago,
      referencia: referencia || null,
      concepto,
      notas: notas || null,
      numero_recibo,
      es_menor,
      pagador_nombre: pagador_nombre || null,
      pagador_cedula: pagador_cedula || null,
      menor_nombre: menor_nombre || null,
    })

  if (error) {
    console.error('Error registrando pago:', error)
    // Para simplificar, en caso de error podríamos redirigir a una página de error o lanzar una excepción,
    // pero idealmente se usaría useFormState en la UI para mostrar el mensaje de error.
    throw new Error(`No se pudo registrar el pago. ${error.message}`)
  }

  // Redirigir de vuelta al listado
  redirect('/admin/pagos')
}
