'use client'

import React, { forwardRef } from 'react'

interface PDFHistoriaProps {
  historia: any
  evoluciones: any[]
  logoBase64: string
  firmaBase64: string
}

const PDFHistoriaTemplate = forwardRef<HTMLDivElement, PDFHistoriaProps>(
  ({ historia, evoluciones, logoBase64, firmaBase64 }, ref) => {
    const pac = historia.pacientes || {}
    const acudiente = historia.acudiente || {}
    const eps = historia.eps || {}
    const antecedentes = historia.antecedentes || {}
    const anamnesis = historia.anamnesis || {}
    const ex = historia.examen_mental || {}
    const diag = historia.analisis_diagnostico || {}
    const demo = historia.datos_demograficos || {}

    return (
      <div 
        ref={ref} 
        style={{ width: '800px', backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Membrete Oficial FBE.70 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                {logoBase64 && (
                  <img src={logoBase64} alt="Logo" style={{ height: '60px', objectFit: 'contain' }} />
                )}
              </td>
              <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                HISTORIA CLÍNICA Y EVOLUCIÓN TERAPÉUTICA
              </td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '5px', fontSize: '11px' }}>
                <strong>CÓDIGO:</strong> FBE.70<br/>
                <strong>VERSIÓN:</strong> 01
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontSize: '12px' }}>
                <strong>Psicóloga ERIKA MARCELA RODRÍGUEZ LÓPEZ</strong><br/>
                Psicóloga | C.C. 1.121.933.244 | T.P. No. 244628
              </td>
              <td style={{ border: '1px solid #000', padding: '5px', fontSize: '11px' }}>
                <strong>FECHA:</strong> {new Date(historia.created_at).toLocaleDateString('es-CO')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 1. Datos de Identificación */}
        <h3 style={{ fontSize: '14px', backgroundColor: '#e5e7eb', padding: '5px', border: '1px solid #000', margin: 0 }}>1. DATOS DE IDENTIFICACIÓN Y DEMOGRÁFICOS</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px', fontSize: '12px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Nombres y Apellidos:</strong> {pac.nombre_completo}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Identificación:</strong> {pac.tipo_documento} {pac.numero_documento}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Celular:</strong> {pac.telefono}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Email:</strong> {pac.email}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}>
                <strong>Edad al Ingreso:</strong> {demo.edad_atencion_anos ? `${demo.edad_atencion_anos} años y ${demo.edad_atencion_meses} meses` : 'N/A'}
              </td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Género:</strong> {demo.genero || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Estado Civil:</strong> {demo.estado_civil || 'N/A'}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Municipio:</strong> {demo.municipio_residencia || 'N/A'}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>
                <strong>Información Académica / Remisión:</strong>{' '}
                {demo.es_estudiante ? `Estudiante. ${demo.es_remitido_colegio ? `Remitido por: ${demo.institucion_remite}` : 'Sin remisión institucional.'}` : 'No es estudiante.'}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>EPS:</strong> {eps.nombre} ({eps.regimen})</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Acudiente:</strong> {acudiente.nombre || 'N/A'} ({acudiente.parentesco})</td>
            </tr>
          </tbody>
        </table>

        {/* 2. Anamnesis */}
        <h3 style={{ fontSize: '14px', backgroundColor: '#e5e7eb', padding: '5px', border: '1px solid #000', margin: 0 }}>2. ANAMNESIS Y MOTIVO DE CONSULTA</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px', fontSize: '12px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}>
                <strong>Motivo de Consulta (Paciente):</strong><br/>
                {anamnesis.motivo_consulta}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}>
                <strong>Definición del Problema (Profesional):</strong><br/>
                {anamnesis.definicion_problema}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}>
                <strong>Antecedentes (Físicos/Mentales, Personales/Familiares):</strong><br/>
                {antecedentes.personales_familiares || 'Niega o sin datos relevantes'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. Examen Mental */}
        <h3 style={{ fontSize: '14px', backgroundColor: '#e5e7eb', padding: '5px', border: '1px solid #000', margin: 0 }}>3. EXAMEN MENTAL</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px', fontSize: '12px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', width: '50%' }}><strong>Aspecto Físico:</strong> {ex.aspecto_fisico}</td>
              <td style={{ border: '1px solid #000', padding: '5px', width: '50%' }}><strong>Actitud:</strong> {ex.actitud}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Estado de Consciencia:</strong> {ex.consciencia}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Lenguaje y Habla:</strong> {ex.lenguaje}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Orientación:</strong> {ex.orientacion}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Sensopercepción:</strong> {ex.sensopercepcion}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Pensamiento:</strong> {ex.pensamiento}</td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Afectividad:</strong> {ex.afectividad}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', backgroundColor: (ex.nivel_riesgo_suicida === 'Medio' || ex.nivel_riesgo_suicida === 'Alto') ? '#fee2e2' : 'transparent' }}>
                <strong>Nivel Riesgo Suicida:</strong>{' '}
                <span style={{ fontWeight: (ex.nivel_riesgo_suicida === 'Medio' || ex.nivel_riesgo_suicida === 'Alto') ? 'bold' : 'normal', color: (ex.nivel_riesgo_suicida === 'Medio' || ex.nivel_riesgo_suicida === 'Alto') ? '#991b1b' : 'inherit' }}>
                  {ex.nivel_riesgo_suicida || ex.riesgo_suicida || 'Sin Riesgo'}
                </span>
              </td>
              <td style={{ border: '1px solid #000', padding: '5px' }}><strong>Consciencia de Enfermedad:</strong> {ex.consciencia_enfermedad}</td>
            </tr>
          </tbody>
        </table>

        {/* 4. Diagnóstico y Plan */}
        <h3 style={{ fontSize: '14px', backgroundColor: '#e5e7eb', padding: '5px', border: '1px solid #000', margin: 0 }}>4. ANÁLISIS, DIAGNÓSTICO Y PLAN</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px', fontSize: '12px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }} colSpan={2}>
                <strong>Análisis Objetivo:</strong><br/>
                {diag.analisis}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px', width: '50%' }}>
                <strong>Diagnóstico CIE-10:</strong> {diag.cie10}
              </td>
              <td style={{ border: '1px solid #000', padding: '5px', width: '50%' }}>
                <strong>Tipo de Tratamiento:</strong> {diag.tipo_tratamiento}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '5px' }} colSpan={2}>
                <strong>Plan de Intervención:</strong><br/>
                {diag.plan}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Evoluciones */}
        <h3 style={{ fontSize: '14px', backgroundColor: '#e5e7eb', padding: '5px', border: '1px solid #000', margin: 0 }}>5. REGISTRO DE EVOLUCIONES</h3>
        {evoluciones.length === 0 ? (
          <div style={{ border: '1px solid #000', borderTop: 'none', padding: '10px', fontSize: '12px', textAlign: 'center' }}>
            No hay evoluciones registradas para esta historia clínica.
          </div>
        ) : (
          evoluciones.map((evol: any, index: number) => (
            <table key={evol.id} style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', marginBottom: index === evoluciones.length - 1 ? '20px' : '0', fontSize: '12px' }}>
              <tbody>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>
                    Sesión N° {evol.numero_sesion} - Fecha: {new Date(evol.fecha_sesion).toLocaleDateString('es-CO')}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>
                    <strong>Evolución:</strong><br/>
                    {evol.evolucion_terapeutica}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '5px' }}>
                    <strong>Observaciones:</strong><br/>
                    {evol.observaciones_valoracion || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          ))
        )}

        {/* Firma del Profesional */}
        <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {firmaBase64 && (
            <img 
              src={firmaBase64} 
              alt="Firma Profesional" 
              style={{ 
                maxWidth: '180px', 
                height: 'auto', 
                maxHeight: '80px',
                objectFit: 'contain',
                marginBottom: '-15px',
                position: 'relative',
                zIndex: 1
              }} 
            />
          )}
          <div style={{ borderTop: '1px solid #000', width: '250px', textAlign: 'center', paddingTop: '5px', fontSize: '12px', zIndex: 0, position: 'relative' }}>
            <strong>Erika Marcela Rodríguez López</strong><br/>
            Psicóloga<br/>
            C.C. 1.121.933.244 - T.P. No. 244628
          </div>
        </div>

        {/* Pie de página legal */}
        <div style={{ marginTop: '30px', fontSize: '9px', color: '#4b5563', textAlign: 'justify', lineHeight: '1.4' }}>
          <strong>RESERVA LEGAL DE LA HISTORIA CLÍNICA:</strong> La presente Historia Clínica es un documento privado, obligatorio y sometido a reserva, en el cual se registran cronológicamente las condiciones de salud del paciente y los actos derivados de la atención. Según la Resolución 1995 de 1999 y Ley 1090 de 2006, únicamente puede ser conocida por terceros con previa autorización del paciente o en los casos previstos por la Ley. Conforme a la Ley Estatutaria 1581 de 2012, el paciente ha otorgado su consentimiento para el tratamiento de estos datos sensibles.
        </div>

      </div>
    )
  }
)

PDFHistoriaTemplate.displayName = 'PDFHistoriaTemplate'

export default PDFHistoriaTemplate
