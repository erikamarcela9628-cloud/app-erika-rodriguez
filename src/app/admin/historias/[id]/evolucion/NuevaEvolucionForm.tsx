'use client'

import React, { useRef, useState } from 'react'
import { guardarEvolucion } from './actions'
import TareasCasaClient from './TareasCasaClient'
import DraftAutoSaveBanner from '@/components/DraftAutoSaveBanner'
import { useAutoSaveDraft } from '@/utils/useAutoSaveDraft'
import toast from 'react-hot-toast'

interface NuevaEvolucionFormProps {
  historiaId: string
  pacienteId: string
  numSiguienteSesion: number
  sesionPaqueteSiguiente: number
  contratoId?: string | null
  vistaSaldo?: any
  esPareja: boolean
  ultimaEvolucion?: any
  tareasPrevias: any[]
  pacienteNombre: string
  pacienteTelefonoBase: string
  evolucionesRecientes: any[]
  motivoConsulta: string
}

export default function NuevaEvolucionForm({
  historiaId,
  pacienteId,
  numSiguienteSesion,
  sesionPaqueteSiguiente,
  contratoId,
  vistaSaldo,
  esPareja,
  ultimaEvolucion,
  tareasPrevias,
  pacienteNombre,
  pacienteTelefonoBase,
  evolucionesRecientes,
  motivoConsulta,
}: NuevaEvolucionFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    saveDraft,
    hasDraft,
    draftTimestamp,
    restoreDraft,
    discardDraft,
    clearDraft,
    isOnline,
    isSavedLocally,
    lastSavedTime,
  } = useAutoSaveDraft({
    key: `evolucion_${historiaId}`,
  })

  const handleFormChange = () => {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    const draft: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === 'string' && value.trim()) {
        draft[key] = value
      }
    })
    saveDraft(draft)
  }

  const handleRestore = () => {
    const restored = restoreDraft()
    if (restored && formRef.current) {
      Object.keys(restored).forEach((name) => {
        const element = formRef.current?.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null
        if (element && 'value' in element) {
          element.value = restored[name]
        }
      })
      toast.success('Borrador recuperado con éxito.')
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!navigator.onLine) {
      e.preventDefault()
      toast.error('No hay conexión a internet. Tus notas están guardadas en este equipo, espera a reconectar para enviar.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      // Limpiar borrador local antes de enviar la acción
      clearDraft()
      await guardarEvolucion(formData)
    } catch (err: any) {
      // Si Next.js redirige, no es un error real
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Error al guardar evolución:', err)
      toast.error(err.message || 'Error al guardar la evolución.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24 font-sans">
      <div className="px-6 py-4 border-b border-gray-200 bg-[#0e787a] text-white">
        <h2 className="text-lg font-semibold">
          Registrar Sesión {vistaSaldo ? sesionPaqueteSiguiente : numSiguienteSesion}
        </h2>
      </div>

      <div className="p-6">
        <DraftAutoSaveBanner
          hasDraft={hasDraft}
          draftTimestamp={draftTimestamp}
          onRestore={handleRestore}
          onDiscard={discardDraft}
          isOnline={isOnline}
          isSavedLocally={isSavedLocally}
          lastSavedTime={lastSavedTime}
        />

        <form ref={formRef} onChange={handleFormChange} onSubmit={onSubmit}>
          <input type="hidden" name="historia_clinica_id" value={historiaId} />
          <input type="hidden" name="paciente_id" value={pacienteId} />
          <input type="hidden" name="numero_sesion" value={numSiguienteSesion} />
          {contratoId && <input type="hidden" name="contrato_id" value={contratoId} />}

          {vistaSaldo && (
            <div className="mb-4 bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <p>
                Esta nota corresponderá a la <strong>Sesión {sesionPaqueteSiguiente} de {vistaSaldo.total_sesiones_contratadas}</strong> del paquete contratado.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800">Fecha de Sesión *</label>
              <input
                required
                type="datetime-local"
                name="fecha_sesion"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:ring-[#0e787a]"
              />
            </div>

            {esPareja && (
              <div>
                <label className="block text-sm font-semibold text-slate-800">Atención realizada a *</label>
                <select
                  required
                  name="asistente_sesion"
                  defaultValue="Ambos"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a]"
                >
                  <option value="Ambos">👥 Ambos (Conjunta)</option>
                  <option value="Paciente A">👤 Paciente A (Individual)</option>
                  <option value="Paciente B">👤 Paciente B (Individual)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-800">Evolución Detallada *</label>
              <textarea
                required
                name="evolucion_terapeutica"
                rows={5}
                className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:ring-[#0e787a]"
                placeholder="Temas tratados, técnicas, respuestas del paciente..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">Observaciones</label>
              <textarea
                name="observaciones_valoracion"
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:ring-[#0e787a]"
                placeholder="Anotaciones extra..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">Diagnóstico CIE-10 Actualizado</label>
              <input
                type="text"
                name="diagnostico_cie10"
                defaultValue={ultimaEvolucion?.diagnostico_cie10 || ''}
                className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:ring-[#0e787a]"
                placeholder="Opcional. Ej: F41.1"
              />
            </div>

            <hr className="my-6" />

            <TareasCasaClient
              diagnostico={ultimaEvolucion?.diagnostico_cie10 || 'No especificado'}
              motivoConsulta={motivoConsulta || 'No especificado'}
              evolucionesRecientes={evolucionesRecientes || []}
              tareasPrevias={tareasPrevias}
              pacienteNombre={pacienteNombre}
              pacienteTelefono={pacienteTelefonoBase}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-[#0e787a] py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-[#0b5c5d] disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Evolución'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
