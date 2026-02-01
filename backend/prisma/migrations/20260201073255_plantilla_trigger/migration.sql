-- AlterTable
ALTER TABLE "Capacitaciones" ADD COLUMN     "Id_Plantilla" INTEGER;

-- CreateTable
CREATE TABLE "Plantillas" (
    "Id_Plantilla" SERIAL NOT NULL,
    "Nombre_Plantilla" VARCHAR(200) NOT NULL,
    "Imagen_URL" TEXT,
    "Configuracion" JSONB DEFAULT '{}',
    "Activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plantillas_pkey" PRIMARY KEY ("Id_Plantilla")
);

-- AddForeignKey
ALTER TABLE "Capacitaciones" ADD CONSTRAINT "Capacitaciones_Id_Plantilla_fkey" FOREIGN KEY ("Id_Plantilla") REFERENCES "Plantillas"("Id_Plantilla") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================================
-- AUTOMATIZACIÓN DE CERTIFICADOS (TRIGGER)
-- ========================================================

CREATE OR REPLACE FUNCTION generar_certificados_automaticos()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si el estado cambió a 'Finalizada' (o equivalente)
    IF NEW."Estado" = 'Finalizada' AND OLD."Estado" != 'Finalizada' THEN
        
        -- Insertar certificados para todos los usuarios que asistieron (Asistencia = true)
        -- y que no tengan ya un certificado para esta capacitación.
        INSERT INTO "Certificados" ("Id_Usuario", "Id_Capacitacion", "Codigo_QR", "Fecha_Emision")
        SELECT 
            uc."Id_Usuario",
            uc."Id_Capacitacion",
            -- Generar un hash único para el QR (Ej: SHA256 de ID+FECHA)
            MD5(uc."Id_Usuario"::TEXT || uc."Id_Capacitacion"::TEXT || NOW()::TEXT),
            NOW()
        FROM "Usuarios_Capacitaciones" uc
        WHERE uc."Id_Capacitacion" = NEW."Id_Capacitacion"
          AND uc."Asistencia" = TRUE
          AND NOT EXISTS (
              SELECT 1 FROM "Certificados" c 
              WHERE c."Id_Usuario" = uc."Id_Usuario" 
              AND c."Id_Capacitacion" = uc."Id_Capacitacion"
          );
          
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generar_certificados ON "Capacitaciones";

CREATE TRIGGER trigger_generar_certificados
AFTER UPDATE ON "Capacitaciones"
FOR EACH ROW
EXECUTE FUNCTION generar_certificados_automaticos();
