'use client'

import { useState } from 'react'
import { sugerirDiagnosticoAction } from './ai-actions'

interface SugerirDiagnosticoBtnProps {
  getDatos: () => { motivoConsulta: string, examenMental: string }
  onSelect: (codigoCie10: string) => void
}

interface Sugerencia {
  codigo: string
  nombre: string
  justificacion: string
}

export default function SugerirDiagnosticoBtn({ getDatos, onSelect }: SugerirDiagnosticoBtnProps) {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSugerir = async () => {
    const datos = getDatos()
    
    if (!datos.motivoConsulta) {
      setError('Por favor, ingresa el Motivo de Consulta antes de sugerir diagnósticos.')
      setTimeout(() => setError(null), 4000)
      return
    }

    setIsLoading(true)
    setError(null)
    setSugerencias([])

    try {
      const result = await sugerirDiagnosticoAction(datos.motivoConsulta, datos.examenMental)
      setSugerencias(result)
    } catch (err: any) {
      setError(err.message || 'Error al obtener sugerencias.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2 mb-4">
      <button
        type="button"
        onClick={handleSugerir}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 border border-indigo-200 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analizando síntomas...
          </>
        ) : (
          '💡 Sugerir Diagnósticos (CIE-10)'
        )}
      </button>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {sugerencias.length > 0 && (
        <div className="mt-3 bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2">Posibles Diagnósticos:</h4>
          <div className="space-y-3">
            {sugerencias.map((sug, idx) => (
              <div 
                key={idx} 
                className="p-3 border border-gray-200 rounded-md hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
                onClick={() => onSelect(sug.codigo)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded font-bold mr-2">
                      {sug.codigo}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">{sug.nombre}</span>
                  </div>
                  <button 
                    type="button"
                    className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                  >
                    Usar este
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">{sug.justificacion}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 italic text-center">
            * Haz clic en una sugerencia para usar su código. La IA no sustituye el criterio clínico.
          </p>
        </div>
      )}
    </div>
  )
}
