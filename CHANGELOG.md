# 📑 CHANGELOG - BWISE Dental API

Todos los cambios relevantes del proyecto serán documentados aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).  
Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

---

## [0.14.0] - 2025-12-30

### Added
- Se incorporó el nuevo módulo **Clinic Areas** (Áreas Clínicas / Sillones) como recurso administrativo base:
  - CRUD completo para la gestión de áreas de atención clínica.
  - Diseño multi-tenant alineado al resto de catálogos clínicos.
  - Implementación basada íntegramente en el patrón del módulo **Services**.

- Nuevo modelo `clinic_areas`:
  - Campos:
    - `name` (nombre del área / sillón).
    - `status` con enum:
      - `active`
      - `maintenance`
      - `inactive`
  - Soporte para **soft delete** mediante `paranoid`.
  - Preparado para uso como recurso asignable en citas.

- Nuevas migraciones de base de datos:
  - Creación de la tabla `clinic_areas`.
  - Relación `clinic_areas.tenant_id → tenants.id` con reglas `CASCADE`.
  - Índices alineados a los utilizados en servicios y catálogos existentes.

- Integración completa del módulo en la API:
  - Registro de asociaciones en `models/mysql/associations.js`.
  - Exposición de rutas REST bajo `/clinic-areas`.
  - Validadores, repositorio, service y controller siguiendo arquitectura estricta.

### Notes
- **Clinic Areas** representa un recurso clínico reutilizable (sillones, áreas de rayos X, estaciones de tratamiento).
- Este módulo será utilizado próximamente por:
  - El sistema de **Citas**.
  - La vista de **Calendario por Área**.
  - La asignación dinámica de pacientes en tiempo real.
- No se incluye aún lógica de agenda ni bloqueo por disponibilidad; este release prepara la base estructural.

---

## [0.13.0] - 2025-12-30

### Added
- Se incorporó soporte **DataTable server-side** al módulo de **Servicios Clínicos**:
  - Nuevo endpoint `POST /services/datatable`.
  - Soporte para:
    - Paginación (`start`, `length`).
    - Búsqueda por texto (`search.value`).
    - Ordenamiento dinámico por columnas.
  - Implementación alineada al contrato ya utilizado en `patients`.
  - Mantiene `GET /services` para cargas ligeras (selects, catálogos).

- Se agregó un **helper compartido para manejo de errores de unicidad en Sequelize**:
  - Nuevo util `sequelizeErrorHandler`.
  - Detección explícita de `SequelizeUniqueConstraintError`.
  - Respuestas semánticas con HTTP **409 Conflict**.
  - Mapeo de mensajes por **constraint**, evitando exponer:
    - Nombres técnicos de índices.
    - Valores internos concatenados.
  - Base reutilizable para todos los módulos de la API.

### Improved
- Se mejoró la **experiencia de error al intentar crear registros duplicados**:
  - Mensajes claros para el usuario final (ej. *“Ya existe un servicio con ese nombre”*).
  - Eliminación de respuestas genéricas tipo *“Validation error”* en conflictos reales.
  - Comportamiento consistente incluso con registros **soft-deleted**.

- Se alineó completamente el **contrato frontend ↔ backend** para búsquedas tipo datatable:
  - Uso estricto de `search.value` y `order[column, dir]`.
  - Eliminación de ambigüedades en parámetros personalizados.
  - Filtrado correcto por texto a nivel de base de datos.

### Fixed
- Corrección del filtrado en listados de servicios cuando el frontend enviaba búsquedas válidas:
  - El backend ahora procesa correctamente los parámetros esperados.
  - Se evita retornar resultados no filtrados por errores de contrato.

### Notes
- Esta versión consolida el patrón **DataTable reutilizable** como estándar de la API.
- El helper de errores de unicidad será reutilizado en:
  - Pacientes
  - Usuarios
  - Roles
  - Catálogos clínicos futuros
- La API queda preparada para:
  - Integración limpia con Electron y Web.
  - Implementación del módulo de **Citas** sin inconsistencias de contrato ni UX.

---

## [0.12.0] - 2025-12-29

### Added
- Se incorporó el **catálogo de Servicios Clínicos** (`services`) como base para la gestión de citas y flujos operativos:
  - Nuevo modelo `service` con soporte multi-tenant.
  - Campos para definir:
    - Duración clínica total del servicio (`duration_minutes`).
    - Capacidad sugerida del doctor mediante unidades (`suggested_units`, `unit_value`).
    - Precio base, configuración fiscal y control operativo.
  - Preparado para desacoplar el tiempo del sillón del tiempo efectivo del doctor.

- Se creó el **módulo completo de Servicios** siguiendo la arquitectura estándar de la API:
  - `service.controller.js`
  - `service.service.js`
  - `service.repository.js`
  - `service.validator.js`
  - `service.routes.js`
  - Endpoints CRUD protegidos por permisos (`read`, `write`, `edit`, `delete`).
  - Aislamiento estricto por tenant obtenido desde JWT.
  - Uso consistente de transacciones y auditoría (`createLog`, `logApiError`).

- Se agregó la **migración `create-services`**:
  - Creación de la tabla `services` con:
    - Relaciones explícitas con `tenants`.
    - Índices optimizados por `tenant_id`.
    - Restricción única para evitar duplicados de servicios por clínica.
    - Soporte de soft delete (`deleted_at`).

- Se detectaron y corrigieron **modelos sin migración existente**, preparando la base de datos para módulos clínicos avanzados:
  - Nuevas migraciones para:
    - `extraction_files`
    - `extraction_teeth`
    - `patient_extractions`
  - Migraciones generadas a partir de los modelos reales y asociaciones existentes.
  - Definición explícita de claves foráneas, índices y reglas de integridad referencial.

### Improved
- Se fortaleció la **consistencia entre modelos y migraciones**:
  - Alineación completa entre `src/models/mysql` y `src/migrations`.
  - Eliminación de discrepancias entre modelos definidos y estructura real de base de datos.
- Se dejó preparada la base de datos para la futura implementación del **módulo de Citas**:
  - Separación clara entre:
    - Duración del servicio.
    - Capacidad efectiva del doctor.
    - Métricas de desempeño clínico.

### Notes
- Este cambio sienta las bases para:
  - Agenda clínica basada en servicios.
  - Medición real de eficiencia por doctor.
  - Implementación futura del módulo de Citas (`appointments`) sin deuda técnica.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate
  ```

---

## [0.11.0] - 2025-12-28

### Added
- Se agregó el módulo **Órdenes de Extracción** (`patient_extraction`) para la gestión completa de derivaciones quirúrgicas de pacientes:
  - Nuevo modelo `patient_extraction` para almacenar la información general de la orden (destinatario, fecha, observaciones, procedimientos adicionales).
  - Nuevo modelo `extraction_teeth` para registrar dientes involucrados, incluyendo:
    - Extracciones completas por pieza.
    - Restauraciones/tratamientos por áreas específicas del diente.
  - Nuevo modelo `extraction_files` para la gestión de radiografías asociadas a cada orden.

- Se incorporaron endpoints CRUD para órdenes de extracción:
  - Creación de órdenes con carga multipart (datos + radiografías).
  - Consulta de órdenes por paciente.
  - Consulta de detalle de una orden específica.
  - Actualización de órdenes existentes.
  - Eliminación completa de órdenes (orden, dientes y archivos físicos).

- Se integró la carga de radiografías mediante el middleware centralizado de uploads:
  - Reutilización del sistema de carga existente (sin configuraciones duplicadas).
  - Soporte para múltiples radiografías por orden.
  - Almacenamiento de archivos organizado por:
    ```
    uploads/{tenant_id}/patients/{medical_record_number}/radiographs
    ```

### Changed
- Se normalizó el manejo de rutas de archivos guardadas en base de datos:
  - Ahora se almacena el path relativo desde `uploads/`, garantizando portabilidad entre entornos.
- Se mejoró la lógica de actualización de órdenes de extracción:
  - Reemplazo controlado de dientes asociados.
  - Manejo correcto de radiografías nuevas, existentes y eliminadas.
- Se alineó el módulo de órdenes de extracción con la arquitectura existente:
  - Uso de Controller / Service / Repository.
  - Uso de transacciones para garantizar consistencia de datos.
  - Respeto del contexto multi-tenant obtenido desde JWT.

### Fixed
- Se corrigió un problema donde las radiografías no se guardaban correctamente debido al envío incorrecto de archivos desde el frontend.
- Se solucionó un error que impedía guardar restauraciones (tratamientos por áreas) en `extraction_teeth`, registrándose únicamente extracciones.
- Se corrigió la resolución de rutas de archivos para evitar guardar paths absolutos del sistema.
- Se resolvieron errores de validación y middlewares en rutas multipart que provocaban fallos silenciosos.
- Se corrigió el uso incorrecto de validadores que causaba errores `next is not a function`.

### Improved
- Se fortaleció la consistencia entre módulos clínicos reutilizando patrones ya existentes (pacientes, alertas, galería).
- Se mejoró la trazabilidad clínica al permitir registrar de forma estructurada:
  - Qué piezas fueron extraídas.
  - Qué áreas fueron tratadas.
  - Qué evidencia radiográfica respalda la orden.
- Se dejó preparada la base para futuras extensiones:
  - Exportación de órdenes de extracción a PDF clínico.
  - Versionado o bloqueo de órdenes completadas.
  - Integración con flujos de firma o validación médica.

---

## [0.10.0] - 2025-12-23

### Added
- Se introdujo un sistema de caché de permisos en memoria para reducir consultas redundantes a la base de datos:
  - Nueva utilidad `permissions.cache` con alcance por tenant y conjunto de roles.
  - Invalidación automática del caché al actualizar roles y permisos.
  - Totalmente compatible con la lógica existente de resolución de permisos.

- Se agregó una nueva infraestructura de Refresh Tokens para soportar sesiones de larga duración:
  - Nuevo modelo MongoDB `RefreshToken` con almacenamiento seguro mediante hash.
  - Rotación y revocación de tokens mediante identificador de familia.
  - Limpieza automática de refresh tokens expirados mediante TTL.
  - Diseñado para coexistir con el sistema actual de JWT + ActiveToken sin forzar cambios en los clientes.

### Changed
- Se fortaleció el flujo de autenticación para mejorar la validación de sesiones:
  - Mejora en el manejo de ActiveToken como preparación para validación estricta de JTI.
  - Extensión de servicios y repositorios de autenticación para soportar la emisión de refresh tokens (uso no obligatorio).

- Se actualizaron los servicios de roles y permisos para invalidar el caché de permisos cuando estos son modificados, garantizando consistencia inmediata entre sesiones activas.

- Se actualizaron rutas, servicios y validadores de autenticación para soportar mejoras de seguridad aditivas, manteniendo intactos los contratos existentes de la API.

### Fixed
- Se mejoró la robustez de la carga de permisos evitando accesos innecesarios a la base de datos cuando los permisos ya están cacheados.
- Se redujeron posibles cuellos de botella de rendimiento en endpoints autenticados de alto tráfico al evitar consultas repetidas de roles y permisos.

### Improved
- Se fortaleció la postura general de seguridad del sistema de autenticación manteniendo compatibilidad total hacia atrás.
- Se mejoró la preparación del sistema para escalar hacia aplicaciones web y móviles que requieren sesiones de larga duración.
- Se sentaron las bases para una autenticación multi-aplicación (Desktop, Web, Mobile) utilizando un núcleo de autenticación compartido y reforzado.

---

## [0.9.0] - 2025-12-04

### Added
- Se implementó el módulo completo de Patient Conversations:
  - Nuevo modelo, migración, repositorio, servicio, controlador y rutas.
  - Soporte completo CRUD con validación de tenant.
  - Reglas de validación para creación y actualización de conversaciones.
  - Registro de auditoría para todas las acciones del módulo.
  - Las conversaciones ahora están vinculadas al usuario autenticado que las creó.

- Se agregó soporte para retornar información de Employee a través de la relación User tanto en Notes como en Conversations.  
  Esto permite que las APIs devuelvan detalles completos del autor como nombre, apellido, correo, puesto e imagen de perfil.

### Changed
- Se actualizaron los módulos Patient Notes y Patient Conversations para eliminar el campo incorrecto `employee_id`.  
  La identidad del autor ahora se deriva correctamente mediante la relación User → Employee.
  
- Se actualizaron todos los repositorios y servicios para incluir información de Employee al retornar Notes y Conversations.

- Se limpiaron y reorganizaron las asociaciones para asegurar consistencia, evitar alias duplicados y mantener un orden adecuado.

### Fixed
- Se resolvió el error relacionado con BillingData que no estaba asociado correctamente a Patient, corrigiendo includes y definiciones de asociaciones inconsistentes.
- Se corrigieron inconsistencias de alias (por ejemplo, reemplazando usos incorrectos de “author” por el alias correcto “user”).
- Se corrigieron problemas estructurales en el archivo de asociaciones, como asociaciones duplicadas, llaves faltantes y secciones desordenadas.
- Se corrigieron las respuestas de los endpoints de Notes y Conversations para devolver el formato de datos esperado por el frontend.

### Improved
- Se mejoró la robustez de los endpoints de Notes y Conversations al manejar relaciones entre User y Employee.
- Se reforzó la validación de tenant y el reporte de errores en varios módulos.
- Se mejoraron los mensajes de auditoría para mayor claridad y consistencia.

---

## [0.8.0] - 2025-12-04

### Added
- Nuevo módulo **patient_prescription** con funcionalidad CRUD completa.
- Se agregó el modelo, migración, controlador, servicio, repositorio y validador para prescripciones.
- Nuevos endpoints de API:
  - `GET /patient_prescription/patient/:id`
  - `POST /patient_prescription`
  - `PUT /patient_prescription/:id`
  - `DELETE /patient_prescription/:id`
- Se implementaron asociaciones de Sequelize que vinculan **PatientPrescription** con `Tenant` y `Patient`.
- Se habilitó que la aplicación Electron interactúe con datos reales de prescripciones mediante CRUD de la API en lugar de datos simulados.

### Updated
- Se actualizó `associations.js` para registrar correctamente las relaciones de `PatientPrescription`.
- Se aseguró que la estructura y el comportamiento se mantengan consistentes con el módulo existente `patient_hobby`, incluyendo multitenancy y restricciones únicas.

### Fixed
- Se corrigió un problema de asociaciones en Sequelize:
  - *"Patient is not associated to PatientPrescription!"*

---

## [0.7.2] - 2025-11-24

### Changed
- Ajustado el **payload del perfil del paciente** (`GET /patients/profile/:id`) para incluir datos adicionales requeridos por el cliente.
    - Campos normalizados que ahora viajan correctamente en el perfil.
    - Alineación del formato del perfil con el nuevo front (React/Electron).

### Added
- Nuevos datos añadidos a los **seeders clínicos**:
    - `seedPatientsRealData.js` añadido al proyecto.
    - `seedPatientRelationsClinic.js` actualizado con nuevos pacientes y relaciones.
    - `seedTenantModules.js` ajustado para reflejar módulos requeridos tras la actualización del front.
    - Actualización en `patient.repository.js` para permitir que el nuevo perfil incluya relaciones adicionales.

### Updated
- Archivo `src/routes/index.js` modificado para registrar los seeders y nuevas rutas correctamente.
- Limpieza y alineación general de seeders existentes para coincidir con la nueva estructura del paciente.


---

## [0.6.2] - 2025-11-21

### Added
- **Carga de fotografías de pacientes**
    - Nuevo middleware `uploadPatientPhoto` con ruta dinámica:
      ```
      uploads/{tenant_id}/patients/{MRN}/profile/{archivo}
      ```
    - Validación de tipos permitidos (`image/jpeg`, `image/png`, `image/jpg`).
    - El backend ahora guarda solo rutas relativas (`uploads/...`), compatibles con cliente.

- **Generación automática de acceso al portal del paciente**
    - Cálculo de edad a partir de `birth_date`.
    - Reglas:
        - **Adultos (>= 18 años):**
            - `username = phone_number`
            - `password = phone_number`
            - `can_login = true`
            - `first_login = true` (forzar cambio)
        - **Menores de edad:**
            - `can_login = false`
            - usuario y contraseña vacíos
            - `first_login = false`

- **Guardado completo del paciente en creación**
    - Alta del paciente con todos los datos base.
    - Inserción automática de:
        - **Alertas clínicas y administrativas**.
        - **Representantes legales** (N:M).
        - **Datos fiscales** (N:M con pivot).
        - **Tipos de paciente** a través de `PatientPatientType`.

- **Serialización automática de datos complejos**
    - Manejo de arrays enviados vía `FormData`, deserializados correctamente en el backend.

- **Asociaciones Sequelize revisadas y corregidas**
    - Se habilitó `Patient.belongsToMany(PatientType)` y viceversa.
    - Se ajustaron los modelos `BillingData`, `PatientBillingData`, `PatientRepresentative`, `PatientRepresentativeLink`.
    - Se aseguraron los alias `.as` correctos para poder usar `newPatient.setTypes(...)`.

### Changed
- **URL de foto (`photo_url`) normalizada**
    - Ahora solo almacena rutas relativas, eliminando rutas absolutas de Windows.

- **Validación de paciente actualizada**
    - `birth_date` debe recibirse como `YYYY-MM-DD`.
    - `patient_type_ids` ahora debe ser un arreglo válido de enteros.
    - Limpieza del payload antes de crear al paciente mediante `allowedFields`.

- **Cálculo del número de expediente**
    - Se deshabilitó temporalmente el uso automático de `getNextMedicalRecord()` para evitar duplicados hasta ajuste final.

- **Ordenamiento por defecto en datatable**
    - Ajustado para que el backend respete el orden solicitado por el frontend.

### Fixed
- Error donde `patientRepository.addBillingData` no existía al no implementarse previamente (ya corregido).
- Guardado de foto fallaba por `photo_url` siendo tratado como URL externa.
- FormData enviaba objetos sin serializar causando errores de validación.
- Problema donde `setTypes()` no funcionaba por falta de relaciones en modelo.

---

## [0.6.1] - 2025-11-21

### Added
- **Nuevo módulo administrativo-fiscal `Billing Data`** (`billing_data`):
    - Modelo `billing_data.model.js` con soporte multi-tenant (`tenant_id`) y `paranoid: true`.
    - Campos principales: `business_name`, `rfc`, `tax_regime`, `zip_code`, `email`, `is_active`.
    - **Migración `create-billing-data`**:
        - Crea la tabla `billing_data` con índices (`tenant_id`, `rfc`).
        - Relaciones (`tenant_id`) con `CASCADE`.
    - **Estructura completa del módulo**:
        - `billing_data.repository.js`: consultas de lectura, creación, actualización y soft delete.
        - `billing_data.service.js`: transacciones Sequelize, auditoría (`createLog`, `logApiError`), `notifyUser`, sanitización con `allowedFields`.
        - `billing_data.controller.js`: endpoints REST (`getAll`, `getOne`, `create`, `update`, `remove`).
        - `billing_data.validator.js`: validaciones con `express-validator`.
        - `billing_data.routes.js`: rutas protegidas con permisos (`read`, `write`, `edit`, `delete`).

- **Nuevo módulo pivote `Patient Billing Data`** (`patient_billing_data`):
    - Permite relacionar uno o varios datos fiscales con un paciente.
    - Modelo `patient_billing_data.model.js` con `is_primary` para marcar un RFC principal.
    - **Migración `create-patient-billing-data`**:
        - Tabla pivote con referencias a `patients` y `billing_data`.
        - Restricción única `uq_patient_billing_unique`.
        - Índices (`tenant_id`, `patient_id`, `billing_data_id`).
    - **Estructura completa del módulo**:
        - `patient_billing_data.repository.js`: manejo de pivote, eliminación lógica, set/unset primary.
        - `patient_billing_data.service.js`: transacciones, logs, notify, validación de duplicados.
        - `patient_billing_data.controller.js`: añadir, listar, eliminar, marcar como principal.
        - `patient_billing_data.validator.js`: validaciones de relación.
        - `patient_billing_data.routes.js`: rutas REST protegidas.

- **Nuevo módulo clínico-administrativo `Patient Representatives`** (`patient_representatives`):
    - Permite registrar tutores o representantes legales (padre, madre, tutor).
    - Modelo `patient_representative.model.js` con datos personales, contacto y opcional acceso al portal.
    - **Migración `create-patient-representatives`**:
        - Tabla `patient_representatives` con índices (`tenant_id`, `email`, `username`).
        - Clave única en `username` (portal del representante).
    - **Estructura completa del módulo**:
        - `patient_representative.repository.js`: CRUD completo.
        - `patient_representative.service.js`: transacciones, logs, notify, sanitización y soft delete.
        - `patient_representative.controller.js`: CRUD REST estandarizado.
        - `patient_representative.validator.js`: validación de datos personales y login opcional.
        - `patient_representative.routes.js`: rutas protegidas bajo `/patient-representatives`.

- **Nuevo módulo pivote `Patient Representative Links`** (`patient_representative_links`):
    - Relaciona un paciente con uno o varios representantes legales.
    - Modelo `patient_representative_link.model.js` con `is_primary` para indicar tutor principal.
    - **Migración `create-patient-representative-links`**:
        - Incluye referencias explícitas con `model: { tableName: '...' }` para compatibilidad MySQL en Windows.
        - Índices (`tenant_id`, `patient_id`, `representative_id`).
        - Restricción única `uq_rep_link_unique`.
    - **Estructura completa del módulo**:
        - `patient_representative_link.repository.js`: asignación, eliminación, y set/unset de primario.
        - `patient_representative_link.service.js`: transacciones, logs, notify, validación.
        - `patient_representative_link.controller.js`: listar, asignar, eliminar, marcar primario.
        - `patient_representative_link.validator.js`: validadores REST.
        - `patient_representative_link.routes.js`: rutas REST integradas con permisos.

### Changed
- **Corrección crítica en migración** `create-patient-representative-links`:
    - Reemplazo de:
      ```js
      references: { model: 'patient_representatives' }
      ```
      por:
      ```js
      references: { model: { tableName: 'patient_representatives' } }
      ```
    - Soluciona el error MySQL:
      ```
      Failed to open the referenced table 'patient_representatives'
      ```
      causado por resolución temprana de FK en entornos Windows.

### Notes
- Sistema completo para:
    - Datos fiscales por paciente (múltiples RFC).
    - Representantes legales por paciente (con tutor principal).
- Todos los módulos incluyen:
    - Soft delete (`paranoid: true`).
    - Índices optimizados.
    - Auditoría completa (`createLog`, `logApiError`).
    - Notificaciones internas automáticas.
- **Requiere ejecutar**:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.6.0] - 2025-11-20

### Added
- **Nuevo endpoint para autogenerar número de expediente:**
    - Ruta: `GET /patients/next-medical-record`
    - Protegida con `validateToken`, `loadPermissions` y `checkPermissions('write', 'patients')`.
    - Devuelve el siguiente número de expediente basado en:
        - `tenant.code` (últimos 4 caracteres).
        - Consecutivo interno de 4 dígitos por tenant.
    - Preparado para soportar múltiples clínicas (multi-tenant).

- **Nuevos métodos en la capa de negocio (Patient):**
    - `patient.service.js` → `getNextMedicalRecord(user)`:
        - Obtiene el tenant asociado al usuario.
        - Lee el último expediente del tenant.
        - Genera el siguiente folio con padding de 4 dígitos.
    - `patient.repository.js` → `getLastMedicalRecord(tenant_id)`:
        - Retorna el último `medical_record_number` del tenant ordenado de forma descendente.

- **Nuevo método en controlador:**
    - `patient.controller.js` → `getNextMedicalRecord`:
        - Respuesta JSON uniforme `{ next: "XXXXNNNN" }`.
        - Manejo de errores consistente con el resto del módulo.

### Changed
- **Reordenamiento crítico en `patient.routes.js`:**
    - La ruta `/next-medical-record` ahora se declara **antes** de `/:id`
      para evitar que Express la interprete como un parámetro dinámico.
    - Soluciona el error de validación:
      ```
      "El ID debe ser un número entero"
      ```
      causado por `getPatientByIdValidator`.

- **Compatibilidad con expedientes previos del seeder:**
    - El generador de consecutivos ahora toma como base el **último expediente real del tenant**, incluso si los valores iniciales fueron creados con formato antiguo (`MRN-x-yyyy`).
    - Mantiene integridad con el índice único (`tenant_id`, `medical_record_number`) sin romper datos existentes.

### Notes
- Esta actualización sienta la base para:
    - Uso real de folios por clínica.
    - Futuras integraciones con prefijos personalizados.
    - Reemplazo total de formatos antiguos (MRN-x-xxxx) cuando se actualice el seeder.
- La API ya es capaz de emitir folios consistentes incluso con datos previos legacy.

---

## [0.5.3] - 2025-11-12
### Added
- **Nuevo módulo clínico `Patient Conversations`** (`patient_conversations`):
    - Modelo `patient_conversation.model.js` con soporte multi-tenant (`tenant_id`) y relaciones directas con:
        - `Patient` (`patient_id`) → paciente asociado a la conversación.
        - `User` (`user_id`) → usuario (empleado o doctor) que registró o participó en la conversación.
    - Campos principales:
        - `title` (string, obligatorio, máx. 150 caracteres) → título o asunto de la conversación.
        - `content` (text, obligatorio) → detalle del intercambio o registro de comunicación.
    - **Migración `create-patient-conversations.js`**:
        - Crea la tabla `patient_conversations` con referencias a `tenants`, `patients` y `users`.
        - Incluye índices optimizados (`tenant_id`, `patient_id`, `user_id`).
        - Relaciones con `CASCADE` y timestamps (`created_at`, `updated_at`).
    - **Asociaciones en `associations.js`:**
        - `Tenant.hasMany(PatientConversation, { as: 'patient_conversations' })`
        - `Patient.hasMany(PatientConversation, { as: 'conversations' })`
        - `User.hasMany(PatientConversation, { as: 'authored_conversations' })`
        - `PatientConversation.belongsTo(Tenant, { as: 'tenant' })`
        - `PatientConversation.belongsTo(Patient, { as: 'patient' })`
        - `PatientConversation.belongsTo(User, { as: 'author' })`
    - **Estructura completa del módulo:**
        - `patient_conversation.repository.js` → métodos CRUD (`createConversation`, `updateConversation`, `deleteConversation`, `findById`, `findByPatientId`) con `Sequelize`.
        - `patient_conversation.service.js` → lógica de negocio con:
            - Transacciones (`sequelize.transaction()`).
            - Auditoría (`createLog`, `logApiError`).
            - Notificaciones automáticas (`notifyUser`).
            - Control de permisos: solo el autor puede editar o eliminar su conversación.
        - `patient_conversation.controller.js` → endpoints REST:
            - `POST /patient-conversations` → crear conversación.
            - `PUT /patient-conversations/:id` → actualizar conversación.
            - `DELETE /patient-conversations/:id` → eliminar conversación.
            - `GET /patient-conversations/patient/:patient_id` → listar conversaciones por paciente.
            - `GET /patient-conversations/:id` → obtener una conversación específica.
        - `patient_conversation.validator.js` → validaciones con `express-validator` (campos obligatorios, límites de longitud).
        - `patient_conversation.routes.js` → rutas protegidas con middlewares (`validateToken`, `loadPermissions`, `checkPermissions`, `validateRequest`).
    - **Integración lista para router principal:**
      ```js
      const patientConversationRoutes = require('../modules/patient_conversation/patient_conversation.routes');
      app.use('/api/patient-conversations', patientConversationRoutes);
      ```

### Notes
- Este módulo permite registrar y consultar **conversaciones o registros de comunicación** entre el personal clínico y los pacientes.
- Compatible con auditoría, permisos y sistema de notificaciones internas.
- Solo los autores de cada conversación pueden modificar o eliminar sus registros.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.5.2] - 2025-11-12
### Added
- **Nuevo módulo clínico `Patient Notes`** (`patient_notes`):
    - Modelo `patient_note.model.js` con soporte multi-tenant (`tenant_id`) y relaciones directas con:
        - `Patient` (`patient_id`) → paciente asociado.
        - `User` (`user_id`) → autor de la nota (empleado o doctor).
    - Campos principales:
        - `title` (string, obligatorio) → título o resumen de la nota.
        - `content` (text, obligatorio) → descripción o contenido completo.
        - `is_private` (boolean, por defecto `false`) → determina si la nota es privada o visible para otros usuarios.
    - **Migración `create-patient-notes.js`**:
        - Crea la tabla `patient_notes` con referencias a `tenants`, `patients` y `users`.
        - Índices optimizados (`tenant_id`, `patient_id`, `user_id`, `is_private`).
        - `CASCADE` en todas las relaciones y `timestamps` (`created_at`, `updated_at`).
    - **Asociaciones en `associations.js`:**
        - `Tenant.hasMany(PatientNote, { as: 'patient_notes' })`
        - `Patient.hasMany(PatientNote, { as: 'notes' })`
        - `User.hasMany(PatientNote, { as: 'authored_notes' })`
        - `PatientNote.belongsTo(Tenant, { as: 'tenant' })`
        - `PatientNote.belongsTo(Patient, { as: 'patient' })`
        - `PatientNote.belongsTo(User, { as: 'author' })`
    - **Estructura completa del módulo:**
        - `patient_note.repository.js` → métodos CRUD (`createNote`, `updateNote`, `deleteNote`, `findById`, `findByPatientId`), con soporte para visibilidad de notas privadas.
        - `patient_note.service.js` → lógica de negocio con:
            - Transacciones Sequelize (`sequelize.transaction()`).
            - Control de privacidad (`is_private`) y permisos del autor.
            - Logs de auditoría (`createLog`, `logApiError`).
            - Notificaciones automáticas (`notifyUser`) para notas públicas.
        - `patient_note.controller.js` → endpoints REST:
            - `POST /patient-notes` → crear nota.
            - `PUT /patient-notes/:id` → actualizar.
            - `DELETE /patient-notes/:id` → eliminar (borrado físico).
            - `GET /patient-notes/patient/:patient_id` → listar notas por paciente.
            - `GET /patient-notes/:id` → obtener una nota específica.
        - `patient_note.validator.js` → validaciones con `express-validator` (campos obligatorios, privacidad, longitud de texto).
        - `patient_note.routes.js` → rutas protegidas con middlewares (`validateToken`, `loadPermissions`, `checkPermissions`, `validateRequest`).
    - **Integración lista para router principal:**
      ```js
      const patientNoteRoutes = require('../modules/patient_note/patient_note.routes');
      app.use('/api/patient-notes', patientNoteRoutes);
      ```

### Notes
- Este módulo permite registrar **notas clínicas o administrativas** asociadas a pacientes, manteniendo trazabilidad del autor.
- Compatible con el sistema de auditoría, roles y permisos.
- Las notas privadas solo pueden ser vistas o editadas por su autor.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.5.1] - 2025-11-12
### Added
- **Nuevo módulo clínico `Patient Hobbies`** (`patient_hobbies`):
    - Modelo `patient_hobby.model.js` con soporte multi-tenant (`tenant_id`) y relación directa con `Patient` (`patient_id`).
    - Campo `name` obligatorio para registrar pasatiempos o actividades recreativas del paciente.
    - **Migración `create-patient-hobbies.js`**:
        - Crea la tabla `patient_hobbies` con claves foráneas hacia `tenants` y `patients`.
        - Índices optimizados en `tenant_id` y `patient_id`.
        - Restricción única `uq_patient_hobbies_unique_per_patient` para evitar duplicados del mismo hobby por paciente.
    - **Asociaciones (`associations.js`)**:
        - `Tenant.hasMany(PatientHobby, { as: 'patient_hobbies' })`
        - `Patient.hasMany(PatientHobby, { as: 'hobbies' })`
    - **Estructura completa del módulo:**
        - `patient_hobby.repository.js` → Métodos CRUD con `Sequelize` y relaciones (`Tenant`, `Patient`).
        - `patient_hobby.service.js` → Lógica de negocio con:
            - Transacciones Sequelize (`sequelize.transaction()`).
            - Logs de auditoría (`createLog`, `logApiError`).
            - Notificaciones automáticas (`notifyUser`).
        - `patient_hobby.controller.js` → Endpoints REST:
            - `POST /patient-hobbies` → Crear pasatiempo.
            - `PUT /patient-hobbies/:id` → Actualizar pasatiempo.
            - `DELETE /patient-hobbies/:id` → Eliminar (borrado físico).
            - `GET /patient-hobbies/patient/:patient_id` → Listar pasatiempos por paciente.
        - `patient_hobby.validator.js` → Validaciones con `express-validator` para creación, edición y consulta.
        - `patient_hobby.routes.js` → Rutas protegidas con middlewares (`validateToken`, `checkPermissions`, `loadPermissions`, `validateRequest`).
    - **Integración lista para router principal:**
      ```js
      const patientHobbyRoutes = require('../modules/patient_hobby/patient_hobby.routes');
      app.use('/api/patient-hobbies', patientHobbyRoutes);
      ```

### Notes
- Este módulo permite registrar los **pasatiempos o intereses personales** de los pacientes, mejorando la personalización en el trato clínico.
- Compatible con el sistema de auditoría y notificaciones internas.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.5.0] - 2025-11-12
### Added
- **Nuevo esquema de usuarios y autenticación:**
    - Creación de los modelos:
        - `employee.model.js` → almacena datos personales y laborales del personal clínico.
        - `user.model.js` → almacena credenciales de acceso, vinculado opcionalmente a un `employee`.
        - `user_role.model.js` → tabla pivote N:M que conecta `users` y `roles`.
    - Se añadió soporte para múltiples roles por usuario.
    - Se incorporó la relación `User.belongsTo(Employee, { as: 'employee' })` y `User.belongsToMany(Role, { through: UserRole, as: 'roles' })`.
    - Nuevas migraciones para `employees`, `users` y `user_roles` con índices optimizados y `underscored: true`.
    - Campos auditables (`createdAt`, `updatedAt`, `deletedAt`) y soft delete activado con `paranoid: true`.

- **Autenticación multirol y modular:**
    - `auth.service.js`:
        - Refactor completo de `login()` para admitir múltiples roles, validación de tenant, e incluir `roles` y `permissions` en la respuesta.
        - `me()` reescrito para devolver datos consolidados del usuario con:
            - Información del `employee`.
            - Módulos activos del `tenant`.
            - Permisos fusionados de todos los roles.
            - `full_name` derivado dinámicamente desde `employee`.
    - `auth.repository.js`:
        - Reescrito con métodos optimizados:
            - `findUserByTenantAndUsernameOrEmail()`
            - `findUserWithRelations()`
            - `findUserRoles()` y `findUserPermissions()` (para combinar permisos multirol).
        - Inclusión de `Employee`, `Roles`, `Permissions`, `Tenant` y `TenantModules` en consultas.
    - `auth.controller.js` actualizado para devolver respuestas uniformes (`success`, `data`, `message`).
    - `auth.routes.js` modernizado con estructura clara y respuestas JSON estandarizadas.
    - `loadPermissions.middleware.js` actualizado:
        - Carga todos los permisos según los roles del usuario.
        - Fusión inteligente de permisos repetidos entre roles.
    - `checkPermissions.middleware.js` actualizado para trabajar con `req.user.permissions[module]`.

- **Nuevos índices y buenas prácticas:**
    - Índices únicos y de rendimiento agregados en:
        - `users` (`email`, `tenant_id`)
        - `user_roles` (`user_id`, `role_id`)
        - `employees` (`tenant_id`)
    - Uso uniforme de `underscored: true` y `paranoid: true` en todos los modelos.

### Changed
- **Reestructuración general del modelo de datos:**
    - Eliminado `role_id` de `User` (ya no es un campo directo).
    - `User` ahora contiene referencia opcional `employee_id`.
    - Ajustadas relaciones en `associations.js` para reflejar la nueva jerarquía:
        - `User ↔ Employee`
        - `User ↔ Role (N:M)`
        - `Role ↔ Permission`
        - `Tenant ↔ User`, `Tenant ↔ Role`, `Tenant ↔ Permission`.
    - Revisión completa de `associations.js` para mantener integridad referencial y consistencia de alias.

- **Seeders revisados:**
    - `seedTenants.js`: mantiene creación de tenants con suscripciones automáticas.
    - `seedTenantModules.js`: inicializa módulos y features base por plan.
    - `seedRolesAndPermissionsClinic.js`: redefine roles y permisos base según módulos activos.
    - `seedAdminUsersClinic.js`:
        - Crea registros en `employees`, `users` y `user_roles` de forma coordinada.
        - Genera usuarios con sus respectivos roles (`Administrador General`, `Director Médico`, `Recepcionista`, `Odontólogo`).
    - `seedPatientRelationsClinic.js`: se mantiene funcional con nuevas dependencias.
    - `seedPatientsClinic.js`: ajustado para soportar relación N:M (`patient_patient_type`).

- **Actualización de migraciones:**
    - Migraciones recreadas para todos los modelos (`tenant`, `subscription`, `role`, `permission`, `tenant_module`, `tenant_feature`, `employee`, `user`, `user_role`, etc.).
    - Agregados índices eficientes y relaciones en cascada (`CASCADE` / `SET NULL` según corresponda).

### Fixed
- Corrección del error en middleware de permisos:
    - Se eliminó el uso de `req.user.role_id` (ya no existe).
    - Se reemplazó por carga dinámica de permisos según todos los roles asociados.
- `auth/me` ahora funciona correctamente y devuelve toda la información esperada (sin errores de Sequelize).

### Notes
- Esta versión introduce **autenticación multirol y modelo unificado para empleados y usuarios.**
- Mejora la escalabilidad para gestión de acceso granular y auditorías futuras.
- Después de esta actualización, **es obligatorio ejecutar nuevamente las migraciones y seeders:**
  ```bash
  npx sequelize-cli db:migrate
  node src/utils/seedTenants.js
  node src/utils/seedTenantModules.js
  node src/utils/seedRolesAndPermissions.js
  node src/utils/seedAdminUsersClinic.js

---

## [0.4.1] - 2025-11-12
### Changed
- **Actualización del seeder `seedTenantModulesClinic.js`:**
    - Reestructurada la definición de módulos **core** y **por plan**:
        - `patients` se movió a los **módulos core** (ya que es esencial para cualquier clínica).
        - `patient_alerts` se removió del core y se asignó únicamente a los planes **Pro** y **Premium**, para mantener la diferenciación funcional entre planes.
    - Se agregó el nuevo módulo base **`bracket_types`** al arreglo `coreModules`, permitiendo que todas las clínicas administren su catálogo de tipos de brackets.
    - Ahora la estructura final queda así:
      ```js
      // Core
      ['users', 'roles', 'permissions', 'auth', 'settings', 'logs', 'notifications', 'patients', 'bracket_types']

      // Planes
      Basic → ['appointments', 'billing']
      Pro → ['appointments', 'billing', 'patient_alerts', 'communications', 'inventory']
      Premium → ['appointments', 'billing', 'patient_alerts', 'communications', 'inventory', 'reports', 'integrations', 'patientPortal']
      ```
    - Se actualizó el log de inicialización para reflejar correctamente los módulos combinados por plan.

- **Actualización del archivo `notificationRules.js`:**
    - Sustituida la versión POS por una matriz clínica adaptada a roles dentales:
        - Roles soportados: `Administrador General`, `Director Médico`, `Odontólogo`, `Recepcionista`, `Asistente Dental`, `Contador`, `Técnico de Sistemas`, entre otros.
        - Eventos cubiertos: creación y modificación de pacientes, citas, tratamientos, pagos, alertas, e inventario.
    - Se eliminan los roles comerciales (`Gerente de Tienda`, `Cajero`, etc.) y se reemplazan por los del dominio clínico.
    - Se añadió soporte de notificaciones específicas para alertas de pacientes (`PATIENT_ALERT_CREATED`, `PATIENT_ALERT_RESOLVED`).

### Notes
- Con esta versión, los módulos core reflejan únicamente las funcionalidades clínicas indispensables.
- La separación de `patient_alerts` mejora la escalabilidad de los planes de suscripción.
- `notificationRules.js` queda alineado con los roles definidos en `seedRolesAndPermissionsClinic.js`.

---

## [0.4.0] - 2025-11-11
### Added
- **Nuevo módulo clínico `Bracket Types`** (`bracket_types`):
    - Estructura completa del módulo:
        - `bracket_type.model.js` → Modelo Sequelize con soporte multi-tenant (`tenant_id`) y `paranoid: true`.
        - `bracket_type.repository.js` → Métodos CRUD (`findAll`, `findById`, `findByName`, `createBracketType`, `updateBracketType`, `softDeleteBracketType`) y soporte DataTable.
        - `bracket_type.service.js` → Lógica de negocio con validación de duplicados, transacciones Sequelize, logs de auditoría (`createLog`, `logApiError`) y notificaciones (`notifyUser`).
        - `bracket_type.controller.js` → Endpoints REST (`getAll`, `getOne`, `create`, `update`, `softDelete`, `getDatatable`).
        - `bracket_type.validator.js` → Validaciones con `express-validator` (sin `tenant_id` explícito, se obtiene del JWT).
        - `bracket_type.routes.js` → Rutas protegidas bajo `/api/bracket-types` con middlewares (`validateToken`, `loadPermissions`, `checkPermissions`, `validateRequest`).
    - **Migración `create-bracket-types.js`**:
        - Crea la tabla `bracket_types` con índices (`tenant_id`, `name`, `material`).
        - Relaciones definidas con `Tenant` y `Patient` en `associations.js`.
        - Incluye `deletedAt` para soft delete.
    - **Integración en el router principal (`index.js`)**:
        - `router.use('/bracket-types', bracketTypeRoutes);`
    - **Permisos estandarizados**:
        - `read:bracket_types`, `write:bracket_types`, `edit:bracket_types`, `delete:bracket_types`.

### Notes
- Permite administrar los tipos de brackets disponibles por clínica (`tenant`), con atributos personalizados como material, fabricante y color.
- Integrado con el expediente clínico del paciente a través de la relación `Patient.belongsTo(BracketType)`.
- Mantiene la misma estructura de logs, auditoría y permisos que los módulos `Patient`, `PatientType` y `Occupation`.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.3.3] - 2025-11-11
### Changed
- **Depuración completa del dominio POS**:
    - Eliminados todos los modelos y asociaciones relacionados con el punto de venta:
        - `store.model.js`, `product.model.js`, `cashRegister.model.js`, `cashSession.model.js`,
          `cashMovement.model.js`, `brand.model.js`, `category.model.js`, `department.model.js`,
          `departmentStore.model.js`, `productStore.model.js`, `supplier.model.js`,
          `inventoryMovement.model.js`, `tax.model.js`, `unit.model.js`.
    - Limpieza total de `associations.js` para conservar únicamente las relaciones clínicas y del núcleo multi-tenant (`Tenant`, `User`, `Role`, `Permission`, `Patient`, etc.).
    - Eliminación de rutas POS (`/stores`, `/products`, `/cash-registers`, etc.) del router principal.
    - Eliminados seeders de POS (`seedStores.js`, `seedCategories.js`, `seedDepartments.js`, `seedTaxes.js`, `seedUnits.js`).

- **Reestructuración del módulo `Tenant`**:
    - Eliminado el campo `profit_margin` del modelo `tenant.model.js`, su migración y todos los repositorios, servicios, validadores y seeders asociados.
    - Nueva migración incremental `remove-profit-margin-from-tenants.js` para eliminar la columna `profit_margin` de la base de datos.
    - `tenant.repository.js`, `tenant.service.js` y `tenant.validator.js` actualizados para remover referencias al margen global.
    - Eliminada la sincronización automática de márgenes con sucursales (ya no existen).
    - `seedTenants.js` actualizado: eliminado el campo `profit_margin` en los datos iniciales.

- **Refactor del módulo `Auth`**:
    - Eliminadas todas las dependencias de `store` y `storeRepository` en `auth.repository.js` y `auth.service.js`.
    - `auth.service.js` simplificado: ahora el método `me()` devuelve información únicamente del `tenant` (clínica) sin subniveles.
    - `auth.repository.js` actualizado para excluir `Store` del `include` en las consultas de usuario.
    - `auth.routes.js`, `auth.controller.js` y `auth.validator.js` revisados y confirmados sin dependencias del POS.

### Added
- **Migración incremental `remove-profit-margin-from-tenants.js`**:
    - Elimina la columna `profit_margin` de la tabla `tenants`.
    - Incluye `down()` para rollback seguro (recrea la columna con los valores originales).

### Notes
- Esta actualización finaliza la separación completa entre el dominio **POS** y el dominio **Clínico**.
- La API ahora se centra exclusivamente en la gestión de clínicas dentales, pacientes, alertas y catálogos clínicos.
- Ejecutar tras actualizar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.3.2] - 2025-11-11
### Added
- **Nuevo módulo clínico `Patient Alerts`** (`patient_alerts`):
    - Modelo `patient_alert.model.js` con soporte multi-tenant (`tenant_id`) y relación directa con `Patient` (`patient_id`).
    - Campo booleano `is_admin_alert` para distinguir alertas administrativas (con notificación interna automática).
    - Asociaciones definidas en `associations.js`:
        - `Tenant.hasMany(PatientAlert, { as: 'patient_alerts' })`
        - `Patient.hasMany(PatientAlert, { as: 'alerts' })`
    - **Migración `create-patient-alerts.js`**:
        - Crea la tabla `patient_alerts` con referencias a `tenants` y `patients`.
        - Borrado físico (sin `paranoid`) y con índices en `tenant_id`, `patient_id` e `is_admin_alert`.
    - Validadores `patient_alert.validator.js` con `express-validator` para:
        - Creación (`createPatientAlertValidator`)
        - Actualización (`updatePatientAlertValidator`)
        - Eliminación y obtención por ID (`getPatientAlertByIdValidator`)
    - Controlador `patient_alert.controller.js` con endpoints para:
        - Crear, actualizar y eliminar alertas (borrado físico, con log en MongoDB).
        - Listar alertas únicamente por paciente (`GET /patient-alerts/patient/:patient_id`).
    - Servicio `patient_alert.service.js` con lógica de negocio:
        - Transacciones Sequelize (`sequelize.transaction()`).
        - Logs de auditoría (`createLog`, `logApiError`).
        - Notificaciones automáticas (`notifyUser`) en alertas administrativas.
        - Eliminación física (`destroy({ force: true })`), no `paranoid`.
    - Repositorio `patient_alert.repository.js`:
        - Métodos CRUD basados en Sequelize (`createAlert`, `updateAlert`, `deleteAlert`, `findByPatientId`).
        - Relaciones completas con `Tenant` y `Patient` (`include` con alias).
    - Rutas `patient_alert.routes.js` integradas con middlewares:
        - `validateToken`, `loadPermissions`, `checkPermissions` y `validateRequest`.
        - Endpoints REST bajo `/api/patient-alerts`.

- **Configuración `.env` actualizada**:
    - Variable `JWT_SECRET` agregada para autenticación con JWT.
    - Generación segura recomendada:
      ```bash
      node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
      ```
    - Agregado `JWT_EXPIRES_IN=7d` como tiempo de expiración predeterminado.

### Notes
- Las alertas solo existen **vinculadas a un paciente**, evitando registros “huérfanos”.
- El módulo registra auditoría completa en MongoDB (`logs`) y dispara notificaciones internas si la alerta es administrativa.
- Incluye soporte para borrado físico (no soft delete) y registro de auditoría completo.
- Requiere ejecutar:
  ```bash
  npx sequelize-cli db:migrate

---

## [0.3.1] - 2025-11-11
### Changed
- **Estructura de relación entre pacientes y tipos de paciente** actualizada de 1:N a N:M:
    - Eliminado el campo `patient_type_id` de la tabla `patients`.
    - Creada nueva tabla pivote `patient_patient_types` con soporte multi-tenant.
    - Migración incremental `remove-patient-type-column-and-add-pivot.js` agregada.
    - Actualizados modelos y asociaciones en `associations.js`:
        - `Patient.belongsToMany(PatientType, { as: 'types' })`
        - `PatientType.belongsToMany(Patient, { as: 'patients' })`
    - Actualizados `patient.repository.js`, `patient.service.js`, y `patient.controller.js` para manejar `patient_type_ids` como arreglo.
    - Actualizado `patient.validator.js` para validar arrays con `express-validator`.
    - Eliminada dependencia del campo `patient_type_id` en todas las capas de negocio y validación.

### Added
- **Nuevo modelo pivote `patient_patient_type.model.js`** con soporte `tenant_id`, `timestamps`, y `paranoid` (soft delete).
- **Nueva migración incremental** que elimina la FK antigua y crea la tabla pivote con índices (`tenant_id`, `patient_id`, `patient_type_id`).
- **Compatibilidad hacia atrás garantizada** en endpoints de lectura (`getAll`, `getProfile`, `getDatatable`), que ahora devuelven un arreglo `types` en lugar de un único campo `type`.

### Notes
- Esta actualización prepara el sistema para futuros filtros combinados (p. ej. "Activos y Referidos").
- Requiere ejecutar `npx sequelize-cli db:migrate` tras desplegar la nueva versión.

---

## [0.3.0] - 2025-11-10
### Added
- **Módulo completo `Patients`** (modelo, migración, validador, controlador, servicio, repositorio y rutas).
  - Modelo `patient.model.js` con soporte multi-tenant y campos clínicos (datos médicos, alergias, hábitos, tratamientos, portal del paciente, etc.).
  - Migración `create-patients.js` con todas las relaciones a catálogos (`referrals`, `occupations`, `patient_types`, `patient_statuses`, `bracket_types`, `patient_professions`).
  - Validadores `patient.validator.js` con `express-validator` para creación, actualización y consulta.
  - Controlador `patient.controller.js` con endpoints CRUD y vista de expediente clínico (`getProfile`).
  - Servicio `patient.service.js` con transacciones Sequelize, logging, notificaciones y soporte DataTable.
  - Repositorio `patient.repository.js` con consultas y relaciones completas (`include` con alias).
  - Rutas `patient.routes.js` integradas en `index.js` bajo `/patients`.

- **Catálogos clínicos dependientes**:
  - `referral.model.js` → Fuente de referencia del paciente.
  - `occupation.model.js` → Ocupación laboral.
  - `patient_type.model.js` → Tipo de paciente (nuevo, control, referido, etc.).
  - `patient_status.model.js` → Estado clínico (Fase I, Retenedor, Alta, etc.).
  - `bracket_type.model.js` → Tipo de brackets utilizados (metálico, cerámico, autoligado, etc.).
  - `patient_profession.model.js` → Catálogo para títulos profesionales (Lic., Dr., C.D., Mtro.).
  - Migraciones Sequelize para cada uno de los catálogos.

- **Archivo `associations.js`** actualizado:
  - Relaciones bidireccionales entre `Tenant` ↔ Catálogos y `Patient` ↔ Catálogos.
  - Alias estandarizados (`type`, `status`, `bracket_type`, `profession`, etc.).
  - Eliminación de definiciones de relaciones dentro de los modelos individuales.

- **Seeders clínicos**:
  - `seedTenantModulesClinic.js`: módulos activados por plan (`Basic`, `Pro`, `Premium`) y módulos core siempre activos (`users`, `roles`, `permissions`, `auth`, `settings`, `logs`, `notifications`).
  - `seedRolesAndPermissionsClinic.js`: roles adaptados al contexto dental (`Administrador General`, `Director Médico`, `Odontólogo`, `Recepcionista`, etc.) con permisos generados automáticamente según los módulos habilitados.
  - `seedAdminUsersClinic.js`: crea usuarios base por clínica (Administrador, Director Médico, Recepcionista y Odontólogo).

- **Archivo `notificationRulesClinic.js`** agregado con matriz de eventos clínicos:
  - Notificaciones para creación, actualización y cancelación de pacientes, citas y pagos.
  - Roles receptores definidos por tipo de evento (p. ej. `Recepcionista`, `Odontólogo`, `Director Médico`).

### Changed
- Separación estructural entre el dominio **POS** y el dominio **Clínico**.
- Reorganización de seeders para soportar módulos activados por plan y no por funcionalidades.
- Estandarización de convenciones `snake_case` en campos de base de datos (excepto timestamps).
- Actualización de rutas principales (`index.js`) para integrar `/patients` y comentar temporalmente los catálogos dependientes durante pruebas.

---

## [0.2.0] - 2025-11-10
### Added
- Nuevo **modelo `Tenant`** con estructura completa para clínicas dentales:
  - Campos de identidad (`code`, `name`, `description`, `logo_url`, `website`).
  - Campos fiscales (`tax_id`, `legal_name`, `regime`, `certificate_path`, `key_path`, `certificate_password`, `cfdi_use`, `payment_method`, `payment_form`, `tax_rate`).
  - Campos clínicos (`specialties`, `number_of_rooms`, `health_registration`, `health_registration_expires_at`).
  - Configuración regional (`timezone`, `currency`, `exchange_rate`, `profit_margin`, `opening_hours`).
  - Control de suscripción (`status`, `current_subscription_id`, `max_users`, `current_users`).
- **Migración Sequelize `create-tenants-table`** con soporte camelCase (`createdAt`, `updatedAt`, `deletedAt`).
- **Seeder `seedTenants.js`** adaptado al contexto de clínicas dentales:
  - Crea tres clínicas demo: *Clínica Dental Sonrisa Feliz*, *Dental Care Premium* y *Sonrisa Total Nogales*.
  - Asigna automáticamente suscripciones activas (`Professional`).
  - Integra número de registro sanitario COFEPRIS y fecha de vencimiento.
- **Seeder `seedStores.js`** actualizado:
  - Cambiados nombres y referencias para coincidir con las nuevas clínicas.
  - Crea sucursales por clínica con `use_parent_tax_data` y datos fiscales específicos.
- Configuración del modelo `Tenant` con `underscored: false` para mantener los timestamps (`createdAt`, `updatedAt`, `deletedAt`).

### Changed
- Estructura de base de datos extendida para soportar el dominio clínico (reemplazo del contexto POS).
- Ajustes en seeders para dependencias entre `Tenant` y `Store`.

---

## [0.1.0] - 2025-11-10
### Added
- Estructuración inicial de la API con la nueva organización de carpetas:
  - `src/bootstrap/` (arranque: `index.js`, `seeds.js`)
  - `src/config/` (conexiones a MySQL, Mongo, mailer)
  - `src/middlewares/` (auth, cors, security, permissions, etc.)
  - `src/modules/` (módulos independientes: `auth`, `user`, `role`, `tenant`, etc.)
  - `src/utils/` (helpers centralizados)
- Configuración de **migraciones Sequelize**.
- Primera migración: creación de tabla **users**.
- Definición del modelo `user.model.js` (con soporte multi-tenant y soft delete).
