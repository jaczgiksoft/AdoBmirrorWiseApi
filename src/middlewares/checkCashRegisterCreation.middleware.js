// middlewares/checkCashRegisterCreation.middleware.js
const Tenant = require('../models/mysql/tenant.model');
const Subscription = require('../models/mysql/subscription.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const CashRegister = require('../models/mysql/cashRegister.model');

async function checkCashRegisterCreation(req, res, next) {
    try {
        const tenantId = req.user.tenant_id; // viene del JWT

        // 1. Validar Tenant con includes
        const tenant = await Tenant.findByPk(tenantId, {
            include: [
                {
                    model: Subscription,
                    as: 'subscriptions',
                    where: { status: 'active' },
                    required: false
                },
                {
                    model: TenantModule,
                    as: 'modules'
                }
            ]
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant no encontrado' });
        }

        // 2. Validar suscripción activa
        const activeSub = tenant.subscriptions?.[0];
        if (!activeSub || new Date(activeSub.end_date) < new Date()) {
            return res
                .status(403)
                .json({ error: 'Suscripción vencida o inactiva' });
        }

        // 3. Validar módulo "cashRegisters"
        const cashModule = tenant.modules.find(m => m.module === 'cashRegisters');
        if (!cashModule || !cashModule.is_enabled) {
            return res
                .status(403)
                .json({ error: 'Módulo de cajas no habilitado en tu plan' });
        }

        // 4. Validar unicidad de caja principal (is_main)
        if (req.body.is_main) {
            const existingMain = await CashRegister.findOne({
                where: {
                    tenant_id: tenantId,
                    store_id: req.body.store_id,
                    is_main: true
                }
            });

            if (existingMain) {
                return res.status(403).json({
                    error: `Ya existe una caja principal en la tienda con ID ${req.body.store_id}`
                });
            }
        }

        // ✅ Si pasa todo, continuar
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al validar creación de caja' });
    }
}

module.exports = checkCashRegisterCreation;
