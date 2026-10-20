'use client'

import { useState, useRef, useMemo } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import PDFReciboTemplate from '@/components/PDFReciboTemplate'
import Link from 'next/link'
import { registrarGasto, eliminarGasto, anularPago, eliminarPago } from './actions'
import ConfirmModal from '@/components/ConfirmModal'
import AuditModal from '@/components/AuditModal'
import toast from 'react-hot-toast'

interface PagosClientProps {
  pagos: any[]
  pacientes: any[]
  gastos: any[]
}

const formatMonthName = (monthStr: string) => {
  if (!monthStr || monthStr === 'todos') return 'Todo el Histórico'
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 15)
  const name = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function PagosClient({ pagos, pacientes, gastos }: PagosClientProps) {
  const [tab, setTab] = useState<'ingresos' | 'gastos'>('ingresos')
  const [selectedMonth, setSelectedMonth] = useState<string>('todos')
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true)

  const [showGastoModal, setShowGastoModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string}>({isOpen: false, id: ''})
  const [confirmPagoModal, setConfirmPagoModal] = useState<{isOpen: boolean, id: string}>({isOpen: false, id: ''})
  const [auditModal, setAuditModal] = useState<{isOpen: boolean, id: string, isSubmitting: boolean}>({isOpen: false, id: '', isSubmitting: false})
  
  const [generandoPDF, setGenerandoPDF] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<{ pago: any, paciente: any, logoBase64: string } | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  // Estados Formulario Gasto
  const [gastoForm, setGastoForm] = useState({
    concepto: '',
    categoria: 'Suministros/Materiales',
    monto: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    metodo_pago: 'Efectivo',
    notas: ''
  })
  const [isSubmittingGasto, setIsSubmittingGasto] = useState(false)
  const [gastoError, setGastoError] = useState('')

  // 1. Obtener lista de meses únicos ordenados (más reciente primero)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>()
    pagos.forEach((p) => {
      const d = p.fecha_pago || p.created_at
      if (d && typeof d === 'string') monthsSet.add(d.slice(0, 7))
    })
    gastos.forEach((g) => {
      const d = g.fecha_gasto || g.created_at
      if (d && typeof d === 'string') monthsSet.add(d.slice(0, 7))
    })
    return Array.from(monthsSet).sort().reverse()
  }, [pagos, gastos])

  // 2. Resumen comparativo mes a mes
  const monthlySummary = useMemo(() => {
    return availableMonths.map((m) => {
      const mPagos = pagos.filter((p) => {
        const d = p.fecha_pago || p.created_at
        return d && typeof d === 'string' && d.slice(0, 7) === m && p.estado !== 'anulado'
      })
      const mGastos = gastos.filter((g) => {
        const d = g.fecha_gasto || g.created_at
        return d && typeof d === 'string' && d.slice(0, 7) === m
      })

      const ingresos = mPagos.reduce(
        (sum, p) => sum + Number(p.monto) + (Number(p.monto_donacion) || 0),
        0
      )
      const totalGastos = mGastos.reduce((sum, g) => sum + Number(g.monto), 0)
      const balance = ingresos - totalGastos

      return {
        monthKey: m,
        monthName: formatMonthName(m),
        ingresos,
        gastos: totalGastos,
        balance,
        countPagos: mPagos.length,
        countGastos: mGastos.length,
      }
    })
  }, [availableMonths, pagos, gastos])

  // 3. Filtrar pagos y gastos según mes seleccionado
  const filteredPagos = useMemo(() => {
    if (selectedMonth === 'todos') return pagos
    return pagos.filter((p) => {
      const d = p.fecha_pago || p.created_at
      return d && typeof d === 'string' && d.slice(0, 7) === selectedMonth
    })
  }, [pagos, selectedMonth])

  const filteredGastos = useMemo(() => {
    if (selectedMonth === 'todos') return gastos
    return gastos.filter((g) => {
      const d = g.fecha_gasto || g.created_at
      return d && typeof d === 'string' && d.slice(0, 7) === selectedMonth
    })
  }, [gastos, selectedMonth])

  // Métricas para el período seleccionado
  const totalIngresosPeriodo = useMemo(() => {
    return filteredPagos
      .filter((p: any) => p.estado !== 'anulado')
      .reduce((sum, pago) => sum + Number(pago.monto) + (Number(pago.monto_donacion) || 0), 0)
  }, [filteredPagos])

  const totalGastosPeriodo = useMemo(() => {
    return filteredGastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0)
  }, [filteredGastos])

  const balancePeriodo = totalIngresosPeriodo - totalGastosPeriodo

  // Métricas totales del histórico
  const totalIngresosHistorico = useMemo(() => {
    return pagos
      .filter((p: any) => p.estado !== 'anulado')
      .reduce((sum, pago) => sum + Number(pago.monto) + (Number(pago.monto_donacion) || 0), 0)
  }, [pagos])

  const totalGastosHistorico = useMemo(() => {
    return gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0)
  }, [gastos])

  const balanceHistorico = totalIngresosHistorico - totalGastosHistorico

  const formatoMoneda = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)

  // Navegación rápida entre meses
  const handlePrevMonth = () => {
    if (selectedMonth === 'todos') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[0])
      return
    }
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx >= 0 && idx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[idx + 1])
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 'todos') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[availableMonths.length - 1])
      return
    }
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx > 0) {
      setSelectedMonth(availableMonths[idx - 1])
    }
  }

  // Helper para convertir imagen a base64 usando el proxy existente
  async function getBase64ImageFromUrl(imageUrl: string) {
    if (imageUrl.startsWith('data:image/')) return imageUrl;
    try {
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      const data = await res.json();
      return data.dataUri;
    } catch (error) {
      console.error('Error cargando imagen mediante proxy:', error);
      return imageUrl;
    }
  }

  const handleWhatsApp = (telefono: string, pago: any, pacienteNombre: string) => {
    const telClean = telefono ? telefono.replace(/\D/g, '') : '';
    if (!telClean) {
      toast.error("El paciente no tiene un número de teléfono registrado.");
      return;
    }
    const finalTel = telClean.length === 10 ? `57${telClean}` : telClean;
    
    const montoFormateado = new Intl.NumberFormat('es-CO', { 
      style: 'decimal'
    }).format(pago.monto);

    const msj = `Hola ${pacienteNombre}, adjuntamos tu recibo oficial de pago [${pago.numero_recibo}] por valor de $${montoFormateado} COP correspondiente a: ${pago.concepto}. ¡Gracias por tu confianza!`;
    window.open(`https://wa.me/${finalTel}?text=${encodeURIComponent(msj)}`, '_blank');
  }

  const descargarPDF = async (pago: any) => {
    setGenerandoPDF(pago.id)

    try {
      const paciente = pago.pacientes || pacientes.find(p => p.id === pago.paciente_id)
      const logoB64 = await getBase64ImageFromUrl('/logo-erika.png').catch(() => '')

      setPdfData({ pago, paciente, logoBase64: logoB64 })

      setTimeout(async () => {
        if (!pdfRef.current) return
        
        try {
          const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
          })

          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF('p', 'mm', 'a4')
          
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pageHeight = pdf.internal.pageSize.getHeight()
          
          const imgProps = pdf.getImageProperties(imgData)
          const imgHeight = (imgProps.height * pdfWidth) / imgProps.width
          
          let heightLeft = imgHeight
          let position = 0

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
          heightLeft -= pageHeight

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
            heightLeft -= pageHeight
          }

          pdf.save(`recibo_${pago.numero_recibo}.pdf`)
          setGenerandoPDF(null)
          setPdfData(null)
        } catch (e) {
          console.error(e)
          toast.error("Error al renderizar el documento PDF.")
          setGenerandoPDF(null)
        }
      }, 500)
    } catch (err) {
      console.error(err)
      toast.error("Error procesando los datos para el recibo.")
      setGenerandoPDF(null)
    }
  }

  const handleGuardarGasto = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingGasto(true)
    setGastoError('')
    try {
      const formData = new FormData()
      formData.append('concepto', gastoForm.concepto)
      formData.append('categoria', gastoForm.categoria)
      formData.append('monto', gastoForm.monto)
      formData.append('fecha_gasto', gastoForm.fecha_gasto)
      formData.append('metodo_pago', gastoForm.metodo_pago)
      formData.append('notas', gastoForm.notas)

      const result = await registrarGasto(formData)
      if (result.success) {
        setShowGastoModal(false)
        setGastoForm({
          concepto: '',
          categoria: 'Suministros/Materiales',
          monto: '',
          fecha_gasto: new Date().toISOString().split('T')[0],
          metodo_pago: 'Efectivo',
          notas: ''
        })
        toast.success('Gasto registrado exitosamente')
      } else {
        setGastoError(result.error || 'Error desconocido')
      }
    } catch (err: any) {
      setGastoError(err.message)
    } finally {
      setIsSubmittingGasto(false)
    }
  }

  const handleDeleteGasto = async (id: string) => {
    setConfirmModal({isOpen: true, id})
  }

  const confirmDeleteGasto = async () => {
    if (confirmModal.id) {
      await eliminarGasto(confirmModal.id)
      setConfirmModal({isOpen: false, id: ''})
      toast.success('Gasto eliminado')
    }
  }

  const confirmAnularPago = async (justificacion: string) => {
    if (auditModal.id) {
      setAuditModal(prev => ({ ...prev, isSubmitting: true }))
      await anularPago(auditModal.id, justificacion)
      setAuditModal({isOpen: false, id: '', isSubmitting: false})
      toast.success('Pago anulado exitosamente')
    }
  }

  const handleDeletePago = (id: string) => {
    setConfirmPagoModal({isOpen: true, id})
  }

  const confirmDeletePago = async () => {
    if (confirmPagoModal.id) {
      await eliminarPago(confirmPagoModal.id)
      setConfirmPagoModal({isOpen: false, id: ''})
      toast.success('Pago eliminado permanentemente')
    }
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Barra de Filtro de Período y Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#0e787a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Filtrar Período:
            </span>

            <button
              type="button"
              onClick={() => setSelectedMonth('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMonth === 'todos'
                  ? 'bg-[#0e787a] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Todo el Histórico
            </button>

            <div className="relative inline-block">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e787a] focus:border-[#0e787a]"
              >
                <option value="todos">Todos los meses (Histórico)</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthName(m)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botones de Navegación Rápida */}
            {selectedMonth !== 'todos' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Mes anterior"
                  disabled={availableMonths.indexOf(selectedMonth) >= availableMonths.length - 1}
                  className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Mes siguiente"
                  disabled={availableMonths.indexOf(selectedMonth) <= 0}
                  className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-[#0e787a] bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showBreakdown ? 'Ocultar Desglose Mes a Mes' : 'Ver Desglose Mes a Mes'}
              <span className="ml-1">{showBreakdown ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Indicador de Filtro Activo */}
        {selectedMonth !== 'todos' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div>
              Mostrando finanzas de: <strong className="text-gray-900">{formatMonthName(selectedMonth)}</strong> ({filteredPagos.filter(p => p.estado !== 'anulado').length} ingresos, {filteredGastos.length} egresos)
            </div>
            <button
              type="button"
              onClick={() => setSelectedMonth('todos')}
              className="text-[#0e787a] hover:underline font-semibold"
            >
              Restablecer a todo el histórico &times;
            </button>
          </div>
        )}
      </div>

      {/* Metrics Cards (Actualizadas dinámicamente según el filtro) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta Ingresos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {selectedMonth === 'todos' ? 'Total Ingresos (Histórico)' : `Ingresos en ${formatMonthName(selectedMonth)}`}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
              {filteredPagos.filter(p => p.estado !== 'anulado').length} pagos
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0e787a] tracking-tight">
            {formatoMoneda(totalIngresosPeriodo)}
          </div>
          {selectedMonth !== 'todos' && (
            <div className="mt-2 text-xs text-gray-500 border-t border-gray-50 pt-2 flex justify-between">
              <span>Histórico total:</span>
              <span className="font-semibold text-gray-700">{formatoMoneda(totalIngresosHistorico)}</span>
            </div>
          )}
        </div>

        {/* Tarjeta Egresos / Gastos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {selectedMonth === 'todos' ? 'Total Gastos (Histórico)' : `Gastos en ${formatMonthName(selectedMonth)}`}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">
              {filteredGastos.length} egresos
            </span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatoMoneda(totalGastosPeriodo)}
          </div>
          {selectedMonth !== 'todos' && (
            <div className="mt-2 text-xs text-gray-500 border-t border-gray-50 pt-2 flex justify-between">
              <span>Histórico total:</span>
              <span className="font-semibold text-gray-700">{formatoMoneda(totalGastosHistorico)}</span>
            </div>
          )}
        </div>

        {/* Tarjeta Balance Neto */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {selectedMonth === 'todos' ? 'Balance Neto Acumulado' : `Balance en ${formatMonthName(selectedMonth)}`}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              balancePeriodo >= 0 ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-700'
            }`}>
              {balancePeriodo >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>
          <div className={`text-3xl font-extrabold tracking-tight ${balancePeriodo >= 0 ? 'text-[#224252]' : 'text-red-600'}`}>
            {formatoMoneda(balancePeriodo)}
          </div>
          {selectedMonth !== 'todos' && (
            <div className="mt-2 text-xs text-gray-500 border-t border-gray-50 pt-2 flex justify-between">
              <span>Balance histórico total:</span>
              <span className={`font-semibold ${balanceHistorico >= 0 ? 'text-teal-900' : 'text-red-600'}`}>
                {formatoMoneda(balanceHistorico)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desglose Mes a Mes (Tabla de evolución financiera mensual) */}
      {showBreakdown && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-800">Evolución y Comparativa Mes a Mes</span>
              <span className="text-xs text-gray-500">({availableMonths.length} meses con registros)</span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Haz clic en cualquier mes para filtrar los registros detallados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mes / Año
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Egresos
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Balance Neto
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlySummary.map((m) => {
                  const isSelected = selectedMonth === m.monthKey
                  return (
                    <tr
                      key={m.monthKey}
                      className={`transition-colors ${
                        isSelected ? 'bg-teal-50/80 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#0e787a]"></span>}
                          <span className={`font-semibold ${isSelected ? 'text-[#0e787a]' : 'text-gray-900'}`}>
                            {m.monthName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-xs text-gray-500">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{m.countPagos} pagos</span>
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{m.countGastos} gastos</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold text-[#0e787a]">
                        {formatoMoneda(m.ingresos)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold text-rose-600">
                        {formatoMoneda(m.gastos)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <span
                          className={`font-bold inline-block px-2.5 py-0.5 rounded-full text-xs ${
                            m.balance >= 0
                              ? 'bg-teal-100/70 text-teal-900'
                              : 'bg-rose-100/70 text-rose-900'
                          }`}
                        >
                          {formatoMoneda(m.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-xs">
                        {isSelected ? (
                          <span className="inline-flex items-center text-xs font-bold text-[#0e787a]">
                            Activo ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedMonth(m.monthKey)}
                            className="text-xs font-medium text-[#0e787a] hover:text-[#224252] hover:underline"
                          >
                            Ver detalle &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-900">
                <tr>
                  <td className="px-6 py-3 text-left">TOTAL HISTÓRICO ACUMULADO</td>
                  <td className="px-6 py-3 text-center text-xs text-gray-600">
                    {pagos.filter(p => p.estado !== 'anulado').length} pagos / {gastos.length} gastos
                  </td>
                  <td className="px-6 py-3 text-right text-[#0e787a]">{formatoMoneda(totalIngresosHistorico)}</td>
                  <td className="px-6 py-3 text-right text-rose-600">{formatoMoneda(totalGastosHistorico)}</td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                        balanceHistorico >= 0
                          ? 'bg-teal-200 text-teal-950 font-extrabold'
                          : 'bg-rose-200 text-rose-950 font-extrabold'
                      }`}
                    >
                      {formatoMoneda(balanceHistorico)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {selectedMonth !== 'todos' && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonth('todos')}
                        className="text-xs font-semibold text-[#0e787a] hover:underline"
                      >
                        Ver todo
                      </button>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${tab === 'ingresos' ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTab('ingresos')}
        >
          Ingresos ({filteredPagos.length})
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${tab === 'gastos' ? 'border-b-2 border-[#0e787a] text-[#0e787a]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTab('gastos')}
        >
          Gastos / Egresos ({filteredGastos.length})
        </button>
      </div>

      {/* Table: Ingresos */}
      {tab === 'ingresos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Historial de Pagos {selectedMonth !== 'todos' ? `— ${formatMonthName(selectedMonth)}` : '(Todo el Histórico)'}
            </h2>
            {selectedMonth !== 'todos' && (
              <button
                type="button"
                onClick={() => setSelectedMonth('todos')}
                className="text-xs font-medium text-[#0e787a] hover:underline"
              >
                Mostrar todos los meses
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Recibo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método / Concepto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPagos.map((pago) => {
                  const pacienteInfo = pago.pacientes || pacientes.find(p => p.id === pago.paciente_id)
                  const nombrePaciente = pacienteInfo?.nombre_completo || 'Desconocido'
                  
                  return (
                    <tr key={pago.id} className={`hover:bg-gray-50 ${pago.estado === 'anulado' ? 'opacity-60 bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pago.numero_recibo} {pago.estado === 'anulado' && <span className="ml-2 text-xs text-red-500 font-bold">(ANULADO)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pago.fecha_pago || pago.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{nombrePaciente}</div>
                        {pago.referencia && <div className="text-xs text-gray-500">Ref: {pago.referencia}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{pago.metodo_pago}</div>
                        <div className="text-xs text-gray-500 line-clamp-1" title={pago.concepto}>{pago.concepto}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${pago.estado === 'anulado' ? 'line-through text-gray-500' : 'text-[#0e787a]'}`}>
                        {formatoMoneda(Number(pago.monto) + (Number(pago.monto_donacion) || 0))}
                        {Number(pago.monto_donacion) > 0 && (
                          <div className="text-[10px] text-indigo-500 font-normal mt-0.5">
                            + Aporte de tercero
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {pago.estado !== 'anulado' ? (
                          <>
                            <button 
                              onClick={() => descargarPDF(pago)} 
                              disabled={generandoPDF === pago.id}
                              className="text-[#0e787a] hover:text-[#224252] disabled:opacity-50"
                            >
                              {generandoPDF === pago.id ? 'Generando...' : 'PDF'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleWhatsApp(pacienteInfo?.telefono, pago, nombrePaciente)} 
                              className="text-[#25D366] hover:text-[#128C7E]"
                            >
                              WhatsApp
                            </button>
                            <span className="text-gray-300">|</span>
                            <Link 
                              href={`/admin/pagos/${pago.id}/editar`}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Editar
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => setAuditModal({isOpen: true, id: pago.id, isSubmitting: false})} 
                              className="text-red-500 hover:text-red-700"
                            >
                              Anular
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleDeletePago(pago.id)} 
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-xs text-red-500 italic max-w-xs block truncate" title={pago.motivo_anulacion}>
                              Motivo: {pago.motivo_anulacion}
                            </span>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleDeletePago(pago.id)} 
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredPagos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No se encontraron pagos registrados en {formatMonthName(selectedMonth)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Gastos */}
      {tab === 'gastos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Historial de Gastos {selectedMonth !== 'todos' ? `— ${formatMonthName(selectedMonth)}` : '(Todo el Histórico)'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {selectedMonth !== 'todos' && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth('todos')}
                  className="text-xs font-medium text-[#0e787a] hover:underline"
                >
                  Mostrar todos los meses
                </button>
              )}
              <button
                onClick={() => setShowGastoModal(true)}
                className="px-4 py-2 bg-[#0e787a] text-white rounded-md text-sm font-medium hover:bg-[#0b5c5d] transition-colors"
              >
                + Registrar Gasto
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGastos.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(gasto.fecha_gasto).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{gasto.concepto}</div>
                      {gasto.notas && <div className="text-xs text-gray-500">{gasto.notas}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {gasto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gasto.metodo_pago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">
                      {formatoMoneda(gasto.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteGasto(gasto.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGastos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No se encontraron gastos registrados en {formatMonthName(selectedMonth)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Gasto */}
      {showGastoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Gasto</h3>
              <button 
                onClick={() => setShowGastoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleGuardarGasto} className="p-6 space-y-4">
              {gastoError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                  {gastoError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Concepto / Descripción *</label>
                <input 
                  type="text" 
                  required
                  value={gastoForm.concepto}
                  onChange={(e) => setGastoForm({...gastoForm, concepto: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                  placeholder="Ej: Pago arriendo, papelería..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Categoría *</label>
                  <select 
                    required
                    value={gastoForm.categoria}
                    onChange={(e) => setGastoForm({...gastoForm, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                  >
                    <option value="Arriendo">Arriendo</option>
                    <option value="Suministros/Materiales">Suministros/Materiales</option>
                    <option value="Software/Tecnología">Software/Tecnología</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Publicidad/Marketing">Publicidad/Marketing</option>
                    <option value="Impuestos">Impuestos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Monto ($) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={gastoForm.monto}
                    onChange={(e) => setGastoForm({...gastoForm, monto: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Fecha del Gasto *</label>
                  <input 
                    type="date" 
                    required
                    value={gastoForm.fecha_gasto}
                    onChange={(e) => setGastoForm({...gastoForm, fecha_gasto: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Método de Pago *</label>
                  <select 
                    required
                    value={gastoForm.metodo_pago}
                    onChange={(e) => setGastoForm({...gastoForm, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Notas / Observaciones</label>
                <textarea 
                  rows={2}
                  value={gastoForm.notas}
                  onChange={(e) => setGastoForm({...gastoForm, notas: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0e787a]"
                  placeholder="Detalles adicionales opcionales..."
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowGastoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingGasto}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#0e787a] hover:bg-[#0b5c5d] focus:outline-none focus:ring-2 focus:ring-[#0e787a] disabled:opacity-50"
                >
                  {isSubmittingGasto ? 'Guardando...' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden PDF Template Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, zIndex: -1 }}>
        {pdfData && (
          <PDFReciboTemplate 
            ref={pdfRef}
            pago={pdfData.pago}
            paciente={pdfData.paciente}
            logoBase64={pdfData.logoBase64}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Gasto"
        message="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteGasto}
        onCancel={() => setConfirmModal({isOpen: false, id: ''})}
      />

      <ConfirmModal
        isOpen={confirmPagoModal.isOpen}
        title="Eliminar Pago"
        message="¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer y borrará el registro de la base de datos permanentemente."
        onConfirm={confirmDeletePago}
        onCancel={() => setConfirmPagoModal({isOpen: false, id: ''})}
      />

      <AuditModal
        isOpen={auditModal.isOpen}
        title="Anular Recibo de Pago"
        description="Esta acción marcará el recibo como anulado y descontará el monto del balance neto. Debes proporcionar una justificación válida (mínimo 10 caracteres)."
        onConfirm={confirmAnularPago}
        onCancel={() => setAuditModal({isOpen: false, id: '', isSubmitting: false})}
        isSubmitting={auditModal.isSubmitting}
      />
    </div>
  )
}
