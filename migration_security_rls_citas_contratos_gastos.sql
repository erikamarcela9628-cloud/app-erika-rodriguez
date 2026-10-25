-- ==============================================================================
-- LIMPIEZA DINÁMICA Y BLINDAJE TOTAL DE RLS EN CITAS, GASTOS, CONTRATOS Y STORAGE
-- ==============================================================================

-- 1. Eliminar automáticamente TODAS las políticas previas existentes en estas tablas
-- (Sin importar qué nombre aleatorio tenían previamente asignado en Postgres)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' 
          AND tablename IN ('citas', 'gastos', 'contratos', 'firmas_trazabilidad')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. Eliminar automáticamente todas las políticas en storage.objects
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 3. Asegurar activación de RLS en las tablas
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firmas_trazabilidad ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas estrictas: ÚNICAMENTE usuarios autenticados
CREATE POLICY "Acceso total para usuarios autenticados en citas"
ON public.citas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en gastos"
ON public.gastos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en contratos"
ON public.contratos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en firmas_trazabilidad"
ON public.firmas_trazabilidad
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Bucket de firmas privado y política de storage
UPDATE storage.buckets SET public = false WHERE id = 'firmas-contratos';
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso autenticado a firmas-contratos"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'firmas-contratos')
WITH CHECK (bucket_id = 'firmas-contratos');

-- ==============================================================================
-- FIN DE LA MIGRACIÓN
-- ==============================================================================
