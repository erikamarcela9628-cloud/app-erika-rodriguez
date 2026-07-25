import { supabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import HistoriaForm from '../../HistoriaForm'
import { actualizarHistoriaClinica } from '../../nueva/actions'

export const metadata = {
  title: 'Editar Historia Clínica | Psicóloga Erika Rodríguez',
}

export default async function EditarHistoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener la historia clínica existente
  const { data: historia, error: errorHistoria } = await supabaseServer
    .from('historias_clinicas')
    .select('*')
    .eq('id', id)
    .single()

  if (errorHistoria || !historia) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Historia no encontrada</h1>
        <Link href="/admin/historias" className="text-[#0e787a] hover:underline">&larr; Volver a Historias</Link>
      </div>
    )
  }

  // Obtener la lista de pacientes
  const { data: pacientes } = await supabaseServer
    .from('pacientes')
    .select('id, nombre_completo, numero_documento')
    .order('nombre_completo', { ascending: true })

  // Bind del id al Server Action
  const actualizarConId = actualizarHistoriaClinica.bind(null, id)

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Historia Clínica FBE.70</h1>
          <p className="mt-1 text-sm text-gray-500">Actualizar información del registro clínico.</p>
        </div>
        <Link href={`/admin/historias/${id}`} className="text-sm font-medium text-[#0e787a] hover:underline">
          &larr; Volver
        </Link>
      </div>

      <HistoriaForm 
        pacientes={pacientes || []} 
        formAction={actualizarConId} 
        initialData={historia}
      />
    </div>
  )
}
