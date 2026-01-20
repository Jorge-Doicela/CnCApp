-- Insertar Roles
INSERT INTO "Rol" ("nombre_rol", "descripcion", "modulos", "created_at", "updated_at") VALUES
  ('Administrador', 'Acceso total al sistema', '["Gestionar roles", "Gestionar usuarios", "Gestionar capacitaciones"]'::jsonb, NOW(), NOW()),
  ('Usuario Regular', 'Acceso básico', '["Ver Perfil", "Ver conferencias"]'::jsonb, NOW(), NOW());

-- Insertar Entidad
INSERT INTO "Entidades" ("Nombre_Entidad", "created_at") VALUES
  ('CNC - Consejo Nacional de Competencias', NOW());

-- Insertar Usuarios (password: 123456)
INSERT INTO "Usuario" ("Nombre_Usuario", "CI_Usuario", "Email_Usuario", "Telefono_Usuario", "password", "Rol_Usuario", "Entidad_Usuario", "tipo_participante", "created_at", "updated_at") VALUES
  ('Administrador CNC', '1234567890', 'admin@cnc.gob.ec', '0999999999', '$2b$10$NjPkFTxcZijtA9Z9fHkfbuLfJq.6NUXOMyX9Ri9cHe/4qcytSfH4O', 1, 1, 0, NOW(), NOW()),
  ('Juan Pérez', '0987654321', 'juan@example.com', '0988888888', '$2b$10$NjPkFTxcZijtA9Z9fHkfbuLfJq.6NUXOMyX9Ri9cHe/4qcytSfH4O', 2, 1, 1, NOW(), NOW());

-- Insertar Provincias de Ecuador
INSERT INTO "Provincias" ("Nombre_Provincia") VALUES
  ('Azuay'), ('Bolívar'), ('Cañar'), ('Carchi'),
  ('Chimborazo'), ('Cotopaxi'), ('El Oro'), ('Esmeraldas'),
  ('Galápagos'), ('Guayas'), ('Imbabura'), ('Loja'),
  ('Los Ríos'), ('Manabí'), ('Morona Santiago'), ('Napo'),
  ('Orellana'), ('Pastaza'), ('Pichincha'), ('Santa Elena'),
  ('Santo Domingo de los Tsáchilas'), ('Sucumbíos'), ('Tungurahua'), ('Zamora Chinchipe');
