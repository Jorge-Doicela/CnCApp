# Guía de Desarrollo Móvil - CnCApp

Esta guía resume cómo levantar el entorno de desarrollo para probar la App en un dispositivo físico con sincronización instantánea (Live Reload).

## Pasos para iniciar cada mañana

Sigue este orden exacto para evitar conflictos de puertos o archivos bloqueados:

### 1. Levantar el Servidor (PC = Servidor Real)
Abre una terminal en la raíz (`CnCApp`) y ejecuta:
```powershell
docker-compose up -d postgres backend
```
*Esto inicia la Base de Datos local y el Backend con logs detallados.*

### 2. Levantar el Frontend (PC = Estación de Desarrollo)
Abre una SEGUNDA terminal, entra en la carpeta `frontend` e inicia el servidor de Angular:
```powershell
cd frontend
npm run start -- --host 0.0.0.0
```
*Espera a que diga "Compiled successfully".*
* **Para ver en PC**: Abre [http://localhost:4200](http://localhost:4200)
* **Para ver en Móvil**: Abre la App o usa [http://192.168.7.141:4200](http://192.168.7.141:4200)

### 3. Sincronizar con el Teléfono (USB)
Abre una TERCERA terminal en la raíz (`CnCApp`) y lanza la App al móvil:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
npx cap run android --live-reload --port 4200 --host 192.168.7.141
```

---

## Solución de Problemas Comunes

### Error: "Unable to delete directory" (Archivos bloqueados)
Si al compilar te da un error de que no puede borrar carpetas, ejecuta esto para liberar los procesos:
```powershell
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\android\app\build
```

### Error: "No se pudo conectar con el backend"
Si la App carga pero no te deja iniciar sesión, verifica si el backend de Docker falló:
```powershell
docker ps
# Si dice "Restarting", reconstruye el backend con:
docker-compose up -d --build backend
# Luego mira el error con:
docker logs cnc-backend
```

### Error: "Pantalla en blanco en el móvil"
1. Asegúrate de que tu PC y el Teléfono estén en la **misma red WiFi**.
2. Verifica que tu IP no haya cambiado (usa `ipconfig` en la terminal). Si cambió, actualiza el número en el comando del **Paso 3**.
3. Si el navegador del móvil carga la IP pero la App no, borra los datos de la App en **Ajustes > Aplicaciones > CNC App** en tu teléfono.

### Credenciales de Prueba (Admin)
- **Cédula**: `1710000009`
- **Password**: `AdminPassword123!`

---
*Configurado por Antigravity - 2026-04-22*
