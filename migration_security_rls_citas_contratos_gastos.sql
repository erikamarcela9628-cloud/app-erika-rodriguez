-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD INTEGRAL: RLS EN CITAS, CONTRATOS, GASTOS, FIRMAS Y STORAGE
-- Propósito: Proteger los datos clínicos y biométricos confidenciales de pacientes
-- cerrando accesos no autorizados mediante la anon key de Supabase.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA: CITAS (Agendamiento e Información Clínica de Citas)
-- ------------------------------------------------------------------------------
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas (permisivas o duplicadas)
DROP POLICY IF EXISTS "Permitir todo a anon en citas" ON public.citas;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.citas;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.citas;
DROP POLICY IF EXISTS "Enable update for all users" ON public.citas;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.citas;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados en citas" ON public.citas;

-- Crear política estricta: Solo usuarios autenticados (Dra. Erika) pueden gestionar citas
CREATE POLICY "Acceso total para usuarios autenticados en citas"
ON public.citas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 2. TABLA: GASTOS (Contabilidad y Finanzas Operativas)
-- ------------------------------------------------------------------------------
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas
DROP POLICY IF EXISTS "Permitir todo a anon en gastos" ON public.gastos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gastos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.gastos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.gastos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.gastos;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados en gastos" ON public.gastos;

-- Crear política estricta: Solo usuarios autenticados pueden ver o gestionar gastos
CREATE POLICY "Acceso total para usuarios autenticados en gastos"
ON public.gastos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 3. TABLA: CONTRATOS (Consentimientos Informados y Contratos Terapéuticos)
-- ------------------------------------------------------------------------------
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas
DROP POLICY IF EXISTS "Permitir todo a anon en contratos" ON public.contratos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contratos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contratos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.contratos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.contratos;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados en contratos" ON public.contratos;

-- Crear política estricta: Solo usuarios autenticados pueden gestionar contratos
-- Nota: La firma de pacientes se valida por token en el servidor mediante Service Role
CREATE POLICY "Acceso total para usuarios autenticados en contratos"
ON public.contratos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 4. TABLA: FIRMAS_TRAZABILIDAD (Auditoría Forense de Firmas de Contratos)
-- ------------------------------------------------------------------------------
ALTER TABLE public.firmas_trazabilidad ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas
DROP POLICY IF EXISTS "Permitir todo a anon en firmas_trazabilidad" ON public.firmas_trazabilidad;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.firmas_trazabilidad;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados en firmas_trazabilidad" ON public.firmas_trazabilidad;
DROP POLICY IF EXISTS "Permitir insercion anonima de firmas con token" ON public.firmas_trazabilidad;

-- Usuarios autenticados tienen acceso completo para auditoría y visualización
-- El registro de firmas de pacientes se realiza vía Server Action autenticado con Service Role
CREATE POLICY "Acceso total para usuarios autenticados en firmas_trazabilidad"
ON public.firmas_trazabilidad
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET: FIRMAS-CONTRATOS (Hacerlo privado y proteger firmas biométricas)
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'firmas-contratos';

-- Eliminar políticas públicas en storage.objects para el bucket de firmas
DROP POLICY IF EXISTS "Public Access firmas-contratos" ON storage.objects;
DROP POLICY IF EXISTS "Give anon full access to firmas-contratos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload anon a firmas-contratos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura publica de firmas-contratos" ON storage.objects;
DROP POLICY IF EXISTS "Acceso autenticado a firmas-contratos" ON storage.objects;

-- Permitir acceso a storage únicamente a usuarios autenticados
CREATE POLICY "Acceso autenticado a firmas-contratos"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'firmas-contratos')
WITH CHECK (bucket_id = 'firmas-contratos');

-- ==============================================================================
-- FIN DE LA MIGRACIÓN
-- ==============================================================================
