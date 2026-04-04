const BillingData = require('../../models/mysql/billing_data.model');
const Tenant = require('../../models/mysql/tenant.model');

class BillingDataRepository {

    async findAllByTenant(tenantId) {
        return BillingData.findAll({
            where: { tenant_id: tenantId },
            order: [['business_name', 'ASC']]
        });
    }

    async findById(id, tenantId) {
        return BillingData.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] }
            ]
        });
    }

    async findByRFC(rfc, tenantId) {
        return BillingData.findOne({
            where: { rfc, tenant_id: tenantId }
        });
    }

    async createBillingData(data, transaction) {
        return BillingData.create(data, { transaction });
    }

    async updateBillingData(billingData, data, transaction) {
        return billingData.update(data, { transaction });
    }

    async softDeleteBillingData(billingData, transaction) {
        return billingData.destroy({ transaction });
    }
}

module.exports = new BillingDataRepository();
