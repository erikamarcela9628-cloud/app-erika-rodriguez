'use server'

import { headers } from 'next/headers'
import crypto from 'crypto'
import { supabaseServer } from '@/lib/supabaseServer'

export async function registrarFirmaAction({
  tokenContrato,
  contratoId,
  firmante = 'paciente_1',
  signatureBase64,
}: {
  tokenContrato: string
  contratoId?: string
  firmante?: 'paciente_1' | 'paciente_2' | 'tutor_1' | 'tutor_2' | 'menor_asentimiento'
  signatureBase64: string
}) {
  if (!tokenContrato || !signatureBase64) {
    return { success: false, error: 'Firma o identificador de contrato inválido.' }
  }

  try {
    // 1. Validar el contrato asociado al token
    const { data: contrato, error: errC } = await supabaseServer
      .from('contratos')
      .select('id, modalidad_atencion, estado, metadata')
      .eq('token_acceso', tokenContrato)
      .single()

    if (errC || !contrato) {
      return { success: false, error: 'Contrato no encontrado o enlace inválido.' }
    }

    if (contrato.estado === 'firmado') {
      return { success: false, error: 'Este contrato ya se encuentra firmado en su totalidad.' }
    }

    // 2. Extraer IP real y User Agent desde headers de la petición HTTP en el servidor
    const headerList = await headers()
    const forwardedFor = headerList.get('x-forwarded-for')
    const realIp = headerList.get('x-real-ip')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '0.0.0.0')
    const userAgent = headerList.get('user-agent') || 'Desconocido'
    const timestamp = new Date().toISOString()

    // 3. Generar hash criptográfico SHA-256 de trazabilidad legal e inalterabilidad
    const hashData = `${tokenContrato}-${timestamp}-${clientIp}-${userAgent}-${signatureBase64}`
    const hashSha256 = crypto.createHash('sha256').update(hashData).digest('hex')

    // 4. Procesar y guardar la imagen en el bucket privado 'firmas-contratos'
    const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `firma_${tokenContrato}_${Date.now()}.png`

    const { data: uploadData, error: uploadError } = await supabaseServer
      .storage
      .from('firmas-contratos')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('Error subiendo imagen de firma a storage:', uploadError)
      return { success: false, error: 'Error al almacenar el archivo de la firma.' }
    }

    const filePath = uploadData.path

    // 5. Insertar registro forense en firmas_trazabilidad
    const { error: insertError } = await supabaseServer
      .from('firmas_trazabilidad')
      .insert({
        contrato_id: contrato.id,
        token_contrato: tokenContrato,
        hash_firma: hashSha256,
        hash_sha256: hashSha256,
        ip_cliente: clientIp,
        ip_origen: clientIp,
        user_agent: userAgent,
        fecha_firma: timestamp,
        archivo_firma_url: filePath,
        firma_storage_path: filePath,
        firmado_por: firmante
      })

    if (insertError) {
      console.error('Error registrando trazabilidad de firma:', insertError)
      return { success: false, error: 'Error al registrar la trazabilidad de la firma.' }
    }

    // 6. Verificar si todas las firmas requeridas están completas para actualizar el estado
    const { data: firmas } = await supabaseServer
      .from('firmas_trazabilidad')
      .select('id')
      .eq('contrato_id', contrato.id)

    const cantidadFirmas = firmas?.length || 1
    const requeridas = contrato.metadata?.firmas_requeridas || (contrato.modalidad_atencion === 'Pareja' ? 2 : 1)

    if (cantidadFirmas >= requeridas) {
      await supabaseServer
        .from('contratos')
        .update({ estado: 'firmado' })
        .eq('id', contrato.id)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error en registrarFirmaAction:', error)
    return { success: false, error: error?.message || 'Error interno del servidor procesando la firma.' }
  }
}
