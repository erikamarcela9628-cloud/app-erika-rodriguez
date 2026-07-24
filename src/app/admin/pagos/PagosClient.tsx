'use client'

import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import PDFReciboTemplate from '@/components/PDFReciboTemplate'

interface PagosClientProps {
  pagos: any[]
  pacientes: any[]
}

export default function PagosClient({ pagos, pacientes }: PagosClientProps) {
  const [generandoPDF, setGenerandoPDF] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<{ pago: any, paciente: any, logoBase64: string } | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

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
    if (!telefono) {
      alert("El paciente no tiene un número de teléfono registrado.");
      return;
    }
    const telClean = telefono.replace(/\D/g, '');
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
      const logoB64 = await getBase64ImageFromUrl('https://erikarodriguezpsicologa.com/wp-content/uploads/2026/07/logo-erika-.png').catch(() => '')

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

          while (heightLeft > 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
            heightLeft -= pageHeight
          }

          pdf.save(`${pago.numero_recibo}.pdf`)
        } catch (err) {
          console.error("Error generando PDF:", err)
          alert("Error generando el documento PDF.")
        } finally {
          setGenerandoPDF(null)
          setPdfData(null)
        }
      }, 500)
    } catch (err) {
      console.error(err)
      alert("Error procesando los datos para el recibo.")
      setGenerandoPDF(null)
    }
  }

  const totalRecaudado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0)
  const pagosEfectivo = pagos.filter(p => p.metodo_pago === 'Efectivo').reduce((sum, p) => sum + Number(p.monto), 0)
  const pagosDigitales = totalRecaudado - pagosEfectivo

  const formatoMoneda = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Recaudado</div>
          <div className="text-3xl font-bold text-[#224252]">{formatoMoneda(totalRecaudado)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Pagos en Efectivo</div>
          <div className="text-3xl font-bold text-[#0e787a]">{formatoMoneda(pagosEfectivo)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Pagos Digitales (Transf, Nequi...)</div>
          <div className="text-3xl font-bold text-[#224252]">{formatoMoneda(pagosDigitales)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Pagos</h2>
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
              {pagos.map((pago) => {
                const pacienteInfo = pago.pacientes || pacientes.find(p => p.id === pago.paciente_id)
                const nombrePaciente = pacienteInfo?.nombre_completo || 'Desconocido'
                
                return (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pago.numero_recibo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{nombrePaciente}</div>
                      {pago.referencia && <div className="text-xs text-gray-500">Ref: {pago.referencia}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pago.metodo_pago}</div>
                      <div className="text-xs text-gray-500 line-clamp-1" title={pago.concepto}>{pago.concepto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0e787a]">
                      {formatoMoneda(pago.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
                    </td>
                  </tr>
                )
              })}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No se han registrado pagos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  )
}
