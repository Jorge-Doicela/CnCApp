-- DropForeignKey
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Autoridades_Id_Usuario_fkey') THEN
        ALTER TABLE "Autoridades" DROP CONSTRAINT "Autoridades_Id_Usuario_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Cantones_Id_Provincia_fkey') THEN
        ALTER TABLE "Cantones" DROP CONSTRAINT "Cantones_Id_Provincia_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Certificados_Id_Capacitacion_fkey') THEN
        ALTER TABLE "Certificados" DROP CONSTRAINT "Certificados_Id_Capacitacion_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Certificados_Id_Usuario_fkey') THEN
        ALTER TABLE "Certificados" DROP CONSTRAINT "Certificados_Id_Usuario_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='FuncionarioGAD_Id_Usuario_fkey') THEN
        ALTER TABLE "FuncionarioGAD" DROP CONSTRAINT "FuncionarioGAD_Id_Usuario_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Instituciones_usuario_Id_Institucion_fkey') THEN
        ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT "Instituciones_usuario_Id_Institucion_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Instituciones_usuario_Id_Usuario_fkey') THEN
        ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT "Instituciones_usuario_Id_Usuario_fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='parroquia_Id_Canton_fkey') THEN
        ALTER TABLE "parroquia" DROP CONSTRAINT "parroquia_Id_Canton_fkey";
    END IF;
END $$;

-- AddForeignKey
ALTER TABLE "Cantones" ADD CONSTRAINT "Cantones_Id_Provincia_fkey" FOREIGN KEY ("Id_Provincia") REFERENCES "Provincias"("Id_Provincia") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parroquia" ADD CONSTRAINT "parroquia_Id_Canton_fkey" FOREIGN KEY ("Id_Canton") REFERENCES "Cantones"("Id_Canton") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_Id_Capacitacion_fkey" FOREIGN KEY ("Id_Capacitacion") REFERENCES "Capacitaciones"("Id_Capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Autoridades" ADD CONSTRAINT "Autoridades_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FuncionarioGAD" ADD CONSTRAINT "FuncionarioGAD_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Instituciones_usuario" ADD CONSTRAINT "Instituciones_usuario_Id_Institucion_fkey" FOREIGN KEY ("Id_Institucion") REFERENCES "instituciones_sistema"("Id_Institucion") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Instituciones_usuario" ADD CONSTRAINT "Instituciones_usuario_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE CASCADE ON UPDATE CASCADE;
