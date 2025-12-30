const sequelize = require('../../config/database');
const clinicAreaRepository = require('./clinic_area.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class ClinicAreaService {
    // 🟢 Crear nueva área clínica
    async createClinicArea(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = [
                'name',
                'status',
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newClinicArea = await clinicAreaRepository.createClinicArea(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'clinic_areas',
                description: `Área clínica creada: ${newClinicArea.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newClinicArea;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear área clínica: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar área clínica existente
    async updateClinicArea(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const clinicArea = await clinicAreaRepository.findById(id, currentUser.tenant_id);
            if (!clinicArea) throw new Error('Área clínica no encontrada');

            const allowedFields = [
                'name',
                'status',
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await clinicAreaRepository.updateClinicArea(clinicArea, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'clinic_areas',
                description: `Área clínica actualizada: ${clinicArea.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return clinicArea;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar área clínica: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar área clínica (borrado lógico)
    async deleteClinicArea(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const clinicArea = await clinicAreaRepository.findById(id, currentUser.tenant_id);
            if (!clinicArea) throw new Error('Área clínica no encontrada');

            await clinicAreaRepository.deleteClinicArea(clinicArea, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'clinic_areas',
                description: `Área clínica eliminada: ${clinicArea.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar área clínica: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las áreas clínicas
    async getAllClinicAreas(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        return await clinicAreaRepository.findAllByTenant(currentUser.tenant_id);
    }

    // 🔍 Obtener un área clínica por ID
    async getClinicAreaById(id, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const clinicArea = await clinicAreaRepository.findById(id, currentUser.tenant_id);
        if (!clinicArea) throw new Error('Área clínica no encontrada');
        return clinicArea;
    }

    // 📊 DataTable (para listado filtrado/paginado)
    async getClinicAreasDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();
        const statusFilter = body.statusFilter || '';

        const columns = [null, 'name', 'status'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir, tenant_id: currentUser.tenant_id, statusFilter };

        const { recordsTotal, recordsFiltered, rows } = await clinicAreaRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new ClinicAreaService();
