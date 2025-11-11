# 🧾 MiraiPOS

**MiraiPOS** es una plataforma backend **multi-tenant** para la gestión integral de sistemas de punto de venta (**POS**) empresariales.  
Permite administrar múltiples empresas (tenants), tiendas, usuarios, roles, permisos, inventarios y operaciones de caja desde una única API modular.

---

## ⚙️ Tecnologías principales

- **Node.js + Express** — servidor y API REST.
- **Sequelize ORM** — conexión con base de datos (MySQL/MSSQL).
- **JWT Authentication** — autenticación segura con control de roles y permisos.
- **Arquitectura en capas** — separación entre controller, service y repository.
- **Logs & Notificaciones** — registro automático de acciones del sistema.

---

## 🧩 Módulos principales

- **Tenants:** gestión de empresas y suscripciones.
- **Stores:** administración de tiendas por tenant.
- **Users, Roles y Permissions:** control de acceso avanzado.
- **Products & Inventory:** gestión de productos e inventarios por tienda.
- **Cash Registers & Sessions:** control de cajas y movimientos de efectivo.
- **Logs y Notificaciones:** auditoría completa del sistema.

---

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/miraiPOS.git
cd miraiPOS

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env
# (editar las variables de conexión a base de datos)

# Ejecutar migraciones y seeders
npm run migrate
npm run seed

# Iniciar servidor
npm run dev
