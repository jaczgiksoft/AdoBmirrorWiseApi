// src/modules/supplier/supplier.service.js
const sequelize = require('../../config/database');
const supplierRepository = require('./supplier.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyRoles } = require('../../utils/notify.helper');

class SupplierService {
    /**
     * 🔹 Obtener todos los proveedores del tenant
     */
    async getAllSuppliers(currentUser) {
        return supplierRepository.findAllByTenant(currentUser.tenant_id);
    }

    /**
     * 🔹 Obtener un proveedor por ID
     */
    async getSupplierById(id, currentUser) {
        const supplier = await supplierRepository.findById(id, currentUser.tenant_id);
        if (!supplier) throw new Error('Proveedor no encontrado');
        return supplier;
    }

    /**
     * 🟢 Crear proveedor
     */
    async createSupplier(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // Evitar duplicados por nombre
            const existing = await supplierRepository.findByName(data.name, currentUser.tenant_id);
            if (existing) throw new Error('Ya existe un proveedor con ese nombre');

            const allowedFields = [
                'name',
                'contact_name',
                'phone',
                'email',
                'address',
                'city',
                'state',
                'country',
                'postal_code',
                'tax_id',
                'website',
                'notes',
                'status',
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;
            cleanData.status = cleanData.status || 'active';

            const newSupplier = await supplierRepository.createSupplier(cleanData, t);
            await t.commit();

            // 🪵 Log y notificación
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'suppliers',
                description: `Proveedor creado: ${newSupplier.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: 'SUPPLIER_CREATED',
                title: 'Nuevo proveedor creado',
                message: `${currentUser.username} ha registrado al proveedor ${newSupplier.name}.`,
                link: `/suppliers/${newSupplier.id}`,
                actor: currentUser,
            });

            return newSupplier;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear proveedor: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    /**
     * 🟡 Actualizar proveedor
     */
    async updateSupplier(id, data, currentUser, req) {
        const supplier = await supplierRepository.findById(id, currentUser.tenant_id);
        if (!supplier) throw new Error('Proveedor no encontrado');

        if (data.name && data.name !== supplier.name) {
            const duplicate = await supplierRepository.findByName(data.name, currentUser.tenant_id);
            if (duplicate) throw new Error('Ya existe otro proveedor con ese nombre');
        }

        const allowedFields = [
            'name',
            'contact_name',
            'phone',
            'email',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'tax_id',
            'website',
            'notes',
            'status',
        ];

        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );

        await supplierRepository.updateSupplier(supplier, cleanData);

        await createLog({
            user_id: currentUser.id,
            user_name: currentUser.username,
            action: 'update',
            module: 'suppliers',
            description: `Proveedor actualizado: ${supplier.name}`,
            ip: req.ip,
            user_agent: req.headers['user-agent'],
        });

        await notifyRoles({
            tenant_id: currentUser.tenant_id,
            event: 'SUPPLIER_UPDATED',
            title: 'Proveedor actualizado',
            message: `${currentUser.username} actualizó los datos del proveedor ${supplier.name}.`,
            link: `/suppliers/${supplier.id}`,
            actor: currentUser,
        });

        return supplier;
    }

    /**
     * 🔴 Eliminar proveedor (soft delete)
     */
    async deleteSupplier(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const supplier = await supplierRepository.findById(id, currentUser.tenant_id);
            if (!supplier) throw new Error('Proveedor no encontrado');

            await supplierRepository.softDeleteSupplier(supplier, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'suppliers',
                description: `Proveedor eliminado: ${supplier.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            await notifyRoles({
                tenant_id: currentUser.tenant_id,
                event: 'SUPPLIER_DELETED',
                title: 'Proveedor eliminado',
                message: `${currentUser.username} eliminó al proveedor ${supplier.name}.`,
                actor: currentUser,
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar proveedor: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    /**
     * 📊 Datatable de proveedores
     */
    async getSuppliersDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || body.searchValue || '';
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'contact_name', 'email', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter = body.statusFilter || '';
        const city = body.city || '';
        const state = body.state || '';

        const params = {
            start,
            length,
            searchValue,
            orderColumn,
            orderDir,
            statusFilter,
            city,
            state,
        };

        const { recordsTotal, recordsFiltered, rows } =
            await supplierRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new SupplierService();
