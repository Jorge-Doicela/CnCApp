# Autores
Alexander Rafael Martinez Morillo 2025 AlkutF
# Explicacion del proyecto
El proyecto en si intenta simular los procesos de 
http://inscripciones.competencias.gob.ec
Ten en cuenta algo , al momento de iniciar a generar el mismo no se me habia advertido de muchas cosas que serian
requeridas en caso del diseño de informes 
Por esta razon la complejidad del area de registro se fue de las manos , al mismo tiempo debo brindar capacidades
que el sistema actual no tiene , por ello tantas tablas y CRUD 
El flujo del usuario en el sistema es sencillo 
El usuario ingresa y ve las conferencias
El usuario se registra con todos sus datos 
El usuario ingresa al sistema automaticamente 
El usuario puede inscribirse a conferencias 
El usuario puede ver certificados
El usuario puede descargar sus certificados 
El usuario puede cancelar su incripcion
El flujo del administrador es mas complicado 
El usuario ingresa como cualquier otro , pero por su idRol tiene otros menus 
A traves de estos menus , puede generar varios cruds dentro del sistema 

La programacion , como es un proyecto basado en angular no es muy compleja , rutas principales en app-routing , el valor de path se lo coloca como un JSON en el menu de la bd , y a ese rol se le da ese usuario

Eso es lo unico diferente , el resto la logica es simple , admin/Manejo de procesos administrativos del sistema CRUD/Certificaciones

User/Manejo de procesos del usuario /Ver Certificados 

La base de datos se encuentra en supabase la URL es http://192.168.1.53:8000/
CNC 
CNC_PASSWORD
Si ocupas modificar algo del servidor entra mediante putty al enlace es
192.168.1.53
user:root
pass:CnC*2025*
Encima de las rutas comentare que es lo que se planea realizar en cada una , y aumentare descripcion en los conceptos de supabase , para que te sea mas facil entender , y en el peor caso pideme ayuda , este proyecto no lo acabare mas por falta de tiempo que por falta de ganas
