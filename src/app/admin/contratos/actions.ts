'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function obtenerFirmasContrato(contratoId: string) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const { data: firmas, error } = await supabaseServer
    .from('firmas_trazabilidad')
    .select('*')
    .eq('contrato_id', contratoId)

  if (error) {
    throw new Error(`Error al obtener firmas: ${error.message}`)
  }

  // Procesar y convertir firmas a base64 de manera segura en el servidor
  const firmasBase64: Record<string, string> = {}

  for (const firma of firmas || []) {
    const rawFirma = firma.firma_base64 || firma.imagen_firma || firma.url_firma || firma.archivo_firma_url || firma.firma_storage_path
    if (!rawFirma) continue

    if (rawFirma.startsWith('data:image/')) {
      firmasBase64[firma.firmado_por] = rawFirma
      continue
    }

    try {
      const cleanPath = rawFirma.startsWith('firmas-contratos/') 
        ? rawFirma.replace('firmas-contratos/', '') 
        : rawFirma

      const { data: fileData, error: downloadError } = await supabaseServer
        .storage
        .from('firmas-contratos')
        .download(cleanPath)

      if (!downloadError && fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        firmasBase64[firma.firmado_por] = `data:image/png;base64,${buffer.toString('base64')}`
      } else {
        // Fallback: URL firmada temporal de 5 minutos
        const { data: signed } = await supabaseServer
          .storage
          .from('firmas-contratos')
          .createSignedUrl(cleanPath, 300)
        if (signed?.signedUrl) {
          firmasBase64[firma.firmado_por] = signed.signedUrl
        }
      }
    } catch (e) {
      console.error(`Error procesando firma de ${firma.firmado_por}:`, e)
    }
  }

  return { firmas: firmas || [], firmasBase64 }
}
