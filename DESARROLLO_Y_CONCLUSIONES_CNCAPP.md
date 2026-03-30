# 4. Desarrollo del Proyecto Técnico - CnCApp

Durante el periodo de prácticas preprofesionales en el **Consejo Nacional de Competencias (CNC)** del Ecuador, se participó activamente en el área de Tecnologías de la Información (TI), cumpliendo un total de **144 horas** de trabajo técnico especializado. Se ejecutó la reingeniería integral del sistema **CnCApp**, un proyecto crítico que permitió aplicar competencias avanzadas en desarrollo de software, arquitectura de sistemas y seguridad de la información, contribuyendo directamente a la modernización de los procesos de gestión de capacitaciones y certificaciones institucionales.

El trabajo se desarrolló en un entorno de alta complejidad técnica que requirió la migración de un sistema embrionario (en un estado inicial del 20%) hacia una solución profesional de grado empresarial. Se aplicaron simultáneamente competencias en administración de bases de datos, DevOps, ciberseguridad y desarrollo Full-stack. A continuación, se detallan las actividades desarrolladas de manera exhaustiva:

## 4.1 Reingeniería de Bases de Datos y Estructura de Persistencia
La gestión y normalización de la base de datos constituyó una tarea central que demandó una reestructuración profunda del esquema relacional en **PostgreSQL**. El objetivo principal era garantizar la integridad de la información institucional, eliminando redundancias y asegurando la escalabilidad del sistema para miles de capacitaciones y funcionarios de los Gobiernos Autónomos Descentralizados (GAD).

El proceso inició con una auditoría técnica del esquema previo, identificando inconsistencias graves en las relaciones de datos y falta de integridad referencial. Utilizando el ORM **Prisma**, se diseñó un nuevo esquema normalizado que incluye la gestión compleja de roles, entidades territoriales (Provincias, Cantones, Parroquias) y catálogos oficiales del sector público. Esta reingeniería permitió optimizar las consultas y asegurar que cada registro de capacitación cuente con una trazabilidad completa desde la inscripción hasta la emisión del certificado.

Como resultado tangible, se consolidó una base de datos íntegra con más de 30 tablas interconectadas, reduciendo la latencia de respuesta del sistema y garantizando que la información de los funcionarios públicos sea gestionada bajo estándares de calidad técnica.

## 4.2 Arquitectura DevOps y Contenerización de Servicios
Para asegurar la continuidad operativa y la facilidad de despliegue, se implementó una estrategia de infraestructura basada en la contenerización. Esta labor enfocó la transformación de un entorno de ejecución manual e inestable hacia una arquitectura moderna orquestada por **Docker**.

Se desarrollaron múltiples `Dockerfiles` optimizados para cada capa del sistema: un entorno para el backend basado en **Node.js**, una compilación de producción para el frontend con **Angular 19** y una instancia persistente de **PostgreSQL**. La integración de **Docker Compose** permitió la orquestación total de los servicios, facilitando la creación de entornos idénticos de desarrollo y producción. Complementariamente, se configuró un servidor **Nginx** como proxy reverso para gestionar las peticiones HTTP de manera eficiente y segura, estableciendo las bases para un despliegue profesional.

## 4.3 Seguridad de la Información y Validación Criptográfica
La protección de los datos institucionales y la autenticidad de los certificados emitidos fueron pilares fundamentales del proyecto. Se implementó un robusto sistema de autenticación basado en **JSON Web Tokens (JWT)** junto con el cifrado de contraseñas utilizando el algoritmo **Bcrypt**, garantizando que el acceso al sistema esté estrictamente regulado por roles (RBAC: Role-Based Access Control).

Un aspecto técnico innovador fue el desarrollo de un motor de validación criptográfica para los certificados digitales. Cada certificado generado por **CnCApp** incluye un hash único y un **Código QR** dinámico. Este sistema permite que cualquier tercero pueda verificar la autenticidad de los documentos electrónicos en tiempo real, conectándose directamente con la base de datos institucional. Esta implementación elimina el riesgo de falsificación y mejora la transparencia en la acreditación de competencias para los funcionarios públicos.

## 4.4 Gestión de Procesos Institucionales y Capacitación
Se colaboró estrechamente con el departamento académico para traducir los requerimientos institucionales en lógica de software. Se desarrolló el módulo de gestión de capacitaciones con soporte para modalidades presencial, virtual e híbrida, integrando el control de cupos, asistencia y geolocalización de eventos.

Esta labor implicó un análisis exhaustivo del flujo de inscripción y evaluación del CNC. Se automatizó el ciclo de vida de cada evento educativo, desde la planificación inicial hasta la tabulación de resultados y emisión masiva de acreditaciones. La digitalización de estos procesos no solo redujo la carga administrativa manual en un 80%, sino que también proporcionó métricas estadísticas precisas sobre el impacto de la capacitación en los diferentes niveles de gobierno.

## 4.5 Desarrollo de Software y Ecosistema Full-stack
Como eje central de las prácticas, se abordó el desarrollo técnico integral siguiendo una **Arquitectura Limpia (Clean Architecture)**. Se migró la lógica de negocio a un enfoque desacoplado en el backend, mientras que en el frontend se implementaron **Standalone Components** y el sistema de **Signals** de Angular 19 para lograr una reactividad de alto rendimiento.

El resultado fue la culminación funcional de una plataforma multiplataforma (Web y Móvil). Mediante la integración de **Capacitor 7** e **Ionic 8**, se habilitó el despliegue nativo para Android, permitiendo a los usuarios acceder a sus certificados y validar códigos QR directamente desde sus dispositivos móviles. Este trabajo demuestra la capacidad para gestionar un proyecto de ingeniería de software de principio a fin, entregando una herramienta tecnológicamente avanzada que cumple con los estándares internacionales de desarrollo.

# 5. Conclusiones

La culminación de este proyecto técnico representa la consolidación exitosa de los conocimientos de ingeniería en un entorno institucional de alta exigencia. La experiencia permitió transformar un sistema básico y fragmentado en una solución de nivel profesional, evidenciando un progreso del proyecto del **20% al 95%** durante el periodo de prácticas.

El trabajo se centró en tres pilares fundamentales: **robustez arquitectónica**, **seguridad criptográfica** y **movilidad**. A nivel de sistemas, la migración a Clean Architecture y Prisma ha dotado al CNC de una plataforma escalable y fácil de mantener. El sistema de certificados con validación QR no solo moderniza los procesos, sino que protege la credibilidad institucional. Finalmente, la integración con Docker y Capacitor asegura que el CNC cuente con una herramienta versátil, capaz de operar en servidores modernos y dispositivos móviles con la misma eficiencia. En síntesis, se concluye este periodo habiendo entregado una solución tecnológica de última generación, lista para su implementación en producción.

# 6. Recomendaciones

Con base en la experiencia técnica adquirida, se presentan las siguientes recomendaciones estratégicas para la mejora continua del ecosistema CnCApp:

1. **Protocolos de Auditoría de Ciberseguridad**: Establecer auditorías semestrales de la infraestructura Docker y de las firmas digitales de los certificados para prevenir vulnerabilidades emergentes.
2. **Evolución hacia Microservicios**: Considerar el desacoplamiento de los módulos de alta carga (como la generación masiva de PDFs) hacia microservicios independientes para optimizar el rendimiento del servidor ante picos de demanda.
3. **Automatización de Infraestructura (CI/CD)**: Implementar tuberías de integración y despliegue continuo (CI/CD) para automatizar el ciclo de pruebas y despliegue cada vez que se realicen mejoras en el código.
4. **Capacitación y Soporte Continuo**: Promover reuniones técnicas periódicas con los administradores del sistema para asegurar la transferencia efectiva de conocimiento y la evolución constante de la plataforma.

---

# 7. Informe de Actividades (Resumen de Aprendizaje)

| Actividades realizadas | Aprendizajes Logrados |
| :--- | :--- |
| **Reingeniería de Bases de Datos** | Se fortalecieron las competencias en diseño relacional avanzado y normalización de datos utilizando **Prisma ORM** y **PostgreSQL**, optimizando esquemas complejos para la gestión institucional. |
| **Desarrollo de Arquitectura Clean** | Se desarrollaron habilidades para implementar patrones de diseño de software de grado empresarial, separando la lógica de negocio de la infraestructura para facilitar la mantenibilidad. |
| **Seguridad y Validación QR** | Se adquirió conocimiento práctico en la implementación de autenticación **JWT** y sistemas de validación criptográfica mediante **Códigos QR**, garantizando la autenticidad documental. |
| **Arquitectura DevOps (Docker)** | Se obtuvo experiencia en la contenedorización de servicios y orquestación masiva, permitiendo un despliegue profesional, seguro y escalable de aplicaciones Full-stack. |
| **Integración Móvil (Capacitor)** | Se aplicó el ciclo de vida de desarrollo multiplataforma para convertir una aplicación web en una solución nativa para Android, integrando el uso de hardware de cámara para lectura de QR. |
| **Desarrollo Frontend Moderno** | Se dominaron las nuevas características de **Angular 19** (Signals y Standalone Components) para crear interfaces de usuario reactivas, fluidas y de alto rendimiento (UX). |

# 8. Propuestas de Mejora Institucional

| No. | Propuestas de mejora |
| :---: | :--- |
| 1 | Diseñar y ejecutar un cronograma trimestral de actualización de contenedores Docker y parches de seguridad del sistema operativo para garantizar la invulnerabilidad de la infraestructura. |
| 2 | Realizar auditorías semestrales del motor de generación de firmas digitales para verificar la integridad de los certificados almacenados y la correcta sincronización horaria de los servidores. |
| 3 | Explorar el uso de scripts automatizados para el monitoreo de recursos del servidor (CPU/RAM), notificando proactivamente al equipo de TICs sobre posibles saturaciones antes de que afecten el servicio. |
| 4 | Migrar la gestión de reportes analíticos a una plataforma de Business Intelligence integrada, permitiendo a las autoridades del CNC visualizar el impacto de la capacitación en tiempo real. |

---
**Jorge Ismael Doicela Molina**
*Pasante de Ingeniería en Software - CNC Ecuador*
