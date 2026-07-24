import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, firmante } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      )
    }

    // 1. Obtener contrato
    const { data: contrato, error: errC } = await supabaseServer
      .from('contratos')
      .select('id, modalidad_atencion, estado, metadata')
      .eq('token_acceso', token)
      .single()

    if (errC || !contrato) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
    }

    if (contrato.estado === 'firmado') {
      return NextResponse.json({ success: true, message: 'El contrato ya estaba completamente firmado' })
    }

    // 2. Contar firmas
    const { data: firmas, error: errF } = await supabaseServer
      .from('firmas_trazabilidad')
      .select('id')
      .eq('contrato_id', contrato.id)
    
    if (errF) {
      throw new Error(`Error al contar firmas: ${errF.message}`)
    }

    const cantidadFirmas = firmas?.length || 0;
    const requeridas = contrato.metadata?.firmas_requeridas || (contrato.modalidad_atencion === 'Pareja' ? 2 : 1);

    console.log(`[Webhook Interno] Contrato ${token}. Firmas: ${cantidadFirmas}/${requeridas}. Firmante actual: ${firmante}`);

    if (cantidadFirmas >= requeridas) {
      // 3. Actualizar el estado del contrato
      await supabaseServer
        .from('contratos')
        .update({ estado: 'firmado' })
        .eq('id', contrato.id)
      
      console.log(`[Webhook Interno] Contrato ${token} actualizado a 'firmado' exitosamente.`)
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación procesada exitosamente',
      token
    })
  } catch (error) {
    console.error('Error procesando webhook de firma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
