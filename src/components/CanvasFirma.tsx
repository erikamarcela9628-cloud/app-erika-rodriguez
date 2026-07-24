'use client'

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { supabase } from '@/lib/supabase'
import CryptoJS from 'crypto-js'

interface CanvasFirmaProps {
  tokenContrato: string;
  firmante?: 'paciente_1' | 'paciente_2';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CanvasFirma({ tokenContrato, firmante = 'paciente_1', onSuccess, onError }: CanvasFirmaProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [ipData, setIpData] = useState<string>('unknown')

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpData(data.ip))
      .catch(() => setIpData('0.0.0.0'))
  }, [])

  const clear = () => {
    sigCanvas.current?.clear()
  }

  const saveSignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
      onError?.('Por favor, ingresa tu firma.')
      return
    }

    setIsSaving(true)

    try {
      // Obtener imagen en base64
      const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
      if (!signatureDataUrl) throw new Error('Error al generar la imagen de la firma')

      const timestamp = new Date().toISOString()
      const userAgent = navigator.userAgent

      // Generar Hash SHA-256 para inalterabilidad
      const hashData = `${tokenContrato}-${timestamp}-${ipData}-${userAgent}-${signatureDataUrl}`
      const hash = CryptoJS.SHA256(hashData).toString()

      // Convertir base64 a Blob para subirlo a Supabase en el navegador
      const fetchResponse = await fetch(signatureDataUrl)
      const blob = await fetchResponse.blob()
      const fileName = `firma_${tokenContrato}_${Date.now()}.png`

      // Subir al bucket privado 'firmas-contratos'
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('firmas-contratos')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })
      if (uploadError) {
        throw new Error(`Error al subir firma: ${uploadError.message || 'Error desconocido'}`)
      }
      // Obtener ruta del archivo
      const fileUrl = uploadData.path

      // Obtener el contrato_id asociado a este token
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .select('id')
        .eq('token_acceso', tokenContrato)
        .single()

      if (contratoError || !contratoData) {
        throw new Error(`Error al obtener el contrato: ${contratoError?.message || 'Contrato no encontrado'}`)
      }

      // Registrar en la tabla firmas_trazabilidad
      const ipOrigen = ipData || '0.0.0.0'
      const { error: dbError } = await supabase
        .from('firmas_trazabilidad')
        .insert({
          contrato_id: contratoData.id,
          token_contrato: tokenContrato,
          hash_firma: hash,
          hash_sha256: hash,
          ip_cliente: ipOrigen,
          ip_origen: ipOrigen,
          user_agent: userAgent,
          fecha_firma: timestamp,
          archivo_firma_url: fileUrl,
          firma_storage_path: fileUrl,
          firmado_por: firmante
        })
      if (dbError) {
        throw new Error(`Error en base de datos: ${dbError.message || dbError.details || 'Error desconocido'}`)
      }
      onSuccess?.()
    } catch (err: any) {
      console.error('Error detallado:', err)
      onError?.(err.message || 'Ocurrió un error al procesar tu firma')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden touch-none relative">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 sm:h-64 cursor-crosshair'
          }}
          backgroundColor="rgba(255,255,255,1)"
          penColor="#0f172a"
        />
        <div className="absolute bottom-2 right-3 pointer-events-none opacity-40 text-xs text-gray-500">
          Firma aquí
        </div>
      </div>
      <div className="flex w-full gap-3 mt-4">
        <button
          onClick={clear}
          disabled={isSaving}
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Limpiar
        </button>
        <button
          onClick={saveSignature}
          disabled={isSaving}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#0e787a] rounded-lg hover:bg-[#224252] transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSaving ? 'Procesando...' : 'Confirmar Firma'}
        </button>
      </div>
    </div>
  )
}
