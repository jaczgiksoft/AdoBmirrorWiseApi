// middlewares/checkCashSession.middleware.js
const Tenant = require('../models/mysql/tenant.model');
const Subscription = require('../models/mysql/subscription.model');
const TenantModule = require('../models/mysql/tenant_module.model');
const CashSession = require('../models/mysql/cashSession.model');

async function checkCashSession(req, res, next) {
    try {
        const tenantId = req.user.tenant_id;
        const { cash_register_id } = req.body;
        if (!cash_register_id) {
            return res.status(400).json({ message: 'El campo cash_register_id es obligatorio' });
        }

        // 1️⃣ Buscar Tenant con suscripción y módulos
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

        if (!tenant) return res.status(404).json({ message: 'Tenant no encontrado' });

        // 2️⃣ Validar suscripción activa
        const activeSub = tenant.subscriptions?.[0];
        if (!activeSub || new Date(activeSub.end_date) < new Date()) {
            return res.status(403).json({ message: 'Suscripción vencida o inactiva' });
        }

        // 3️⃣ Validar módulo "cashSessions"
        const sessionModule = tenant.modules.find(m => m.module === 'cashSessions');
        if (!sessionModule || !sessionModule.is_enabled) {
            return res.status(403).json({ message: 'Módulo de sesiones de caja no habilitado en tu plan' });
        }

        // 4️⃣ Verificar sesión abierta
        const existingSession = await CashSession.findOne({
            where: { tenant_id: tenantId, cash_register_id, status: 'open' }
        });

        if (existingSession) {
            return res.status(403).json({
                message: `La caja con ID ${cash_register_id} ya tiene una sesión abierta`
            });
        }

        // ✅ Continuar
        next();
    } catch (err) {
        console.error('Error en checkCashSession:', err);
        res.status(500).json({ message: 'Error al validar apertura de sesión de caja' });
    }
}

module.exports = checkCashSession;
