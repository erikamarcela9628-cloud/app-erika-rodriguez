'use client'

import React, { forwardRef } from 'react'

interface PDFProps {
  contrato: any
  paciente1: any
  paciente2: any
  firmas: any[]
  imagesBase64: {
    logo: string
    firmaPsicologa: string
    firmaPaciente1: string
    firmaPaciente2?: string
  }
}

const PDFContratoTemplate = forwardRef<HTMLDivElement, PDFProps>(
  ({ contrato, paciente1, paciente2, firmas, imagesBase64 }, ref) => {
    
    // Obtener las firmas correspondientes
    const firmaP1 = firmas.find(f => f.firmado_por === 'paciente_1') || firmas[0]
    const firmaP2 = firmas.find(f => f.firmado_por === 'paciente_2')

    return (
      <div 
        ref={ref} 
        style={{ width: '800px', backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {imagesBase64.logo && (
            <img 
              src={imagesBase64.logo} 
              alt="Logo" 
              style={{ height: '80px', margin: '0 auto' }} 
              crossOrigin="anonymous"
            />
          )}
          <h1 style={{ color: '#224252', fontSize: '24px', marginTop: '20px' }}>Contrato Terapéutico de Psicología</h1>
        </div>

        {/* Cuerpo del Contrato */}
        <div style={{ fontSize: '14px', lineHeight: '1.6', textAlign: 'justify', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
          {contrato.contenido_texto}
        </div>

        {/* Firmas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', flexWrap: 'wrap', gap: '20px', pageBreakInside: 'avoid' }}>
          
          {/* Psicóloga */}
          <div style={{ width: '30%', textAlign: 'center' }}>
            {imagesBase64.firmaPsicologa && (
              <img 
                src={imagesBase64.firmaPsicologa} 
                alt="Firma Psicóloga" 
                style={{ height: '80px', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
            )}
            <div style={{ borderTop: '1px solid #224252', paddingTop: '10px' }}>
              <strong>Erika Marcela Rodríguez López</strong>
              <br/>Psicóloga • C.C. 1.121.933.244
              <br/>T.P. 244628
            </div>
          </div>

          {/* Paciente 1 */}
          <div style={{ width: '30%', textAlign: 'center' }}>
            {imagesBase64.firmaPaciente1 && (
              <img 
                src={imagesBase64.firmaPaciente1}
                alt="Firma Paciente 1" 
                style={{ height: '80px', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
            )}
            <div style={{ borderTop: '1px solid #224252', paddingTop: '10px' }}>
              <strong>{paciente1?.nombre_completo}</strong>
              <br/>{paciente1?.tipo_documento} {paciente1?.numero_documento}
            </div>
          </div>

          {/* Paciente 2 (Si aplica) */}
          {contrato.modalidad_atencion === 'Pareja' && paciente2 && (
            <div style={{ width: '30%', textAlign: 'center' }}>
              {imagesBase64.firmaPaciente2 && (
                <img 
                  src={imagesBase64.firmaPaciente2}
                  alt="Firma Paciente 2" 
                  style={{ height: '80px', objectFit: 'contain' }}
                  crossOrigin="anonymous"
                />
              )}
              <div style={{ borderTop: '1px solid #224252', paddingTop: '10px' }}>
                <strong>{paciente2?.nombre_completo}</strong>
                <br/>{paciente2?.tipo_documento} {paciente2?.numero_documento}
              </div>
            </div>
          )}
        </div>

        {/* Auditoría / Trazabilidad Ley 527 */}
        <div style={{ marginTop: '80px', padding: '20px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '11px', color: '#4b5563', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#111827' }}>HOJA DE AUDITORÍA Y TRAZABILIDAD (Ley 527 de 1999)</h3>
          <p>Este documento es una representación impresa de un contrato electrónico firmado digitalmente.</p>
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold', width: '150px' }}>ID Contrato:</td>
                <td style={{ padding: '4px' }}>{contrato.id}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px', fontWeight: 'bold' }}>Token de Acceso:</td>
                <td style={{ padding: '4px' }}>{contrato.token_acceso}</td>
              </tr>
              {firmas.map((firma, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td colSpan={2} style={{ padding: '8px 4px 4px 4px', fontWeight: 'bold', borderTop: '1px solid #e5e7eb' }}>
                      Datos de Firma {firma.firmado_por === 'paciente_2' ? 'Paciente 2' : 'Paciente 1'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>Fecha / Hora (UTC):</td>
                    <td style={{ padding: '4px' }}>{firma.fecha_firma}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>IP Origen:</td>
                    <td style={{ padding: '4px' }}>{firma.ip_origen}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 'bold' }}>Hash SHA-256:</td>
                    <td style={{ padding: '4px', wordBreak: 'break-all' }}>{firma.hash_sha256}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

PDFContratoTemplate.displayName = 'PDFContratoTemplate'

export default PDFContratoTemplate
