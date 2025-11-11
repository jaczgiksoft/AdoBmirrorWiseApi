# 📑 CHANGELOG - BWISE Dental API

Todos los cambios relevantes del proyecto serán documentados aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).  
Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

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
