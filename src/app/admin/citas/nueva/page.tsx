import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { agendarCita } from '../actions'

export const metadata = {
  title: 'Agendar Cita | Dra. Erika Rodríguez',
}

export default async function NuevaCitaPage() {
  const { data: pacientes } = await supabaseServer
    .from('pacientes')
    .select('id, nombre_completo, numero_documento')
    .order('nombre_completo', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Nueva Cita</h1>
          <p className="mt-1 text-sm text-gray-500">Programar atención para un paciente.</p>
        </div>
        <Link href="/admin/citas" className="text-sm font-medium text-[#0e787a] hover:underline">
          &larr; Volver
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form action={agendarCita} className="p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Paciente *</label>
            <select required name="paciente_id" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
              <option value="">Seleccione un paciente...</option>
              {pacientes?.map(p => (
                <option key={p.id} value={p.id}>{p.nombre_completo} - {p.numero_documento}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Fecha *</label>
              <input required type="date" name="fecha" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Hora *</label>
              <input required type="time" name="hora" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Duración</label>
              <select name="duracion_minutos" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
                <option value="45">45 minutos</option>
                <option value="50">50 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Modalidad</label>
              <select name="modalidad" className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]">
                <option value="Presencial">Presencial</option>
                <option value="Virtual (Meet/Zoom)">Virtual (Meet/Zoom)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Notas / Observaciones</label>
            <textarea name="observaciones" rows={3} className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:text-slate-900 rounded-lg shadow-sm focus:ring-[#0e787a] focus:border-[#0e787a]" placeholder="Motivo o indicaciones previas..."></textarea>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-[#0e787a] py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-[#0b5c5d]"
            >
              Confirmar Agendamiento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
