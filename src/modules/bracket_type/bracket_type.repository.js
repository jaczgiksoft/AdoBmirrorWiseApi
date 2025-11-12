// src/modules/bracket_type/bracket_type.repository.js
const { Op } = require('sequelize');
const BracketType = require('../../models/mysql/bracket_type.model');

class BracketTypeRepository {
    // 📋 Obtener todos los tipos de brackets de un tenant
    async findAll(tenant_id) {
        return BracketType.findAll({
            where: { tenant_id },
            order: [['name', 'ASC']],
        });
    }

    // 🔍 Buscar por ID
    async findById(id, tenant_id) {
        return BracketType.findOne({ where: { id, tenant_id } });
    }

    // 🔍 Buscar por nombre (para evitar duplicados)
    async findByName(name, tenant_id) {
        return BracketType.findOne({
            where: {
                tenant_id,
                name: { [Op.like]: name },
            },
        });
    }

    // 🟢 Crear nuevo tipo de bracket
    async createBracketType(data, transaction) {
        return BracketType.create(data, { transaction });
    }

    // 🟡 Actualizar tipo de bracket
    async updateBracketType(bracketType, data, transaction) {
        return bracketType.update(data, { transaction });
    }

    // 🔴 Eliminación lógica (soft delete)
    async softDeleteBracketType(bracketType, transaction) {
        await bracketType.destroy({ transaction }); // usa paranoid: true
    }

    // 📊 DataTable (para listados filtrados/paginados)
    async datatable(params, tenant_id) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const where = {
            tenant_id,
            ...(searchValue
                ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchValue}%` } },
                        { material: { [Op.like]: `%${searchValue}%` } },
                        { manufacturer: { [Op.like]: `%${searchValue}%` } },
                    ],
                }
                : {}),
        };

        const recordsTotal = await BracketType.count({ where: { tenant_id } });
        const { rows, count: recordsFiltered } = await BracketType.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new BracketTypeRepository();
