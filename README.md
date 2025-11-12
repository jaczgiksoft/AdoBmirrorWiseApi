# 🦷 BWISE Dental API

**BWISE Dental** es una plataforma integral para la gestión clínica y administrativa de consultorios y cadenas dentales.  
Esta API proporciona todos los servicios backend necesarios para manejar el ecosistema de BWISE, incluyendo pacientes, citas, odontogramas, historiales clínicos, fotografías, presupuestos, inventarios y mucho más.

---

## 🚀 Descripción general

Esta API forma parte del ecosistema **BWISE Dental**, compuesto por:

- 🖥️ **BWISE Dental Desktop** → Aplicación de escritorio para uso clínico y operativo.
- 🌐 **BWISE Dental API** → Backend central, diseñado con arquitectura modular y multi-tenant.
- 📊 (Próximamente) **BWISE Dental Web Portal** → Panel de control administrativo y analítico.

La **API** es responsable de toda la lógica de negocio, gestión de datos y control de seguridad entre las aplicaciones cliente y los servicios internos.

---

## 🧩 Características principales

- **Arquitectura modular:** Cada dominio (pacientes, citas, usuarios, inventarios, etc.) es un módulo independiente.
- **Soporte multi-tenant:** Permite gestionar múltiples clínicas dentro del mismo entorno.
- **Transacciones seguras:** Todas las operaciones críticas usan transacciones Sequelize.
- **Auditoría completa:** Sistema de logs y notificaciones en tiempo real por evento.
- **Control de permisos granular:** Roles y permisos definidos dinámicamente por módulo.
- **Validaciones robustas:** Basadas en `express-validator` y middlewares personalizados.
- **Soft delete (paranoid):** Todas las tablas clave incluyen eliminación lógica (`deletedAt`).
- **Relaciones N:M:** Implementadas en entidades como `Patients` ↔ `PatientTypes` para mayor flexibilidad de filtrado.

---

## 🧠 Tecnologías principales

| Componente | Tecnología |
|-------------|-------------|
| **Runtime** | Node.js (v20+) |
| **Framework** | Express.js |
| **ORM** | Sequelize ORM |
| **Base de datos** | MySQL / MariaDB |
| **Autenticación** | JWT con middlewares personalizados |
| **Validación** | express-validator |
| **Logger** | Winston + Log Helper |
| **Notificaciones** | Sistema interno con `notify.helper.js` |
| **Semver** | Versionado basado en [Semantic Versioning 2.0.0](https://semver.org/lang/es/) |

---

## 🧱 Estructura de carpetas

