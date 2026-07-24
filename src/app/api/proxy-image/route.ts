import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL requerida', { status: 400 });
  }

  try {
    if (imageUrl.includes('firmas-contratos')) {
      const parts = imageUrl.split('firmas-contratos/');
      const nombreArchivo = parts[parts.length - 1];

      const { data, error } = await supabaseServer.storage
        .from('firmas-contratos')
        .download(nombreArchivo);

      if (error || !data) {
        throw new Error(error?.message || 'Error al descargar el archivo con Supabase SDK');
      }

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const contentType = data.type || 'image/png';
      const dataUri = `data:${contentType};base64,${base64}`;

      return NextResponse.json({ dataUri });
    } else {
      const response = await fetch(imageUrl);
      const contentType = response.headers.get('content-type') || 'image/png';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUri = `data:${contentType};base64,${base64}`;

      return NextResponse.json({ dataUri });
    }
  } catch (error) {
    console.error('Error in proxy-image:', error);
    return new NextResponse('Error al obtener la imagen', { status: 500 });
  }
}
