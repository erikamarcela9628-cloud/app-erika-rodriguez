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
    [key: string]: string | undefined
  }
}

const PDFContratoTemplate = forwardRef<HTMLDivElement, PDFProps>(
  ({ contrato, paciente1, paciente2, firmas, imagesBase64 }, ref) => {
    const isMenor = contrato.modalidad_atencion === 'Menor de Edad';
    const meta = contrato.metadata || {};

    const formatFirmadoPor = (firmado_por: string) => {
      switch (firmado_por) {
        case 'paciente_1': return 'Paciente 1';
        case 'paciente_2': return 'Paciente 2';
        case 'tutor_1': return 'Tutor 1';
        case 'tutor_2': return 'Tutor 2';
        case 'menor_asentimiento': return 'Asentimiento Menor';
        default: return firmado_por;
      }
    }

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
          <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {imagesBase64.firmaPsicologa && (
              <img 
                src={imagesBase64.firmaPsicologa} 
                alt="Firma Psicóloga" 
                style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                crossOrigin="anonymous"
              />
            )}
            <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
              <strong>Erika Marcela Rodríguez López</strong>
              <br/>Psicóloga • C.C. 1.121.933.244
              <br/>T.P. No. 244628
            </div>
          </div>

          {!isMenor && (
            <>
              {/* Paciente 1 */}
              <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {imagesBase64.paciente_1 && (
                  <img 
                    src={imagesBase64.paciente_1}
                    alt="Firma Paciente 1" 
                    style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                    crossOrigin="anonymous"
                  />
                )}
                <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
                  <strong>{paciente1?.nombre_completo}</strong>
                  <br/>{paciente1?.tipo_documento} {paciente1?.numero_documento}
                </div>
              </div>

              {/* Paciente 2 (Si aplica) */}
              {contrato.modalidad_atencion === 'Pareja' && paciente2 && (
                <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imagesBase64.paciente_2 && (
                    <img 
                      src={imagesBase64.paciente_2}
                      alt="Firma Paciente 2" 
                      style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                      crossOrigin="anonymous"
                    />
                  )}
                  <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
                    <strong>{paciente2?.nombre_completo}</strong>
                    <br/>{paciente2?.tipo_documento} {paciente2?.numero_documento}
                  </div>
                </div>
              )}
            </>
          )}

          {isMenor && (
            <>
              {/* Tutor 1 */}
              <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {imagesBase64.tutor_1 && (
                  <img 
                    src={imagesBase64.tutor_1}
                    alt="Firma Tutor 1" 
                    style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                    crossOrigin="anonymous"
                  />
                )}
                <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
                  <strong>{meta.tutor_1?.nombre}</strong>
                  <br/>{meta.tutor_1?.tipo_doc} {meta.tutor_1?.num_doc}
                  <br/><span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{meta.tutor_1?.parentesco}</span>
                </div>
              </div>

              {/* Tutor 2 */}
              {meta.requiere_tutor_2 && (
                <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imagesBase64.tutor_2 && (
                    <img 
                      src={imagesBase64.tutor_2}
                      alt="Firma Tutor 2" 
                      style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                      crossOrigin="anonymous"
                    />
                  )}
                  <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
                    <strong>{meta.tutor_2?.nombre}</strong>
                    <br/>{meta.tutor_2?.tipo_doc} {meta.tutor_2?.num_doc}
                    <br/><span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{meta.tutor_2?.parentesco}</span>
                  </div>
                </div>
              )}

              {/* Asentimiento */}
              {meta.requiere_asentimiento && (
                <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imagesBase64.menor_asentimiento && (
                    <img 
                      src={imagesBase64.menor_asentimiento}
                      alt="Asentimiento Menor" 
                      style={{ maxWidth: '180px', height: 'auto', maxHeight: '80px', objectFit: 'contain', marginBottom: '-15px', position: 'relative', zIndex: 1 }}
                      crossOrigin="anonymous"
                    />
                  )}
                  <div style={{ borderTop: '1px solid #224252', width: '100%', textAlign: 'center', paddingTop: '10px', zIndex: 0, position: 'relative' }}>
                    <strong>{meta.menor?.nombre}</strong>
                    <br/>{meta.menor?.tipo_doc} {meta.menor?.num_doc}
                    <br/><span style={{ fontSize: '10px', textTransform: 'uppercase' }}>ASENTIMIENTO DEL MENOR</span>
                  </div>
                </div>
              )}
            </>
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
                      Datos de Firma: {formatFirmadoPor(firma.firmado_por)}
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
