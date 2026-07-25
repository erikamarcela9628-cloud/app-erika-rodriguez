'use client'

import { useState, useEffect } from 'react'

interface HistoriaFormProps {
  pacientes: any[]
  formAction: (formData: FormData) => void
  initialData?: any // Para edición futura
}

export default function HistoriaForm({ pacientes, formAction, initialData }: HistoriaFormProps) {
  const [activeTab, setActiveTab] = useState(1)
  
  // Nuevos estados para demografía
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edadAnos, setEdadAnos] = useState('')
  const [edadMeses, setEdadMeses] = useState('')
  const [esEstudiante, setEsEstudiante] = useState(false)
  const [esRemitido, setEsRemitido] = useState(false)
  const [riesgoSuicida, setRiesgoSuicida] = useState('Sin Riesgo')
  
  // Cálculo de edad
  useEffect(() => {
    if (fechaNacimiento) {
      const birth = new Date(fechaNacimiento)
      const now = new Date()
      let years = now.getFullYear() - birth.getFullYear()
      let months = now.getMonth() - birth.getMonth()
      
      if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
        years--
        months += 12
      }
      
      if (now.getDate() < birth.getDate()) {
        months--
        if (months < 0) {
          months += 12
        }
      }
      
      setEdadAnos(years.toString())
      setEdadMeses(months.toString())
    } else {
      setEdadAnos('')
      setEdadMeses('')
    }
  }, [fechaNacimiento])

  // Handlers para avanzar tabs fácilmente
  const nextTab = () => setActiveTab(prev => Math.min(prev + 1, 4))
  const prevTab = () => setActiveTab(prev => Math.max(prev - 1, 1))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Evitar envío al presionar Enter, excepto en textareas
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }
  }

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

      <form action={formAction} onKeyDown={handleKeyDown} className="p-8">
        
        {/* TAB 1: DATOS GENERALES */}
        <div className={activeTab === 1 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Datos de Identificación y Demográficos</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-6">
              <label htmlFor="paciente_id" className="block text-sm font-semibold text-slate-800">Seleccionar Paciente *</label>
              <select required id="paciente_id" name="paciente_id" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="">Buscar paciente...</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_completo} - {p.numero_documento}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Fecha de Nacimiento *</label>
              <input required type="date" name="datos_demograficos.fecha_nacimiento" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Edad Calculada (Años) *</label>
              <input required type="number" readOnly name="datos_demograficos.edad_atencion_anos" value={edadAnos} className="mt-1 w-full px-3 py-2 border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Edad Calculada (Meses) *</label>
              <input required type="number" readOnly name="datos_demograficos.edad_atencion_meses" value={edadMeses} className="mt-1 w-full px-3 py-2 border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Género / Sexo *</label>
              <select required name="datos_demograficos.genero" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Estado Civil *</label>
              <select required name="datos_demograficos.estado_civil" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="">Seleccionar...</option>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Unión Libre">Unión Libre</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Municipio de Residencia *</label>
              <input required type="text" name="datos_demograficos.municipio_residencia" defaultValue="Villavicencio" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6 border-t pt-6">Información Académica / Remisión</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-6 flex items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input type="hidden" name="datos_demograficos.es_estudiante" value={esEstudiante ? 'true' : 'false'} />
              <input
                id="es_estudiante"
                type="checkbox"
                checked={esEstudiante}
                onChange={(e) => setEsEstudiante(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0e787a] focus:ring-[#0e787a]"
              />
              <label htmlFor="es_estudiante" className="ml-3 block text-sm font-semibold text-slate-800">
                ¿El paciente es estudiante?
              </label>
            </div>

            {esEstudiante && (
              <div className="sm:col-span-6 flex flex-col space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center">
                  <input type="hidden" name="datos_demograficos.es_remitido_colegio" value={esRemitido ? 'true' : 'false'} />
                  <input
                    id="es_remitido_colegio"
                    type="checkbox"
                    checked={esRemitido}
                    onChange={(e) => setEsRemitido(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0e787a] focus:ring-[#0e787a]"
                  />
                  <label htmlFor="es_remitido_colegio" className="ml-3 block text-sm font-semibold text-slate-800">
                    ¿Es remitido por una institución educativa o colegio?
                  </label>
                </div>

                {esRemitido && (
                  <div>
                    <label htmlFor="institucion_remite" className="block text-sm font-semibold text-slate-800">
                      Nombre de la Institución / Colegio que remite *
                    </label>
                    <input
                      required
                      type="text"
                      id="institucion_remite"
                      name="datos_demograficos.institucion_remite"
                      className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                      placeholder="Ej: Colegio Departamental La Esperanza"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6 border-t pt-6">Datos del Acudiente (Opcional)</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-slate-800">Nombre del Acudiente</label>
              <input type="text" name="acudiente.nombre" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-slate-800">Parentesco</label>
              <input type="text" name="acudiente.parentesco" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Teléfono</label>
              <input type="text" name="acudiente.telefono" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-slate-800">Dirección</label>
              <input type="text" name="acudiente.direccion" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6 border-t pt-6">Datos EPS</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Nombre EPS</label>
              <input type="text" name="eps.nombre" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Régimen</label>
              <select name="eps.regimen" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Contributivo">Contributivo</option>
                <option value="Subsidiado">Subsidiado</option>
                <option value="Especial">Especial</option>
                <option value="Ninguno">Ninguno</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800">Tipo de Afiliado</label>
              <select name="eps.tipo_afiliado" className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Cotizante">Cotizante</option>
                <option value="Beneficiario">Beneficiario</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 2: ANAMNESIS Y ANTECEDENTES */}
        <div className={activeTab === 2 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Antecedentes</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Salud Física y Mental Personal / Familiar</label>
              <textarea name="antecedentes.personales_familiares" rows={3} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder="Describa antecedentes médicos o psiquiátricos..."></textarea>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6 border-t pt-6">Anamnesis</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Motivo de Consulta (Referido por el paciente)</label>
              <textarea required name="anamnesis.motivo_consulta" rows={3} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder='"Vengo porque..."'></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Definición del Problema (Perspectiva profesional)</label>
              <textarea required name="anamnesis.definicion_problema" rows={4} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder="Análisis clínico del problema actual..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Vínculos Afectivos, Comunicación y Contexto</label>
              <textarea name="anamnesis.vinculos" rows={3} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]"></textarea>
            </div>
          </div>
        </div>

        {/* TAB 3: EXAMEN MENTAL */}
        <div className={activeTab === 3 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Examen Mental Estructurado</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Aspecto Físico</label>
              <select name="examen_mental.aspecto_fisico" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Adecuado">Adecuado</option>
                <option value="No Adecuado">No Adecuado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Actitud</label>
              <select name="examen_mental.actitud" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Adecuada">Adecuada (Colaboradora)</option>
                <option value="Hostil">Hostil / Defensiva</option>
                <option value="Indiferente">Indiferente</option>
                <option value="Seductora">Seductora</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Estado de Consciencia</label>
              <select name="examen_mental.consciencia" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Alerta">Alerta</option>
                <option value="Hiperalerta">Hiperalerta</option>
                <option value="Somnoliento">Somnoliento</option>
                <option value="Obnubilado">Obnubilado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Lenguaje y Habla</label>
              <select name="examen_mental.lenguaje" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Organizado y Coherente">Organizado y Coherente</option>
                <option value="Desorganizado">Desorganizado</option>
                <option value="Taquilalia">Taquilalia</option>
                <option value="Bradilalia">Bradilalia</option>
                <option value="Mutismo">Mutismo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Orientación (Tiempo/Espacio/Persona)</label>
              <select name="examen_mental.orientacion" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Orientado">Orientado globalmente</option>
                <option value="Desorientado en tiempo">Desorientado en tiempo</option>
                <option value="Desorientado en espacio">Desorientado en espacio</option>
                <option value="Desorientado en persona">Desorientado en persona</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Sensopercepción</label>
              <select name="examen_mental.sensopercepcion" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Sin alteraciones">Sin alteraciones evidentes</option>
                <option value="Alucinaciones visuales">Alucinaciones visuales</option>
                <option value="Alucinaciones auditivas">Alucinaciones auditivas</option>
                <option value="Ilusiones">Ilusiones</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Curso y Contenido del Pensamiento</label>
              <input type="text" name="examen_mental.pensamiento" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder="Lógico, fuga de ideas, ideas delirantes..." defaultValue="Lógico y coherente" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Afectividad</label>
              <input type="text" name="examen_mental.afectividad" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder="Eutímico, hipertímico, aplanado..." defaultValue="Eutímico" />
            </div>
            
            <div className="sm:col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-200 mt-4">
              <label className="block text-sm font-semibold text-slate-800 mb-2">Evaluación de Riesgo Suicida *</label>
              <select 
                required
                name="examen_mental.nivel_riesgo_suicida" 
                value={riesgoSuicida}
                onChange={(e) => setRiesgoSuicida(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a] mb-4"
              >
                <option value="Sin Riesgo">Sin Riesgo</option>
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>

              {(riesgoSuicida === 'Medio' || riesgoSuicida === 'Alto') && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                  <strong className="block text-red-900 font-bold mb-1">⚠️ Alerta de Riesgo {riesgoSuicida}</strong>
                  Se recomienda activar el protocolo de seguridad de inmediato. Proporcione estrategias de afrontamiento, involucre a la red de apoyo primaria y, si el riesgo es Alto, considere remisión o acompañamiento constante.
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Consciencia de Enfermedad</label>
              <select name="examen_mental.consciencia_enfermedad" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Presente">Presente</option>
                <option value="Ausente">Ausente</option>
                <option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 4: ANÁLISIS Y DIAGNÓSTICO */}
        <div className={activeTab === 4 ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Impresión Diagnóstica y Plan</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Análisis Objetivo (Observaciones del profesional)</label>
            <textarea name="analisis_diagnostico.analisis" rows={4} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]"></textarea>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Diagnóstico Principal (CIE-10)</label>
              <input type="text" name="analisis_diagnostico.cie10" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]" placeholder="Ej: F32.0 Episodio depresivo leve" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Tipo de Tratamiento Propuesto</label>
              <select name="analisis_diagnostico.tipo_tratamiento" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]">
                <option value="Terapia Individual">Terapia Individual</option>
                <option value="Terapia de Pareja">Terapia de Pareja</option>
                <option value="Terapia de Familia">Terapia de Familia</option>
                <option value="Valoración por Psiquiatría">Valoración por Psiquiatría</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Plan de Intervención / Recomendaciones</label>
            <textarea name="analisis_diagnostico.plan" rows={4} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a]"></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 mt-8 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={prevTab}
            disabled={activeTab === 1}
            className="bg-white py-2 px-4 border border-slate-300 text-slate-900 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
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
