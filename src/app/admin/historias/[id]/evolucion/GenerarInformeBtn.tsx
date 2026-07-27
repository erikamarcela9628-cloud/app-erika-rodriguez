'use client'

import { useState } from 'react'
import { resumenEvolucionAction } from '../../ai-actions'

interface GenerarInformeBtnProps {
  evoluciones: any[]
}

export default function GenerarInformeBtn({ evoluciones }: GenerarInformeBtnProps) {
  const [informe, setInforme] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const handleGenerar = async () => {
    if (!evoluciones || evoluciones.length === 0) {
      setError('No hay evoluciones registradas para generar el informe.')
      return
    }

    setIsLoading(true)
    setError(null)
    setInforme(null)

    try {
      const resultado = await resumenEvolucionAction(evoluciones)
      setInforme(resultado)
    } catch (err: any) {
      setError(err.message || 'Error al generar el informe.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopiar = () => {
    if (informe) {
      navigator.clipboard.writeText(informe)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  return (
    <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#0e787a]">Informe de Progreso y Evolución</h3>
          <p className="text-sm text-gray-500 mt-1">Genera un resumen clínico técnico basado en todas las sesiones registradas usando IA.</p>
        </div>
        <button
          onClick={handleGenerar}
          disabled={isLoading || evoluciones.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            '✨ Generar Informe con IA'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {informe && (
        <div className="mt-4 relative">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto font-serif">
            {informe}
          </div>
          <button
            onClick={handleCopiar}
            className="absolute top-2 right-2 p-2 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs flex items-center transition-colors"
          >
            {copiado ? (
              <>
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                Copiar Informe
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
