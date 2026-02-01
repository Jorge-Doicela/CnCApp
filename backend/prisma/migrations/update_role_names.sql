-- Migration script to update role names in existing database
-- Execute this BEFORE running the seed if you have existing data

-- Update Coordinador to Conferencista
UPDATE "Rol" 
SET "nombre_rol" = 'Conferencista',
    "Descripcion" = 'Creador de conferencias con capacidad de gestionar capacitaciones y generar certificados',
    "Modulos" = ARRAY['capacitaciones', 'certificados', 'inscripciones']::text[]
WHERE "nombre_rol" = 'Coordinador';

-- Update Participante to Usuario
UPDATE "Rol" 
SET "nombre_rol" = 'Usuario',
    "Descripcion" = 'Usuario del sistema que puede crear cuenta, editar datos, visualizar capacitaciones y descargar certificados',
    "Modulos" = ARRAY['perfil', 'capacitaciones-lectura', 'certificados-propios']::text[]
WHERE "nombre_rol" = 'Participante';

-- Verify the changes
SELECT "Id_Rol", "nombre_rol", "Descripcion", "Modulos" 
FROM "Rol" 
ORDER BY "Id_Rol";
