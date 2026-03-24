-- 1. AlterTable Roles
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
-- Handle existing unique constraint for codigo if it was missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'roles_codigo_key') THEN
        CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");
    END IF;
END $$;

-- 2. AlterTable Entidades
ALTER TABLE "entidades" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'entidades_codigo_key') THEN
        CREATE UNIQUE INDEX "entidades_codigo_key" ON "entidades"("codigo");
    END IF;
END $$;

-- 3. AlterTable Usuarios
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "estado" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "biometric_token" VARCHAR(550);

-- 4. AlterTable Provincias
ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true;
ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "provincias" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'provincias_codigo_key') THEN
        CREATE UNIQUE INDEX "provincias_codigo_key" ON "provincias"("codigo");
    END IF;
END $$;

-- 5. AlterTable Cantones
ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true;
ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "cantones" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cantones_codigo_key') THEN
        CREATE UNIQUE INDEX "cantones_codigo_key" ON "cantones"("codigo");
    END IF;
END $$;

-- 6. AlterTable Parroquias
ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true;
ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "parroquias" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'parroquias_codigo_key') THEN
        CREATE UNIQUE INDEX "parroquias_codigo_key" ON "parroquias"("codigo");
    END IF;
END $$;

-- 7. AlterTable Competencias
ALTER TABLE "competencias" ADD COLUMN IF NOT EXISTS "estado" BOOLEAN DEFAULT true;
ALTER TABLE "competencias" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- 8. AlterTable Tipos Participante
ALTER TABLE "tipos_participante" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(50);
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tipos_participante_codigo_key') THEN
        CREATE UNIQUE INDEX "tipos_participante_codigo_key" ON "tipos_participante"("codigo");
    END IF;
END $$;
