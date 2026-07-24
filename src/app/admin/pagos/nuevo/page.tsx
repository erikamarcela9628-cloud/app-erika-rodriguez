import { supabaseServer } from '@/lib/supabaseServer'
import { registrarPago } from './actions'
import Link from 'next/link'

export const metadata = {
  title: 'Registrar Pago | Dra. Erika Rodríguez',
}

export default async function RegistrarPagoPage() {
  // Obtener pacientes para el select
  const { data: pacientes } = await supabaseServer
    .from('pacientes')
    .select('id, nombre_completo, tipo_documento, numero_documento')
    .order('nombre_completo', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Pago</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa los detalles del pago para generar un recibo oficial.
          </p>
        </div>
        <Link
          href="/admin/pagos"
          className="text-sm font-medium text-[#0e787a] hover:text-[#224252] flex items-center"
        >
          &larr; Volver a Pagos
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form action={registrarPago} className="p-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Paciente */}
            <div className="sm:col-span-6">
              <label htmlFor="paciente_id" className="block text-sm font-medium text-gray-800">
                Paciente
              </label>
              <div className="mt-1">
                <select
                  required
                  id="paciente_id"
                  name="paciente_id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a] shadow-sm"
                >
                  <option value="">Selecciona un paciente...</option>
                  {pacientes?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo} ({p.tipo_documento} {p.numero_documento})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monto */}
            <div className="sm:col-span-3">
              <label htmlFor="monto" className="block text-sm font-medium text-gray-800">
                Monto Pagado ($ COP)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="monto"
                  id="monto"
                  required
                  min="0"
                  step="0.01"
                  className="block w-full pl-7 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a]"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div className="sm:col-span-3">
              <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-800">
                Método de Pago
              </label>
              <div className="mt-1">
                <select
                  required
                  id="metodo_pago"
                  name="metodo_pago"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a] shadow-sm"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                </select>
              </div>
            </div>

            {/* Referencia */}
            <div className="sm:col-span-6">
              <label htmlFor="referencia" className="block text-sm font-medium text-gray-800">
                Referencia / Número de Comprobante <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="referencia"
                  id="referencia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a] shadow-sm"
                  placeholder="Ej: Aprobación #12345 o Transacción Nequi"
                />
              </div>
            </div>

            {/* Concepto */}
            <div className="sm:col-span-6">
              <label htmlFor="concepto" className="block text-sm font-medium text-gray-800">
                Concepto
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="concepto"
                  id="concepto"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a] shadow-sm"
                  placeholder="Ej: Sesión Individual de Psicología"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="sm:col-span-6">
              <label htmlFor="notas" className="block text-sm font-medium text-gray-800">
                Notas internas <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a] shadow-sm"
                  placeholder="Anotaciones privadas sobre este pago..."
                />
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a] mr-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#0e787a] hover:bg-[#224252] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e787a]"
            >
              Generar Recibo de Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
