import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import PDFExportButton from './PDFExportButton'

export const metadata = {
  title: 'Ver Historia Clínica | Dra. Erika Rodríguez',
}

export default async function VerHistoriaPage({ params }: { params: { id: string } }) {
  // Obtener la historia clínica completa con los datos del paciente y sus evoluciones
  const { data: historia, error } = await supabaseServer
    .from('historias_clinicas')
    .select(`
      *,
      pacientes (*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !historia) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Historia no encontrada</h1>
        <Link href="/admin/historias" className="text-[#0e787a] hover:underline">&larr; Volver a Historias</Link>
      </div>
    )
  }

  const { data: evoluciones } = await supabaseServer
    .from('evoluciones')
    .select('*')
    .eq('historia_clinica_id', historia.id)
    .order('fecha', { ascending: true })

  // Para evitar que pete por si algún JSON es null
  const acudiente = historia.acudiente || {}
  const eps = historia.eps || {}
  const antecedentes = historia.antecedentes || {}
  const anamnesis = historia.anamnesis || {}
  const ex = historia.examen_mental || {}
  const diag = historia.analisis_diagnostico || {}
  const pac = historia.pacientes || {}

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historia Clínica FBE.70</h1>
          <p className="mt-1 text-sm text-gray-500">Paciente: {pac.nombre_completo} ({pac.tipo_documento} {pac.numero_documento})</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/admin/historias"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 mt-2"
          >
            &larr; Volver
          </Link>
          <Link
            href={`/admin/historias/${historia.id}/evolucion`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors"
          >
            Añadir / Ver Evoluciones
          </Link>
          <PDFExportButton historia={historia} evoluciones={evoluciones || []} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Acudiente y EPS */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#0e787a] mb-4">Datos Generales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-semibold text-gray-600">Acudiente:</span> <br/>{acudiente.nombre || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">Parentesco:</span> <br/>{acudiente.parentesco || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">Teléfono:</span> <br/>{acudiente.telefono || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">EPS:</span> <br/>{eps.nombre || 'N/A'} ({eps.regimen || 'N/A'})</div>
          </div>
        </div>

        {/* Anamnesis */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-[#0e787a] mb-4">Motivo de Consulta y Anamnesis</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600 block mb-1">Motivo de Consulta:</span>
              <p className="bg-white p-3 border rounded-md">{anamnesis.motivo_consulta}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block mb-1">Definición del Problema:</span>
              <p className="bg-white p-3 border rounded-md">{anamnesis.definicion_problema}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block mb-1">Antecedentes Físicos y Mentales:</span>
              <p className="bg-white p-3 border rounded-md">{antecedentes.personales_familiares || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Examen Mental */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#0e787a] mb-4">Examen Mental</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-semibold text-gray-600">Aspecto Físico:</span> {ex.aspecto_fisico}</div>
            <div><span className="font-semibold text-gray-600">Actitud:</span> {ex.actitud}</div>
            <div><span className="font-semibold text-gray-600">Estado de Consciencia:</span> {ex.consciencia}</div>
            <div><span className="font-semibold text-gray-600">Lenguaje:</span> {ex.lenguaje}</div>
            <div><span className="font-semibold text-gray-600">Orientación:</span> {ex.orientacion}</div>
            <div><span className="font-semibold text-gray-600">Sensopercepción:</span> {ex.sensopercepcion}</div>
            <div className="col-span-2"><span className="font-semibold text-gray-600">Pensamiento:</span> {ex.pensamiento}</div>
            <div className="col-span-2"><span className="font-semibold text-gray-600">Afectividad:</span> {ex.afectividad}</div>
            <div><span className="font-semibold text-gray-600">Riesgo Suicida:</span> {ex.riesgo_suicida}</div>
            <div><span className="font-semibold text-gray-600">Consciencia de Enf.:</span> {ex.consciencia_enfermedad}</div>
          </div>
        </div>

        {/* Análisis y Plan */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-lg font-bold text-[#0e787a] mb-4">Análisis, Diagnóstico y Plan</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600 block mb-1">Análisis Objetivo:</span>
              <p className="bg-white p-3 border rounded-md">{diag.analisis}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Diagnóstico (CIE-10):</span>
                <p className="bg-white p-3 border rounded-md font-bold">{diag.cie10}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Tipo de Tratamiento:</span>
                <p className="bg-white p-3 border rounded-md">{diag.tipo_tratamiento}</p>
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-600 block mb-1">Plan de Intervención:</span>
              <p className="bg-white p-3 border rounded-md">{diag.plan}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
