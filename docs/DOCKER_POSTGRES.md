# 🐳 Usar Docker para PostgreSQL (Recomendado)

## Por qué Docker es mejor:
- ✅ No necesitas recordar contraseñas
- ✅ Base de datos aislada para el proyecto
- ✅ Fácil de eliminar y recrear
- ✅ Mismo entorno en desarrollo y producción

## Pasos:

### 1. Abrir Docker Desktop
- Busca Docker Desktop en el menú de inicio
- Ábrelo y espera a que inicie (ícono de ballena en la barra de tareas)

### 2. Iniciar PostgreSQL con Docker
```bash
docker run --name cnc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cnc_db -p 5432:5432 -d postgres:15
```

### 3. Verificar que está corriendo
```bash
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE         STATUS
abc123...      postgres:15   Up 2 seconds
```

### 4. Ejecutar migraciones
```bash
cd cnc-backend
npm run prisma:migrate
```

### 5. Insertar datos de prueba
```bash
npm run prisma:seed
```

### 6. Iniciar backend
```bash
npm run dev
```

---

## Comandos útiles de Docker:

```bash
# Ver contenedores corriendo
docker ps

# Detener PostgreSQL
docker stop cnc-postgres

# Iniciar PostgreSQL (después de detenerlo)
docker start cnc-postgres

# Ver logs
docker logs cnc-postgres

# Eliminar contenedor (si quieres empezar de cero)
docker rm -f cnc-postgres
```

---

## ¿Listo?

1. Abre Docker Desktop
2. Espera a que inicie
3. Dime cuando esté listo y ejecuto los comandos
