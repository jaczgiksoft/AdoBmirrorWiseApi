// src/modules/positions/position.service.js
const positionRepository = require('./position.repository');

class PositionService {
    /**
     * Obtener todos los puestos del tenant
     */
    async getAllPositions(tenantId) {
        return positionRepository.findAllByTenant(tenantId);
    }

    /**
     * Obtener un puesto por ID
     */
    async getPositionById(id, tenantId) {
        const position = await positionRepository.findById(id, tenantId);
        if (!position) {
            throw new Error('Puesto no encontrado');
        }
        return position;
    }

    /**
     * Crear un nuevo puesto
     */
    async createPosition(data, tenantId) {
        // Verificar si existe uno con el mismo nombre
        const existing = await positionRepository.findByName(data.name, tenantId);
        if (existing) {
            throw new Error('Ya existe un puesto con este nombre');
        }

        const payload = {
            ...data,
            tenant_id: tenantId,
            status: 'active'
        };

        return positionRepository.createPosition(payload);
    }

    /**
     * Actualizar un puesto
     */
    async updatePosition(id, data, tenantId) {
        const position = await this.getPositionById(id, tenantId);

        // Si cambia el nombre, verificar unicidad
        if (data.name && data.name !== position.name) {
            const existing = await positionRepository.findByName(data.name, tenantId);
            if (existing) {
                throw new Error('Ya existe otro puesto con este nombre');
            }
        }

        return positionRepository.updatePosition(position, data);
    }

    /**
     * Eliminar un puesto (soft delete)
     */
    async deletePosition(id, tenantId) {
        const position = await this.getPositionById(id, tenantId);
        await positionRepository.softDeletePosition(position);
        return { message: 'Puesto eliminado correctamente' };
    }

    /**
     * Obtener datos para datatable
     */
    async getDatatable(params, tenantId) {
        return positionRepository.datatable(params, tenantId);
    }
}

module.exports = new PositionService();
