// src/modules/tenant/tenant.controller.js
const tenantService = require('./tenant.service');

// 📋 Obtener todos los tenants (solo admin global)
const getAll = async (req, res) => {
    try {
        const tenants = await tenantService.getAllTenants(req.user);
        res.json(tenants);
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

// 🔍 Obtener un tenant por ID
const getOne = async (req, res) => {
    try {
        const tenant = await tenantService.getTenantById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant no encontrado' });
        }
        res.json(tenant);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 🟢 Crear nuevo tenant
const create = async (req, res) => {
    try {
        const tenant = await tenantService.createTenant(req.body, req.user, req);
        res.status(201).json({ message: 'Tenant creado exitosamente', tenant });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar tenant (puede incluir profit_margin)
const update = async (req, res) => {
    try {
        const tenant = await tenantService.updateTenant(req.params.id, req.body, req.user, req);
        res.json({ message: 'Tenant actualizado exitosamente', tenant });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar (soft delete)
const softDelete = async (req, res) => {
    try {
        await tenantService.deleteTenant(req.params.id, req.user, req);
        res.json({ message: 'Tenant eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ⚙️ Obtener configuración actual del tenant (para panel de settings)
const getSettings = async (req, res) => {
    try {
        const tenant = await tenantService.getTenantSettings(req.user);
        res.json(tenant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🛡️ Verificar código de tenant (público)
const verifyCode = async (req, res) => {
    try {
        const tenant = await tenantService.getTenantByCode(req.params.code);
        res.json({
            id: tenant.id,
            name: tenant.name,
            code: tenant.code,
            logo_url: tenant.logo_url
        });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// 📊 DataTable
const getDatatable = async (req, res) => {
    try {
        const result = await tenantService.getTenantsDatatable(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getSettings,
    getDatatable,
    verifyCode,
};
