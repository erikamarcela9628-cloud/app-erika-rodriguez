'use client'

import { useState } from 'react'

interface HistoriaFormProps {
  pacientes: any[]
  formAction: (formData: FormData) => void
  initialData?: any // Para edición futura
}

export default function HistoriaForm({ pacientes, formAction, initialData }: HistoriaFormProps) {
  const [activeTab, setActiveTab] = useState(1)
  
  // Handlers para avanzar tabs fácilmente
  const nextTab = () => setActiveTab(prev => Math.min(prev + 1, 4))
  const prevTab = () => setActiveTab(prev => Math.max(prev - 1, 1))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 1 ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          1. Datos Generales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 2 ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          2. Anamnesis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(3)}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 3 ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          3. Examen Mental
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(4)}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 4 ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          4. Análisis y Plan
        </button>
      </div>

      <form action={formAction} className="p-8">
        
        {/* TAB 1: DATOS GENERALES */}
        <div className={activeTab === 1 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Datos de Identificación del Paciente</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-6">
              <label htmlFor="paciente_id" className="block text-sm font-medium text-gray-800">Seleccionar Paciente *</label>
              <select required id="paciente_id" name="paciente_id" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
                <option value="">Buscar paciente...</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_completo} - {p.numero_documento}</option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-6 border-t pt-6">Datos del Acudiente (Opcional)</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-800">Nombre del Acudiente</label>
              <input type="text" name="acudiente.nombre" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-800">Parentesco</label>
              <input type="text" name="acudiente.parentesco" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-800">Teléfono</label>
              <input type="text" name="acudiente.telefono" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-gray-800">Dirección</label>
              <input type="text" name="acudiente.direccion" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-6 border-t pt-6">Datos EPS</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-800">Nombre EPS</label>
              <input type="text" name="eps.nombre" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-800">Régimen</label>
              <select name="eps.regimen" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
                <option value="Contributivo">Contributivo</option>
                <option value="Subsidiado">Subsidiado</option>
                <option value="Especial">Especial</option>
                <option value="Ninguno">Ninguno</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-800">Tipo de Afiliado</label>
              <select name="eps.tipo_afiliado" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
                <option value="Cotizante">Cotizante</option>
                <option value="Beneficiario">Beneficiario</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 2: ANAMNESIS Y ANTECEDENTES */}
        <div className={activeTab === 2 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Antecedentes</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Salud Física y Mental Personal / Familiar</label>
              <textarea name="antecedentes.personales_familiares" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" placeholder="Describa antecedentes médicos o psiquiátricos..."></textarea>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-6 border-t pt-6">Anamnesis</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Motivo de Consulta (Referido por el paciente)</label>
              <textarea required name="anamnesis.motivo_consulta" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" placeholder='"Vengo porque..."'></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Definición del Problema (Perspectiva profesional)</label>
              <textarea required name="anamnesis.definicion_problema" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" placeholder="Análisis clínico del problema actual..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Vínculos Afectivos, Comunicación y Contexto</label>
              <textarea name="anamnesis.vinculos" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]"></textarea>
            </div>
          </div>
        </div>

        {/* TAB 3: EXAMEN MENTAL */}
        <div className={activeTab === 3 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Examen Mental Estructurado</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Aspecto Físico</label>
              <select name="examen_mental.aspecto_fisico" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Adecuado">Adecuado</option>
                <option value="No Adecuado">No Adecuado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Actitud</label>
              <select name="examen_mental.actitud" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Adecuada">Adecuada (Colaboradora)</option>
                <option value="Hostil">Hostil / Defensiva</option>
                <option value="Indiferente">Indiferente</option>
                <option value="Seductora">Seductora</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Estado de Consciencia</label>
              <select name="examen_mental.consciencia" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Alerta">Alerta</option>
                <option value="Hiperalerta">Hiperalerta</option>
                <option value="Somnoliento">Somnoliento</option>
                <option value="Obnubilado">Obnubilado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Lenguaje y Habla</label>
              <select name="examen_mental.lenguaje" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Organizado y Coherente">Organizado y Coherente</option>
                <option value="Desorganizado">Desorganizado</option>
                <option value="Taquilalia">Taquilalia</option>
                <option value="Bradilalia">Bradilalia</option>
                <option value="Mutismo">Mutismo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Orientación (Tiempo/Espacio/Persona)</label>
              <select name="examen_mental.orientacion" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Orientado">Orientado globalmente</option>
                <option value="Desorientado en tiempo">Desorientado en tiempo</option>
                <option value="Desorientado en espacio">Desorientado en espacio</option>
                <option value="Desorientado en persona">Desorientado en persona</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Sensopercepción</label>
              <select name="examen_mental.sensopercepcion" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Sin alteraciones">Sin alteraciones evidentes</option>
                <option value="Alucinaciones visuales">Alucinaciones visuales</option>
                <option value="Alucinaciones auditivas">Alucinaciones auditivas</option>
                <option value="Ilusiones">Ilusiones</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Curso y Contenido del Pensamiento</label>
              <input type="text" name="examen_mental.pensamiento" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]" placeholder="Lógico, fuga de ideas, ideas delirantes..." defaultValue="Lógico y coherente" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Afectividad</label>
              <input type="text" name="examen_mental.afectividad" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]" placeholder="Eutímico, hipertímico, aplanado..." defaultValue="Eutímico" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Riesgo Suicida</label>
              <select name="examen_mental.riesgo_suicida" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Ausente">Ausente</option>
                <option value="Ideación">Ideación pasiva</option>
                <option value="Estructurado">Plan Estructurado (Riesgo Alto)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Consciencia de Enfermedad</label>
              <select name="examen_mental.consciencia_enfermedad" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Presente">Presente</option>
                <option value="Ausente">Ausente</option>
                <option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 4: ANÁLISIS Y DIAGNÓSTICO */}
        <div className={activeTab === 4 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Impresión Diagnóstica y Plan</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">Análisis Objetivo (Observaciones del profesional)</label>
            <textarea name="analisis_diagnostico.analisis" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]"></textarea>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Diagnóstico Principal (CIE-10)</label>
              <input type="text" name="analisis_diagnostico.cie10" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]" placeholder="Ej: F32.0 Episodio depresivo leve" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Tipo de Tratamiento Propuesto</label>
              <select name="analisis_diagnostico.tipo_tratamiento" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a]">
                <option value="Terapia Individual">Terapia Individual</option>
                <option value="Terapia de Pareja">Terapia de Pareja</option>
                <option value="Terapia de Familia">Terapia de Familia</option>
                <option value="Valoración por Psiquiatría">Valoración por Psiquiatría</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">Plan de Intervención / Recomendaciones</label>
            <textarea name="analisis_diagnostico.plan" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]"></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 mt-8 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={prevTab}
            disabled={activeTab === 1}
            className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            &larr; Anterior
          </button>
          
          {activeTab < 4 ? (
            <button
              type="button"
              onClick={nextTab}
              className="bg-[#224252] py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-[#1a323f]"
            >
              Siguiente &rarr;
            </button>
          ) : (
            <button
              type="submit"
              className="bg-[#0e787a] py-2 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-[#0b5c5d]"
            >
              Guardar Historia Clínica
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
