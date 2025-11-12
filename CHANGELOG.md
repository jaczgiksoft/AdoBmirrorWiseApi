# 📑 CHANGELOG - BWISE Dental API

Todos los cambios relevantes del proyecto serán documentados aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).  
Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

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
