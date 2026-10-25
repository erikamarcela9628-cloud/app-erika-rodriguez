-- ==============================================================================
-- LIMPIEZA DINÁMICA Y BLINDAJE DE TABLAS PÚBLICAS (CITAS, GASTOS, CONTRATOS, FIRMAS)
-- ==============================================================================

-- 1. Eliminar automáticamente TODAS las políticas previas en las tablas públicas
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

-- 2. Asegurar activación de RLS en las tablas
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firmas_trazabilidad ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas estrictas: ÚNICAMENTE usuarios autenticados
CREATE POLICY "Acceso total para usuarios autenticados en citas"
ON public.citas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en gastos"
ON public.gastos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en contratos"
ON public.contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acceso total para usuarios autenticados en firmas_trazabilidad"
ON public.firmas_trazabilidad FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- FIN DE LA MIGRACIÓN
-- ==============================================================================
