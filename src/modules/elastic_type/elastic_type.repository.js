const ElasticType = require('../../models/mysql/elastic_type.model');
const { Op } = require('sequelize');

class ElasticTypeRepository {
    async findAll(tenant_id) {
        return ElasticType.findAll({
            where: { tenant_id },
            order: [['name', 'ASC']]
        });
    }

    async findById(id, tenant_id) {
        return ElasticType.findOne({
            where: { id, tenant_id }
        });
    }

    async findByName(name, tenant_id) {
        return ElasticType.findOne({
            where: { name, tenant_id }
        });
    }

    async createElasticType(data, transaction = null) {
        return ElasticType.create(data, { transaction });
    }

    async updateElasticType(elasticType, data, transaction = null) {
        return elasticType.update(data, { transaction });
    }

    async softDeleteElasticType(elasticType, transaction = null) {
        return elasticType.destroy({ transaction });
    }

    async datatable(params, tenant_id) {
        const { start, length, searchValue, orderColumn, orderDir } = params;

        const where = {
            tenant_id,
            [Op.or]: [
                { name: { [Op.like]: `%${searchValue}%` } },
                { type: { [Op.like]: `%${searchValue}%` } },
                { size: { [Op.like]: `%${searchValue}%` } },
                { oz: { [Op.like]: `%${searchValue}%` } }
            ]
        };

        const { count, rows } = await ElasticType.findAndCountAll({
            where,
            order: [[orderColumn, orderDir]],
            offset: start,
            limit: length
        });

        return {
            recordsTotal: count,
            recordsFiltered: count,
            rows
        };
    }
}

module.exports = new ElasticTypeRepository();
