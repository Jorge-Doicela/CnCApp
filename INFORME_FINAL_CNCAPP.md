# 4. Desarrollo Técnico del Sistema CnCApp

Durante el periodo de prácticas preprofesionales en el **Consejo Nacional de Competencias (CNC)**, se llevó a cabo el desarrollo integral del sistema **CnCApp**, enfocándose en la transición de un prototipo básico (20%) hacia una solución empresarial de alta disponibilidad (95%). A continuación, se detalla el desarrollo técnico siguiendo rigurosamente los 9 puntos del informe de actividades:

## 4.1 Reingeniería de Arquitectura de Software (Clean Architecture)
Se implementó un ciclo completo de reingeniería de software migrando la lógica de negocio a una **Arquitectura Limpia**. El sistema fue segmentado en capas de **Dominio** (entidades y reglas de negocio puras), **Aplicación** (casos de uso y orquestación) e **Infraestructura** (implementaciones técnicas de persistencia y servicios externos). Esto permitió desacoplar totalmente la lógica de negocio de las herramientas tecnológicas cambiantes.

Mediante el uso del **Patrón Repositorio**, se abstrajo el acceso a datos, facilitando la mantenibilidad y escalabilidad del sistema. Este enfoque profesional eliminó la deuda técnica acumulada, permitiendo que el sistema pueda crecer modularmente sin comprometer la estabilidad global de la plataforma CNC.

**Evidencia Gráfica**
*Figura 1: Estructura de Capas de Clean Architecture en el Backend*

## 4.2 Modernización del Frontend con Angular 19 y Standalone Components
Se rediseñó totalmente la interfaz de usuario utilizando **Angular 19** y adoptando la arquitectura de **Standalone Components**, eliminando el uso de `NgModules` para simplificar la estructura del proyecto y mejorar el rendimiento de carga. Se integró el sistema de **Signals** para la gestión reactiva de estados, logrando una sincronización de datos fluida y reduciendo drásticamente el consumo de memoria en dispositivos móviles.

La interfaz fue construida con componentes de un sistema de diseño propio basado en **Ionic 8**, garantizando una experiencia de usuario (UX) consistente, accesible y de alta gama, alineada con la imagen institucional del Consejo Nacional de Competencias.

**Evidencia Gráfica**
*Figura 2: Dashboard Administrativo desarrollado en Angular 19*

## 4.3 Modelado y Normalización de Base de Datos con Prisma ORM
Se realizó una normalización profunda de la base de datos relacional en **PostgreSQL**, utilizando el ORM **Prisma** para garantizar la integridad referencial y facilitar la gestión de migraciones. El esquema se diseñó para manejar relaciones complejas entre usuarios, roles, entidades territoriales (GADs), catálogos educativos y registros de capacitación.

Se implementaron índices estratégicos en tablas clave (Usuarios, Inscripciones, Certificados) para optimizar la velocidad de respuesta del sistema bajo carga de datos masiva, asegurando que la gestión de información de los funcionarios públicos sea rápida y confiable.

**Evidencia Gráfica**
*Figura 3: Diagrama Entidad-Relación (ERD) gestionado con Prisma*

## 4.4 Implementación de Seguridad Enterprise (JWT y RBAC)
Se desarrolló un ecosistema de seguridad robusto basado en **JSON Web Tokens (JWT)** para la autenticación y autorización. Las contraseñas son protegidas mediante hashing asimétrico con el algoritmo **Bcrypt**, siguiendo estándares internacionales de ciberseguridad.

Se implementó un sistema de **Roles (RBAC)** que segmenta el acceso según permisos específicos para Administradores, Coordinadores, Participantes y Autoridades GAD. Esta validación se realiza tanto en el backend mediante Middlewares, como en el frontend mediante Guards, asegurando la inaccesibilidad de datos confidenciales por personal no autorizado.

**Evidencia Gráfica**
*Figura 4: Flujo de Autenticación Segura y Gestión de Roles*

## 4.5 Desarrollo del Motor de Generación de Certificados Digitales
Se programó un servicio sofisticado para la creación automática de certificados oficiales en formato **PDF**. El motor integra dinámicamente los datos de las capacitaciones, las horas cursadas y la firma institucional. La lógica incluye el manejo de plantillas base (Plantillas PDF) que permiten al CNC cambiar el diseño de sus certificados sin modificar el código fuente.

Este proceso automatizado elimina la carga manual del personal administrativo y garantiza que cada funcionario reciba su acreditación de manera instantánea tras cumplir con los requisitos académicos del curso.

**Evidencia Gráfica**
*Figura 5: Previsualización de Certificado Digital Generado*

## 4.6 Integración de Validación Criptográfica mediante Códigos QR
Para garantizar la autenticidad e inalterabilidad de los certificados, se desarrolló un sistema de validación basado en un **Hash criptográfico único** para cada documento. Este hash es codificado en un **Código QR** que se imprime en el certificado.

Cualquier institución o tercero puede escanear este código QR para ser redirigido a la plataforma oficial de verificación del CNC, donde el sistema confirma en tiempo real la validez del documento, la identidad del portador y la capacitación realizada, eliminando el riesgo de falsificación de títulos y certificados.

**Evidencia Gráfica**
*Figura 6: Módulo de Verificación de Autenticidad vía QR*

## 4.7 Soporte Multiplataforma y Despliegue Móvil con Capacitor
Se sincronizó el ecosistema web con dispositivos móviles mediante **Capacitor 7** y la compilación nativa para **Android**. Esto permitió que CnCApp funcione como una aplicación nativa, aprovechando los recursos de hardware de los dispositivos, como la cámara para la lectura de códigos QR.

Se optimizó el diseño responsivo para garantizar que todos los módulos administrativos y de consulta sean totalmente funcionales en smartphones, facilitando la operatividad de los funcionarios del CNC en campo y mejorando la accesibilidad para los ciudadanos.

**Evidencia Gráfica**
*Figura 7: Aplicación CnCApp funcionando en Dispositivo Móvil*

## 4.8 Producción de Documentación Técnica y Manuales de Usuario
Se elaboró un repositorio de documentación profesional de aproximadamente **200KB en contenido técnico**, siguiendo estándares de la industria del software. Esto incluye el **Manual Técnico de Arquitectura**, el **Manual de Instalación** (Setup local y servidor) y los **Manuales de Usuario Final** orientados a roles administrativos y participantes.

Esta documentación técnica asegura la sostenibilidad del proyecto a largo plazo, facilitando la transferencia tecnológica al personal de planta del CNC y permitiendo futuras expansiones del sistema sin pérdida de conocimiento.

**Evidencia Gráfica**
*Figura 8: Índice de la Documentación Técnica del Proyecto*

## 4.9 Orquestación DevOps y Contenerización mediante Docker
Se diseñó la infraestructura del sistema utilizando **Docker** y **Docker Compose** para aislar cada servicio (Backend, Frontend, PostgreSQL). Esto garantiza la portabilidad total del sistema y la facilidad de despliegue mediante un solo comando, independientemente de la configuración del servidor anfitrión.

Se configuró un servidor **Nginx** como proxy reverso para gestionar el tráfico de entrada, optimizando la seguridad perimetral y el rendimiento de las peticiones HTTP, logrando un entorno de producción estable y seguro para el Consejo Nacional de Competencias.

**Evidencia Gráfica**
*Figura 9: Orquestación de Contenedores Docker para Producción*

# 5. Conclusiones

La culminación de las prácticas preprofesionales en el **Consejo Nacional de Competencias** representa un hito fundamental en la formación técnica y humana. El desarrollo integral de **CnCApp**, desde su estado inicial fragmentado (20%) hasta una solución empresarial funcional (95%), ha permitido consolidar una plataforma de software de alta calidad tecnológica.

Se ha dotado a la institución de una herramienta capaz de modernizar procesos administrativos críticos, asegurar la integridad documental mediante criptografía QR y facilitar la movilidad a través de una aplicación nativa. La arquitectura modular basada en Clean Architecture garantiza que el sistema sea una inversión a largo plazo para el CNC, con capacidad de evolucionar y adaptarse a futuros desafíos institucionales. En conclusión, el proyecto no solo cumple con los requerimientos técnicos iniciales, sino que supera las expectativas en términos de rendimiento, seguridad y experiencia de usuario.

# 6. Recomendaciones

Basado en la experiencia adquirida durante el desarrollo de **CnCApp**, se presentan las siguientes recomendaciones estratégicas para asegurar la evolución del sistema:

- **Establecer Protocolos de Auditoría de Código y Seguridad**: Se recomienda realizar revisiones semestrales del motor de firmas digitales y de los permisos RBAC para prevenir vulnerabilidades de seguridad y asegurar la invulnerabilidad de los certificados.

- **Migración a Microservicios para Procesos de Alta Carga**: Evaluar en el futuro el desacoplamiento del motor de generación de PDFs hacia un microservicio independiente, permitiendo optimizar el uso de hardware ante picos de demanda durante eventos de capacitación masiva.

- **Automatización de Despliegues con CI/CD**: Implementar una tubería de integración y despliegue continuo (CI/CD) para automatizar el ciclo de pruebas y actualizaciones, minimizando el posible tiempo de inactividad durante el mantenimiento.

- **Actualización de Infraestructura Hardware**: Priorizar el uso de servidores con discos SSD y memoria RAM de alta velocidad para el host de Docker, maximizando el rendimiento del motor de base de datos PostgreSQL y la velocidad de respuesta de la API.

---
**Jorge Ismael Doicela Molina**
*Ingeniería en Software - Pasante CNC Ecuador*
