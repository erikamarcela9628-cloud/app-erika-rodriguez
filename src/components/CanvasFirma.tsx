'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { registrarFirmaAction } from '@/app/firmar/[token]/actions'

interface CanvasFirmaProps {
  tokenContrato: string;
  contratoId?: string;
  firmante?: 'paciente_1' | 'paciente_2' | 'tutor_1' | 'tutor_2' | 'menor_asentimiento';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CanvasFirma({ tokenContrato, contratoId, firmante = 'paciente_1', onSuccess, onError }: CanvasFirmaProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isSaving, setIsSaving] = useState(false)

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
      const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
      if (!signatureDataUrl) {
        throw new Error('Error al capturar la imagen de la firma')
      }

      const res = await registrarFirmaAction({
        tokenContrato,
        contratoId,
        firmante,
        signatureBase64: signatureDataUrl,
      })

      if (!res.success) {
        throw new Error(res.error || 'No se pudo registrar la firma.')
      }

      onSuccess?.()
    } catch (err: any) {
      console.error('Error procesando firma:', err)
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
