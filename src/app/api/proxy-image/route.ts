import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

// Extensiones de imagen estrictamente permitidas
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export async function GET(req: NextRequest) {
  // 1. Verificación de Autenticación de Sesión (Defense-in-depth)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || (adminEmail && user.email !== adminEmail)) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL requerida', { status: 400 });
  }

  try {
    const publicDir = path.resolve(process.cwd(), 'public');

    // 2. Resolver archivos estáticos locales de la carpeta /public (con prevención estricta de Path Traversal)
    if (imageUrl.startsWith('/') || imageUrl.includes('logo-erika') || imageUrl.includes('firma-erika') || imageUrl.includes('Diseno-sin-titulo')) {
      let relativePath = imageUrl;
      
      if (imageUrl.includes('Diseno-sin-titulo') || imageUrl.includes('firma-erika')) {
        relativePath = 'firma-erika.png';
      } else if (imageUrl.includes('logo-erika')) {
        relativePath = 'logo-erika.png';
      } else if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
      }

      // Normalizar y resolver ruta canónica absoluta
      const cleanRelative = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      const resolvedPath = path.resolve(publicDir, cleanRelative);

      // VERIFICACIÓN 1: El archivo DEBE estar contenido dentro de /public/ (previene /../.env y LFI)
      if (!resolvedPath.startsWith(publicDir + path.sep) && resolvedPath !== publicDir) {
        return new NextResponse('Acceso denegado: ruta fuera del directorio permitido', { status: 403 });
      }

      // VERIFICACIÓN 2: La extensión DEBE ser una imagen válida
      const ext = path.extname(resolvedPath).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return new NextResponse('Tipo de archivo no permitido', { status: 403 });
      }

      if (fs.existsSync(resolvedPath)) {
        const fileBuffer = fs.readFileSync(resolvedPath);
        const mimeExt = ext.replace('.', '') === 'svg' ? 'svg+xml' : ext.replace('.', '');
        const dataUri = `data:image/${mimeExt};base64,${fileBuffer.toString('base64')}`;
        return NextResponse.json({ dataUri });
      } else {
        return new NextResponse('Archivo no encontrado', { status: 404 });
      }
    }

    // 3. Resolver firmas digitales de contratos desde Supabase Storage
    if (imageUrl.includes('firmas-contratos')) {
      const parts = imageUrl.split('firmas-contratos/');
      const rawFileName = parts[parts.length - 1];

      // Sanitizar el nombre del archivo para evitar path traversal dentro del bucket
      const cleanFileName = path.basename(rawFileName.split('?')[0]);

      // Validar formato seguro del nombre de archivo de firma
      if (!cleanFileName || !/^[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg|webp)$/i.test(cleanFileName)) {
        return new NextResponse('Nombre de archivo de firma no válido', { status: 400 });
      }

      const { data, error } = await supabaseServer.storage
        .from('firmas-contratos')
        .download(cleanFileName);

      if (error || !data) {
        throw new Error(error?.message || 'Error al descargar la firma desde Supabase Storage');
      }

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const contentType = data.type || 'image/png';
      const dataUri = `data:${contentType};base64,${base64}`;

      return NextResponse.json({ dataUri });
    }

    // 4. Si es una URL externa, validar ESTRICTAMENTE que pertenezca al dominio de Supabase del proyecto (Prevención total de SSRF)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let allowedHost = '';
    if (supabaseUrl) {
      try {
        allowedHost = new URL(supabaseUrl).hostname;
      } catch {
        allowedHost = '';
      }
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(imageUrl);
    } catch {
      return new NextResponse('URL externa inválida', { status: 400 });
    }

    // Bloquear cualquier URL que no sea HTTPS o no coincida con el dominio del proyecto
    if (targetUrl.protocol !== 'https:' || !allowedHost || targetUrl.hostname !== allowedHost) {
      return new NextResponse('Dominio no autorizado para el proxy de imágenes', { status: 403 });
    }

    const response = await fetch(targetUrl.toString());
    const contentType = response.headers.get('content-type') || 'image/png';

    // Verificar que la respuesta sea realmente una imagen
    if (!contentType.startsWith('image/')) {
      return new NextResponse('El recurso solicitado no es una imagen', { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ dataUri });
  } catch (error) {
    console.error('Error in proxy-image:', error);
    return new NextResponse('Error al obtener la imagen', { status: 500 });
  }
}
