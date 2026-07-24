'use client'

import { useState } from 'react'
import CanvasFirma from '@/components/CanvasFirma'

export default function CanvasFirmaWrapper({ token, firmante = 'paciente_1' }: { token: string, firmante?: 'paciente_1' | 'paciente_2' | 'tutor_1' | 'tutor_2' | 'menor_asentimiento' }) {
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (success) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100 shadow-sm transition-all duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">¡Firma registrada con éxito!</h3>
        <p className="text-green-700">El documento ha sido firmado y procesado correctamente.</p>
        <p className="text-sm text-green-600 mt-4 opacity-80">Ya puedes cerrar esta ventana.</p>
      </div>
    )
  }

  return (
    <div className="transition-all duration-300">
      {errorMsg && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMsg}
        </div>
      )}
      
      <CanvasFirma 
        tokenContrato={token}
        firmante={firmante} 
        onSuccess={() => {
          setSuccess(true)
          // Notificar vía API Route que el contrato fue firmado
          fetch('/api/contrato/firmado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, firmante })
          }).catch(console.error)
        }} 
        onError={setErrorMsg} 
      />
    </div>
  )
}
