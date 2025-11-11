// src/modules/permission/permission.repository.js
const Permission = require('../../models/mysql/permission.model');
const TenantModule = require('../../models/mysql/tenant_module.model');

class PermissionRepository {
    async findAllByRole(roleId) {
        return Permission.findAll({ where: { role_id: roleId } });
    }

    async deleteByRole(roleId, transaction) {
        return Permission.destroy({ where: { role_id: roleId }, transaction });
    }

    async bulkCreate(permissions, transaction) {
        return Permission.bulkCreate(permissions, { transaction });
    }

    async findModulesByTenant(tenantId, transaction) {
        return TenantModule.findAll({ where: { tenant_id: tenantId }, transaction });
    }
}

module.exports = new PermissionRepository();
