const sequelize = require('../../config/database');
const cashSessionRepository = require('../cashSession/cashSession.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper'); // ✅ agregado

class CashSessionService {
    // =====================
    // ABRIR SESIÓN
    // =====================
    async openSession(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const { cash_register_id, opening_balance, notes } = data;

            // Validar que no haya sesión abierta en esa caja
            const existing = await cashSessionRepository.findOpenByRegister(cash_register_id, currentUser.tenant_id);
            if (existing) throw new Error('Ya existe una sesión abierta en esta caja');

            const session = await cashSessionRepository.createSession({
                tenant_id: currentUser.tenant_id,
                store_id: currentUser.store_id,
                cash_register_id,
                user_id: currentUser.id,
                opening_balance: opening_balance || 0,
                notes,
                status: 'open'
            }, t);

            await t.commit();

            // 🔹 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'open',
                module: 'cash_sessions',
                description: `Apertura de caja ${cash_register_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Apertura de caja',
                message: `El usuario ${currentUser.username} abrió la caja ${cash_register_id} con un saldo inicial de $${opening_balance || 0}.`,
                type: 'system'
            });

            return session;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al abrir sesión: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // =====================
    // CERRAR SESIÓN
    // =====================
    async closeSession(id, data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const session = await cashSessionRepository.findById(id, currentUser.tenant_id);
            if (!session) throw new Error('Sesión no encontrada');
            if (session.status === 'closed') throw new Error('La sesión ya está cerrada');

            await cashSessionRepository.closeSession(session, {
                closed_at: new Date(),
                closing_balance: data.closing_balance,
                status: 'closed',
                notes: data.notes || session.notes
            }, t);

            await t.commit();

            // 🔹 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'close',
                module: 'cash_sessions',
                description: `Cierre de caja ${session.cash_register_id} con balance $${data.closing_balance}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación global
            const diff = parseFloat(data.closing_balance - session.opening_balance).toFixed(2);
            const diffText = diff >= 0 ? `(+${diff})` : `(${diff})`;

            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Cierre de caja',
                message: `La caja ${session.cash_register_id} fue cerrada con un balance de $${data.closing_balance}. Diferencia respecto a apertura: ${diffText}.`,
                type: 'system'
            });

            return session;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al cerrar sesión: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // =====================
    // DATATABLE
    // =====================
    async getDatatable(body, currentUser) {
        const draw   = parseInt(body.draw) || 1;
        const start  = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [
            null, 'id', 'status', 'opened_at', 'closed_at', 'opening_balance', 'closing_balance'
        ];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter = body['columns[2][search][value]'] || (body.columns?.[2]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await cashSessionRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new CashSessionService();
