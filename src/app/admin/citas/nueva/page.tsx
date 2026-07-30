import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import NuevaCitaClient from './NuevaCitaClient'

export const metadata = {
  title: 'Agendar Cita | Psicóloga Erika Rodríguez',
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

      <NuevaCitaClient pacientes={pacientes || []} />
    </div>
  )
}
