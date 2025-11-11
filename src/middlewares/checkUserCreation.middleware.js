// middlewares/checkUserCreation.js
const Tenant = require('../models/mysql/tenant.model');
const Subscription = require('../models/mysql/subscription.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const User = require('../models/mysql/user.model');

async function checkUserCreation(req, res, next) {
    try {
        const tenantId = req.user.tenant_id; // viene del JWT/session

        // 1. Validar Tenant con includes usando alias correctos
        const tenant = await Tenant.findByPk(tenantId, {
            include: [
                {
                    model: Subscription,
                    as: 'subscriptions', // 👈 alias correcto
                    where: { status: 'active' },
                    required: false
                },
                {
                    model: TenantModule,
                    as: 'modules' // 👈 alias correcto
                }
            ]
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant no encontrado' });
        }

        // 2. Validar suscripción activa
        const activeSub = tenant.subscriptions?.[0]; // 👈 coincide con alias
        if (!activeSub || new Date(activeSub.end_date) < new Date()) {
            return res
                .status(403)
                .json({ error: 'Suscripción vencida o inactiva' });
        }

        // 3. Validar límite de usuarios
        if (tenant.current_users >= tenant.max_users) {
            return res.status(403).json({
                error: `Se alcanzó el límite de ${tenant.max_users} usuarios.`
            });
        }

        // 4. Validar módulo "users"
        const userModule = tenant.modules.find(m => m.module === 'users'); // 👈 coincide con alias
        if (!userModule || !userModule.is_enabled) {
            return res
                .status(403)
                .json({ error: 'Módulo de usuarios no habilitado en tu plan' });
        }

        // ✅ Si pasa todo, continuar
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al validar creación de usuario' });
    }
}

module.exports = checkUserCreation;
