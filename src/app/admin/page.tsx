import { supabaseServer } from '@/lib/supabaseServer'
import DashboardClient from './DashboardClient'

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { data: contratos, error: errC } = await supabaseServer
    .from('contratos')
    .select('*')
    .order('created_at', { ascending: false })

  if (errC) {
    return <div className="p-8 text-red-600">Error al cargar contratos: {errC.message}</div>
  }

  const pacienteIds = new Set<string>()
  contratos?.forEach(c => {
    if (c.paciente_id) pacienteIds.add(c.paciente_id)
    if (c.paciente_2_id) pacienteIds.add(c.paciente_2_id)
  })

  let pacientes: any[] = []
  if (pacienteIds.size > 0) {
    const { data: pData } = await supabaseServer
      .from('pacientes')
      .select('*')
      .in('id', Array.from(pacienteIds))
    if (pData) pacientes = pData
  }

  return <DashboardClient contratos={contratos || []} pacientes={pacientes} />
}
